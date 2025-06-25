const fs = require("fs");
const path = require("path");

function buildFrequencyMap(data) {
  const map = {};
  for (const char of data) {
    map[char] = (map[char] || 0) + 1;
  }
  return map;
}

function buildHuffmanTree(freqMap) {
  const pq = Object.entries(freqMap).map(([char, freq]) => ({
    char,
    freq,
    left: null,
    right: null,
  }));

  while (pq.length > 1) {
    pq.sort((a, b) => a.freq - b.freq);
    const left = pq.shift();
    const right = pq.shift();
    pq.push({
      char: null,
      freq: left.freq + right.freq,
      left,
      right,
    });
  }

  return pq[0];
}

function generateCodes(node, prefix = "", codeMap = {}) {
  if (!node) return;
  if (node.char !== null) {
    codeMap[node.char] = prefix;
  }
  generateCodes(node.left, prefix + "0", codeMap);
  generateCodes(node.right, prefix + "1", codeMap);
  return codeMap;
}

function encode(data, codeMap) {
  return data.split("").map((char) => codeMap[char]).join("");
}

function writeBinaryFile(encoded, outputPath) {
  const buffer = Buffer.alloc(Math.ceil(encoded.length / 8));
  for (let i = 0; i < encoded.length; i += 8) {
    const byte = encoded.slice(i, i + 8);
    buffer[i / 8] = parseInt(byte.padEnd(8, "0"), 2);
  }
  fs.writeFileSync(outputPath, buffer);
}

function huffmanCompress(inputPath) {
  const data = fs.readFileSync(inputPath, "utf-8");

  if (!data || data.length === 0) throw new Error("Empty file");

  const freqMap = buildFrequencyMap(data);
  const tree = buildHuffmanTree(freqMap);
  const codeMap = generateCodes(tree);
  const encoded = encode(data, codeMap);

  const base = path.basename(inputPath, path.extname(inputPath));
  const dir = path.dirname(inputPath);

  const compressedPath = path.join(dir, `${base}.bin`);
  const mappingPath = path.join(dir, `${base}.json`);

  writeBinaryFile(encoded, compressedPath);
  fs.writeFileSync(mappingPath, JSON.stringify(codeMap));

  return { compressedPath, mappingPath };
}

// Decode binary string to original text using codeMap
function decode(encodedStr, codeMap) {
  // Reverse map: code -> char
  const reverseCodeMap = {};
  for (const char in codeMap) {
    reverseCodeMap[codeMap[char]] = char;
  }

  let decoded = "";
  let buffer = "";

  for (const bit of encodedStr) {
    buffer += bit;
    if (reverseCodeMap[buffer]) {
      decoded += reverseCodeMap[buffer];
      buffer = "";
    }
  }
  return decoded;
}

// Read binary file and convert to bit string
function readBinaryFileAsBitString(filePath) {
  const buffer = fs.readFileSync(filePath);
  let bitStr = "";
  for (const byte of buffer) {
    bitStr += byte.toString(2).padStart(8, "0");
  }
  return bitStr;
}

function huffmanDecompress(compressedPath, mappingPath) {
  const codeMap = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));
  const encodedStr = readBinaryFileAsBitString(compressedPath);

  // Decode original text
  const originalData = decode(encodedStr, codeMap);
  return originalData;
}

module.exports = { huffmanCompress, huffmanDecompress };
