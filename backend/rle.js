const fs = require("fs");
const path = require("path");

// Encode data using RLE
function rleCompress(inputPath) {
  const data = fs.readFileSync(inputPath, "utf-8");

  if (!data || data.length === 0) throw new Error("Empty file");

  let encoded = "";
  let count = 1;

  for (let i = 1; i <= data.length; i++) {
    if (data[i] === data[i - 1]) {
      count++;
    } else {
      encoded += count + data[i - 1];
      count = 1;
    }
  }

  const base = path.basename(inputPath, path.extname(inputPath));
  const dir = path.dirname(inputPath);
  const compressedPath = path.join(dir, `${base}_rle.txt`);

  fs.writeFileSync(compressedPath, encoded);
  return { compressedPath };
}

// Decode data using RLE
function rleDecompress(inputPath) {
  const encoded = fs.readFileSync(inputPath, "utf-8");

  if (!encoded || encoded.length === 0) throw new Error("Empty file");

  let decoded = "";
  let num = "";

  for (const char of encoded) {
    if (!isNaN(char)) {
      num += char;
    } else {
      decoded += char.repeat(parseInt(num));
      num = "";
    }
  }

  return decoded;
}

module.exports = { rleCompress, rleDecompress };
