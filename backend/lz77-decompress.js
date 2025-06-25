const fs = require("fs");
const path = require("path");

function lz77Decompress(encoded) {
  const output = [];
  const triples = encoded.split("|");

  for (const triple of triples) {
    const [distStr, lenStr, char] = triple.split(",");
    const distance = parseInt(distStr);
    const length = parseInt(lenStr);

    const start = output.length - distance;
    for (let i = 0; i < length; i++) {
      output.push(output[start + i]);
    }

    if (char) output.push(char);
  }

  return output.join("");
}

function decompressLZ77File(filePath) {
  const encoded = fs.readFileSync(filePath, "utf-8");
  const decompressed = lz77Decompress(encoded);

  const base = path.basename(filePath, path.extname(filePath));
  const dir = path.dirname(filePath);
  const outputPath = path.join(dir, `${base}_decompressed.txt`);

  fs.writeFileSync(outputPath, decompressed);
  return outputPath;
}

module.exports = { decompressLZ77File };
