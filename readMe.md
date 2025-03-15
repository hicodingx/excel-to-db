# Excel to Database CLI

Ce projet est une application CLI permettant d'importer des données depuis un fichier Excel (ex : `users.xlsx`) vers une base de données PostgreSQL. Il est conçu pour être utilisé sous Linux et prend l'entrée via **stdin** (entrée standard), avec les logs gérés via **pino**.

## Prérequis

- Node.js (>= 16.x)
- Une base de données relationnelle (Postgres, MySQL)
- npm (recommandé)

## Installation

1. **Cloner le projet :**

   ```sh
   git clone https://github.com/hicodingx/excel-to-db.git
   cd excel-to-db
   ```

2. **Configurer l’environnement**

   Créez un fichier **.env** à la racine du projet et y ajoutez les informations suivantes :

   ```ini
   DATABASE_URL="postgresql://user:password@localhost:5432/nom_de_la_db"
   NODE_ENV=production
   ```

   **Remarque** : Assurez-vous que votre base de données est correctement accessible à l'adresse fournie. Vous pouvez tester cela par : `psql postgresql://user:password@localhost:5432/nom_de_la_db` (pour le cas postgres). Dans le code ci-dessus, nous avons utiliser une base de données postgres. Vous n'y êtes absolument pas contraint. Vous pouvez utiliser n'importe quel RDBMS de votre choix.

   - `user` : nom d'utilisateur de votre base de données.
   - `password` : mot de passe utilisé lors de la création de la base de données.
   - `localhost` : nom d'hôte ou adresse IP de l'instance PostgreSQL.
   - `nom_de_la_db` : nom de votre base de données.

   Ces informations vous seront fournies lors de la création de votre base de données, que ce soit chez un fournisseur ou en local.

3. **Installer les dépendances :**

   ```sh
   npm install
   ```

   :chart: **_Cette étape déclenche automatiquement la migration et la génération du client Prisma grâce à_ :**

   ```json
   "postinstall": "npx prisma migrate deploy && npx prisma generate"
   ```

## Exécution

Vous avez **deux méthodes** pour importer un fichier Excel.

### :chart: Option 1 (Méthode Simplifiée)

1. Placez votre fichier Excel dans le dossier `src/` et renommez-le en `sample.xlsx`.
2. Exécutez la commande suivante :

   ```sh
   npm run import
   ```

   :chart: **Avantage** : Simple et rapide.

### :chart: Option 2 (Méthode Manuelle)

1. Placez votre fichier n'importe où sur votre machine.
2. Exécutez la commande suivante :

   ```sh
   cat chemin/vers/monfichier.xlsx | node --import tsx index.ts import
   ```

   :warning: **Attention** : Le nom du fichier ne doit pas contenir d’espace.

   :chart: **Avantage** : Permet d'importer n'importe quel fichier sans avoir besoin de le renommer.

### :scroll: Logs

Tous les `logs` sont stockés dans le dossier `/logs/` et sont gérés avec `pino`.
