import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";
import getStdin from "get-stdin";
import { program } from "commander";
import pino from "pino";
import dotenv from "dotenv";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import * as rotatingFileStream from "rotating-file-stream";
import { fileURLToPath } from "url";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import pg from "pg";

type UserPayloadType = {
  matricule: string;
  nom: string;
  prenom: string;
  dateDeNaissance: string;
  status: string;
};

dotenv.config();
const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logDirectory = path.resolve(__dirname, "logs");

if (!existsSync(logDirectory)) {
  mkdirSync(logDirectory);
}

const logStream = rotatingFileStream.createStream("app.log", {
  interval: "1d",
  path: logDirectory,
  size: "10M",
  compress: true,
  rotate: 5,
});

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      destination: 1,
    },
  },
});

program
  .name("excel-to-db")
  .description("CLI pour importer un fichier Excel dans PostgreSQL")
  .version("1.0.0");

program
  .command("import")
  .description("Importer un fichier Excel depuis stdin")
  .action(async () => {
    try {
      logger.info("Lecture des données depuis stdin...");
      const inputBuffer = await getStdin.buffer();

      if (!inputBuffer.length) {
        logger.error("Aucun fichier reçu en entrée !");
        process.exit(1);
      }

      logger.info("Parsing du fichier Excel...");
      const workbook = xlsx.read(inputBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      if (!data.length) {
        logger.error("Le fichier Excel est vide !");
        process.exit(1);
      }

      const processedData = data.map((row: any) => {
        return {
          matricule: String(row.matricule),
          nom: row.nom,
          prenom: row.prenom,
          dateDeNaissance: row.datedenaissance,
          status: row.status,
        };
      });

      logger.info(
        `Insertion de ${processedData.length} lignes dans la base de données...`
      );

      if (processedData.length === 0) {
        logger.warn("Aucune ligne valide à insérer.");
        process.exit(0);
      }

      // Intégration du traitement par lots (batch)
      const batchSize = 1000;

      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize);
        try {
          await prisma.user.createMany({ data: batch });
          logger.info(`Batch ${Math.floor(i / batchSize) + 1} inséré`);
        } catch (insertError: any) {
          if (insertError instanceof PrismaClientKnownRequestError) {
            if (insertError.code === "P2002") {
              logger.error(
                "Erreur : Violation de contrainte unique (duplicate key)."
              );
            } else if (insertError.code === "P2003") {
              logger.error("Erreur : Clé étrangère invalide.");
            } else {
              logger.error(`Erreur Prisma : ${insertError.message}`);
            }
          } else {
            logger.error(`Erreur inattendue : ${insertError.message}`);
          }

          logger.info("Tentative d'insertion via COPY...");

          // For node-postgress
          const client = new pg.Client({
            connectionString: process.env.DATABASE_URL,
          });

          await client.connect();

          try {
            // Créer un fichier CSV temporaire pour utiliser COPY
            const csvData = processedData.map((user) => [
              user.matricule,
              user.nom,
              user.prenom,
              user.dateDeNaissance,
              user.status,
            ]);

            const copyQuery = `
              COPY users(matricule, nom, prenom, date_de_naissance, status)
              FROM STDIN WITH CSV DELIMITER ',' HEADER;
            `;
            const csvString = csvData.map((row) => row.join(",")).join("\n");

            await client.query(copyQuery, [csvString]);

            logger.info("Importation réussie via COPY !");
            process.exit(0);
          } catch (copyError) {
            logger.error("Erreur lors de l'insertion avec COPY : ", copyError);
            process.exit(1);
          } finally {
            await client.end();
          }
        }
      }

      logger.info("Importation réussie !");
      process.exit(0);
    } catch (error: any) {
      logger.error(`Erreur: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

// Pour demarrer lancer ce script dans un environement de dévéloppement, faites:
// cat sample.xlsx | node --import tsx index.ts import
// où sample désigne le nom de fichier
