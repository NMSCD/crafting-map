const fs = require("fs");
const path = require("path");
const nodeFetch = require("node-fetch");

function mkdir(file) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  } catch (e) {}
}

function fileExists(name) {
  const file = path.normalize(`temps/${name}`);
  return fs.existsSync(file);
}

exports.fileExists = fileExists;
exports.mkdir = mkdir;

exports.fetchCached = async function fetchCached(url, name) {
  let file = path.normalize(`temps/${name}`);
  if (fileExists(name)) {
    return fs.readFileSync("./" + file);
  }
  mkdir(file);

  return await nodeFetch(url)
    .then((resp) => resp.text())
    .then((resp) => {
      console.log("fetched", file);
      fs.writeFileSync(file, resp);
      return resp;
    });
};

exports.fetchCachedImg = async function fetchCachedImg(url, name) {
  let file = path.normalize(`temps/${name}`);
  if (fileExists(name)) {
    return fs.readFileSync(file);
  }
  mkdir(file);

  return await nodeFetch(url).then((res) => res.body.pipe(fs.createWriteStream(file)));
};
