const path = require("path");
const fs = require("fs");
const { mkdir } = require("./utils.js");

exports.main = function main() {
  const dir = fs.readdirSync(path.join(__dirname, "temps"), { withFileTypes: true });

  dir.forEach((file) => {
    if (file.name.match(/^[A-Z].*\.png$/)) {
      const newName = file.name.toLowerCase().replaceAll(" ", "_");
      // console.log(file.name, newName);

      const oldPath = path.join(__dirname, "temps", file.name);
      const newPath = path.join(__dirname, "temps", "out", newName);
      mkdir(newPath);

      fs.copyFileSync(oldPath, newPath);
    }
  });

  fs.renameSync(path.join(__dirname, "new_data.json"), path.join(__dirname, "../" + "data.json"));

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../" + "data.json")));
  data.nodes.forEach((n) => {
    const destImage = path.join(__dirname, "../../" + n.image);
    if (!fs.existsSync(destImage)) {
      try {
        fs.copyFileSync(path.join(__dirname, "temps", "out", n.image), destImage);
      } catch (e) {
        console.error("error cpyt", n.name);
      }
    }
  });
};
