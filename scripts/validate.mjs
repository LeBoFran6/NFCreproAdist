import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const configPath = resolve(root, "config.json");

const errors = [];
const warnings = [];

let raw;
try {
  raw = await readFile(configPath, "utf8");
} catch {
  console.error("✗ config.json introuvable.");
  process.exit(1);
}

let config;
try {
  config = JSON.parse(raw.replace(/^\uFEFF/, ""));
} catch (error) {
  console.error("✗ config.json n'est pas un JSON valide :");
  console.error(`  ${error.message}`);
  process.exit(1);
}

if (!config || typeof config !== "object" || Array.isArray(config)) {
  errors.push("config.json doit contenir un objet JSON.");
} else {
  if (typeof config.url !== "string" || !config.url.trim()) {
    errors.push("Le champ « url » est obligatoire et doit être une chaîne.");
  } else {
    let url;
    try {
      url = new URL(config.url.trim());
    } catch {
      errors.push("Le champ « url » n'est pas une URL valide.");
    }

    if (url) {
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        errors.push("Le champ « url » doit commencer par https:// ou http://.");
      }
      if (url.username || url.password) {
        errors.push("Le champ « url » ne doit pas contenir d'identifiants (user:pass@).");
      }
      if (url.protocol === "http:") {
        warnings.push("La destination utilise http:// (non chiffré). Préfère https://.");
      }
      if (/(^|\.)example\.com$/i.test(url.hostname)) {
        warnings.push("La destination est encore https://example.com (lien provisoire).");
      }
    }
  }

  if ("enabled" in config && typeof config.enabled !== "boolean") {
    errors.push("Le champ « enabled » doit être true ou false.");
  }
  if ("forwardQuery" in config && typeof config.forwardQuery !== "boolean") {
    errors.push("Le champ « forwardQuery » doit être true ou false.");
  }
  if ("updatedAt" in config && (typeof config.updatedAt !== "string" || Number.isNaN(Date.parse(config.updatedAt)))) {
    errors.push("Le champ « updatedAt » doit être une date ISO valide (ex. 2026-10-26T12:00:00Z).");
  }
  if (config.enabled === false) {
    warnings.push("La redirection est désactivée (enabled: false).");
  }
}

let html = "";
try {
  html = await readFile(resolve(root, "index.html"), "utf8");
} catch {
  errors.push("index.html est introuvable.");
}

if (html) {
  const match = html.match(/const FALLBACK_URL = "([^"]+)";/);
  if (!match) {
    warnings.push("Je n'ai pas trouvé FALLBACK_URL dans index.html.");
  } else if (config && typeof config.url === "string" && match[1] !== config.url) {
    warnings.push("FALLBACK_URL (index.html) diffère de config.json : normal, il ne sert qu'en cas de panne.");
  }
}

for (const warning of warnings) console.warn(`! ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}

console.log("✓ config.json valide");
if (config) {
  console.log(`  Destination : ${config.url}`);
  console.log(`  Redirection : ${config.enabled === false ? "désactivée" : "activée"}`);
  console.log(`  Paramètres  : ${config.forwardQuery === true ? "transmis" : "non transmis"}`);
}
