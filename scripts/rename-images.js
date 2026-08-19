const fs = require("fs");
const path = require("path");
const { nameForSource } = require("./image-names");

const ROOT = path.join(__dirname, "..");
const IMAGE_DIR = path.join(ROOT, "data", "images");
const MAP_FILE = path.join(IMAGE_DIR, "image-map.json");

function main() {
  const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
  const entries = Object.entries(map);
  const used = new Set();
  const renames = [];
  entries.forEach(([source, oldName], index) => {
    const newName = nameForSource(source, path.extname(oldName), index + 1, used);
    if (newName !== oldName) renames.push({ source, oldName, newName });
  });

  // Two phases prevent a destination filename from colliding with a source
  // filename while the map is being migrated.
  const temp = [];
  for (const item of renames) {
    const oldPath = path.join(IMAGE_DIR, item.oldName);
    if (!fs.existsSync(oldPath)) continue;
    const temporary = `${item.oldName}.rename-temp-${process.pid}`;
    fs.renameSync(oldPath, path.join(IMAGE_DIR, temporary));
    temp.push({ ...item, temporary });
  }
  for (const item of temp) {
    fs.renameSync(path.join(IMAGE_DIR, item.temporary), path.join(IMAGE_DIR, item.newName));
    map[item.source] = item.newName;
  }
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));

  // site.css contains the one decorative image referenced outside generated
  // HTML. Keep it in sync with the migrated local filename.
  const cssFile = path.join(ROOT, "site.css");
  if (fs.existsSync(cssFile)) {
    let css = fs.readFileSync(cssFile, "utf8");
    for (const item of temp) css = css.split(`/assets/images/${item.oldName}`).join(`/assets/images/${item.newName}`);
    fs.writeFileSync(cssFile, css);
  }
  console.log(`Renamed ${temp.length} image files. Map: ${path.relative(ROOT, MAP_FILE)}`);
}

main();
