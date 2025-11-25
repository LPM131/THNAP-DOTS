/**
 * Full Project Backup Script
 * Creates timestamped ZIP files of your project
 * Stored in / .dev-safety / project-backups
 */

const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

const BACKUP_DIR = path.join(__dirname, "project-backups");
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const output = fs.createWriteStream(
  path.join(BACKUP_DIR, `backup-${timestamp}.zip`)
);

const archive = archiver("zip");

output.on("close", () => {
  console.log(`✔ Backup complete (${archive.pointer()} bytes)`);
});

archive.on("error", err => {
  throw err;
});

archive.pipe(output);

// EXCLUDED FILES/FOLDERS
archive.glob("**/*", {
  ignore: [
    "node_modules/**",
    ".dev-safety/project-backups/**",
    ".git/**"
  ]
});

archive.finalize();
