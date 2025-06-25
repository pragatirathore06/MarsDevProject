const fs = require("fs");
const path = require("path");

function lz77Compress(input) {
  const windowSize = 20;
  const bufferSize = 15;
  const output = [];

  for (let i = 0; i < input.length;) {
    let matchLength = 0;
    let matchDistance = 0;

    const start = Math.max(0, i - windowSize);
    const searchWindow = input.slice(start, i);
    const lookAheadBuffer = input.slice(i, i + bufferSize);

    for (let j = 0; j < searchWindow.length; j++) {
      let length = 0;
      while (
        length < lookAheadBuffer.length &&
        searchWindow[j + length] === lookAheadBuffer[length]
      ) {
        length++;
      }

      if (length > matchLength) {
        matchLength = length;
        matchDistance = searchWindow.length - j;
      }
    }

    const nextChar = lookAheadBuffer[matchLength] || "";
    output.push([matchDistance, matchLength, nextChar]);
    i += matchLength + 1;
  }

  return output;
}

function compressLZ77File(filePath) {
  const data = fs.readFileSync(filePath, "utf-8");
  const compressed = lz77Compress(data);

  const base = path.basename(filePath, path.extname(filePath));
  const dir = path.dirname(filePath);
  const outputPath = path.join(dir, `${base}_lz77.txt`);

  const encoded = compressed.map(triple => triple.join(",")).join("|");
  fs.writeFileSync(outputPath, encoded);

  return outputPath;
}

module.exports = { compressLZ77File };
