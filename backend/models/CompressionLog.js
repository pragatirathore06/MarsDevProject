const mongoose = require("mongoose");

const compressionLogSchema = new mongoose.Schema({
  filename: String,
  originalSizeKB: Number,
  compressedSizeKB: Number,
  algorithm: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CompressionLog", compressionLogSchema);
