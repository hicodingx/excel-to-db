import fs from "node:fs";
import path from "node:path";

function fixImports(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImports(fullPath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(fullPath, "utf8");

      // Corrige uniquement les imports relatifs (./ ou ../), sans toucher aux modules npm
      content = content.replace(
        /from\s+["'](\.?\.\/[^"']+)["']/g,
        'from "$1.js"'
      );

      fs.writeFileSync(fullPath, content);
    }
  });
}

// Lancer la correction sur le dossier `dist`
fixImports("dist");
