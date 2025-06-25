const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const zip = require("express-zip");
const { rleCompress, rleDecompress } = require("./rle");

const { huffmanCompress, huffmanDecompress } = require("./huffman");

const app = express();
app.use(cors());
app.use(express.json());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post("/compress", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const filename = path.parse(req.file.originalname).name;

  try {
    const start = Date.now(); // Start timing
    const result = huffmanCompress(filePath);
    const end = Date.now();   // End timing
    const duration = end - start;

    res.setHeader("X-Processing-Time", duration); // Header sent to frontend

    res.zip([
      { path: result.compressedPath, name: `${filename}.bin` },
      { path: result.mappingPath, name: `${filename}.json` },
    ]);
  } catch (err) {
    console.error("❌ Compression failed:", err);
    res.status(500).json({ error: "Compression failed." });
  }
});



// Decompression endpoint: accepts two files - .bin and .json
const decompressUpload = upload.fields([
  { name: "compressedFile", maxCount: 1 },
  { name: "mappingFile", maxCount: 1 },
]);

app.post("/decompress", decompressUpload, (req, res) => {
  try {
    if (
      !req.files ||
      !req.files.compressedFile ||
      !req.files.mappingFile ||
      req.files.compressedFile.length === 0 ||
      req.files.mappingFile.length === 0
    ) {
      return res.status(400).json({ error: "Both .bin and .json files are required." });
    }

    const compressedPath = req.files.compressedFile[0].path;
    const mappingPath = req.files.mappingFile[0].path;

    const originalData = huffmanDecompress(compressedPath, mappingPath);

    // Send original file as a downloadable attachment (txt)
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${path.parse(req.files.mappingFile[0].originalname).name}_decompressed.txt`
    );
    res.setHeader("Content-Type", "text/plain");
    res.send(originalData);
  } catch (err) {
    console.error("❌ Decompression failed:", err);
    res.status(500).json({ error: "Decompression failed." });
  }
});

app.listen(5000, () => {
  console.log("✅ Server is running on http://localhost:5000");
});

app.post("/compress-rle", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  try {
    const result = rleCompress(filePath);
    res.download(result.compressedPath, (err) => {
      if (err) {
        console.error("❌ RLE Compression download error:", err);
        res.status(500).json({ error: "Download failed." });
      }
    });
  } catch (err) {
    console.error("❌ RLE Compression failed:", err);
    res.status(500).json({ error: "Compression failed." });
  }
});

app.post("/decompress-rle", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  try {
    const result = rleDecompress(filePath);
    res.setHeader("Content-Disposition", `attachment; filename=decompressed_rle.txt`);
    res.setHeader("Content-Type", "text/plain");
    res.send(result);
  } catch (err) {
    console.error("❌ RLE Decompression failed:", err);
    res.status(500).json({ error: "Decompression failed." });
  }
});


const { compressLZ77File } = require("./lz77");

app.post("/compress-lz77", upload.single("file"), (req, res) => {
  const filePath = req.file.path;

  try {
    const start = Date.now();
    const outputPath = compressLZ77File(filePath);
    const duration = Date.now() - start;

    res.setHeader("X-Processing-Time", duration);
    res.download(outputPath);
  } catch (err) {
    console.error("❌ LZ77 compression failed:", err);
    res.status(500).json({ error: "LZ77 compression failed." });
  }
});
const { decompressLZ77File } = require("./lz77-decompress");

app.post("/decompress-lz77", upload.single("file"), (req, res) => {
  const filePath = req.file.path;

  try {
    const start = Date.now();
    const outputPath = decompressLZ77File(filePath);
    const duration = Date.now() - start;

    res.setHeader("X-Processing-Time", duration);
    res.download(outputPath);
  } catch (err) {
    console.error("❌ LZ77 decompression failed:", err);
    res.status(500).json({ error: "LZ77 decompression failed." });
  }
});


