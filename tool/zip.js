const fs = require("fs");
const JSZip = require("jszip");
const { version } = require("../package.json");

const root = __dirname + "/..";

const filenames = ["content.js", "content.css", "icon.png"];
function compress(suffix, manifest) {
  const zip = new JSZip();

  for (const filename of filenames) {
    zip.file(filename, fs.createReadStream(root + `/${filename}`));
  }
  zip.file("manifest.json", fs.createReadStream(root + `/${manifest}`));

  const zipFilename = `youtube-url-extension_${suffix}_${version}.zip`;

  zip
    .generateNodeStream({
      compression: "DEFLATE",
      streamFiles: true,
    })
    .pipe(fs.createWriteStream(zipFilename))
    .on("finish", () => console.log(zipFilename));
}

compress("chrome", "manifest.json");
compress("firefox", "manifest.v2.json");
