import React, { useState, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function App() {
  const [file, setFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionTime, setCompressionTime] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [message, setMessage] = useState("");

  const [lz77DecompFile, setLz77DecompFile] = useState(null);
const [lz77DecompContent, setLz77DecompContent] = useState("");
const [lz77DecompMessage, setLz77DecompMessage] = useState("");


  const [rleFile, setRleFile] = useState(null);
  const [rleMessage, setRleMessage] = useState("");

  const [rleDecompFile, setRleDecompFile] = useState(null);
  const [rleDecompContent, setRleDecompContent] = useState("");
  const [rleDecompMessage, setRleDecompMessage] = useState("");

  const [binFile, setBinFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [decompressedContent, setDecompressedContent] = useState("");
  const [decompMessage, setDecompMessage] = useState("");

  const [lz77File, setLz77File] = useState(null);
  const [lz77Message, setLz77Message] = useState("");

  const resultRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setOriginalSize((selected.size / 1024).toFixed(2));
    setCompressedSize(0);
    setCompressionTime(null);
    setShowChart(false);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/compress", formData, {
        responseType: "blob",
      });

      const zipBlob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${file.name.split(".")[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      const processingTime = response.headers["x-processing-time"];
      setCompressionTime(processingTime);

      setCompressedSize((zipBlob.size / 1024).toFixed(2));
      setShowChart(true);
      setMessage("✅ Compression successful!");
    } catch (err) {
      console.error("Compression failed", err);
      setMessage("❌ Compression failed.");
    }
  };

  const exportAsImage = async () => {
    const canvas = await html2canvas(resultRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("compression_report.pdf");
  };

  const chartData = {
    labels: ["Original", "Compressed"],
    datasets: [
      {
        label: "Size (KB)",
        data: [originalSize, compressedSize],
        backgroundColor: ["#60a5fa", "#34d399"],
      },
    ],
  };

  const handleBinChange = (e) => {
    setBinFile(e.target.files[0]);
    setDecompressedContent("");
    setDecompMessage("");
  };

  const handleJsonChange = (e) => {
    setJsonFile(e.target.files[0]);
    setDecompressedContent("");
    setDecompMessage("");
  };

  const handleDecompress = async () => {
    if (!binFile || !jsonFile) return alert("Please select both .bin and .json files.");

    const formData = new FormData();
    formData.append("compressedFile", binFile);
    formData.append("mappingFile", jsonFile);

    try {
      const response = await axios.post("http://localhost:5000/decompress", formData, {
        responseType: "blob",
      });

      const text = await response.data.text();
      setDecompressedContent(text);
      setDecompMessage("✅ Decompression successful!");
    } catch (err) {
      console.error("Decompression failed", err);
      setDecompMessage("❌ Decompression failed.");
    }
  };

  const downloadDecompressed = () => {
    if (!decompressedContent) return;

    const blob = new Blob([decompressedContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "decompressed.txt");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleRLECompress = async () => {
    if (!rleFile) return alert("Please select a file for RLE compression.");

    const formData = new FormData();
    formData.append("file", rleFile);

    try {
      const response = await axios.post("http://localhost:5000/compress-rle", formData, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "compressed_rle.txt");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setRleMessage("✅ RLE Compression successful!");
    } catch (err) {
      console.error("RLE Compression failed", err);
      setRleMessage("❌ RLE Compression failed.");
    }
  };

  const handleRLEDecompress = async () => {
    if (!rleDecompFile) return alert("Please select a .txt file to decompress.");

    const formData = new FormData();
    formData.append("file", rleDecompFile);

    try {
      const response = await axios.post("http://localhost:5000/decompress-rle", formData, {
        responseType: "blob",
      });

      const text = await response.data.text();
      setRleDecompContent(text);
      setRleDecompMessage("✅ RLE Decompression successful!");
    } catch (err) {
      console.error("RLE Decompression failed", err);
      setRleDecompMessage("❌ RLE Decompression failed.");
    }
  };

  const downloadRLEDecompressed = () => {
    if (!rleDecompContent) return;

    const blob = new Blob([rleDecompContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "decompressed_rle.txt");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleLZ77Compress = async () => {
  if (!lz77File) return alert("Please select a file for LZ77 compression.");

  const formData = new FormData();
  formData.append("file", lz77File);

  try {
    const response = await axios.post("http://localhost:5000/compress-lz77", formData, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "compressed_lz77.txt");
    document.body.appendChild(link);
    link.click();
    link.remove();

    setLz77Message("✅ LZ77 Compression successful!");
  } catch (err) {
    console.error("LZ77 Compression failed", err);
    setLz77Message("❌ LZ77 Compression failed.");
  }
};

const handleLZ77Decompress = async () => {
  if (!lz77DecompFile) return alert("Please select a file to decompress.");

  const formData = new FormData();
  formData.append("file", lz77DecompFile);

  try {
    const response = await axios.post("http://localhost:5000/decompress-lz77", formData, {
      responseType: "blob",
    });

    const text = await response.data.text();
    setLz77DecompContent(text);
    setLz77DecompMessage("✅ LZ77 Decompression successful!");
  } catch (err) {
    console.error("LZ77 Decompression failed", err);
    setLz77DecompMessage("❌ LZ77 Decompression failed.");
  }
};

const downloadLZ77Decompressed = () => {
  if (!lz77DecompContent) return;

  const blob = new Blob([lz77DecompContent], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "decompressed_lz77.txt");
  document.body.appendChild(link);
  link.click();
  link.remove();
};



  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">📦 File Compression Portal</h1>

      <div ref={resultRef} className="max-w-xl mx-auto bg-white rounded-lg p-6 shadow-md mb-12">
        <h2 className="text-xl font-semibold mb-4">Compress a File</h2>

        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 block w-full border rounded px-3 py-2"
        />

        {file && <p className="text-sm mb-2">📄 Original Size: {originalSize} KB</p>}

        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Compress File
        </button>

        {message && <p className="mt-4 text-lg">{message}</p>}

        {showChart && (
          <div className="mt-6">
            <Bar data={chartData} />
            <p className="mt-2 text-sm text-gray-600">
              Compression ratio: {(compressedSize / originalSize).toFixed(2)}
            </p>
            {compressionTime && (
              <p className="text-sm text-gray-600">
                ⏱️ Processing Time: {compressionTime} ms
              </p>
            )}
            <button
              onClick={exportAsImage}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              📄 Export as PDF
            </button>
          </div>
        )}
      </div>

      {/* Huffman Decompression */}
      <div className="max-w-xl mx-auto bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Decompress Files</h2>

        <input
          type="file"
          accept=".bin"
          onChange={handleBinChange}
          className="mb-4 block w-full border rounded px-3 py-2"
        />

        <input
          type="file"
          accept=".json"
          onChange={handleJsonChange}
          className="mb-4 block w-full border rounded px-3 py-2"
        />

        <button
          onClick={handleDecompress}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Decompress Files
        </button>

        {decompMessage && <p className="mt-4 text-lg">{decompMessage}</p>}

        {decompressedContent && (
          <div className="mt-4 p-4 bg-gray-100 rounded max-h-48 overflow-auto whitespace-pre-wrap">
            <h3 className="font-semibold mb-2">Decompressed Content Preview:</h3>
            <pre>{decompressedContent}</pre>

            <button
              onClick={downloadDecompressed}
              className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              💾 Download Decompressed File
            </button>
          </div>
        )}
      </div>

      {/* RLE Compression/Decompression */}
      <div className="max-w-xl mx-auto bg-white rounded-lg p-6 shadow-md mt-12">
        <h2 className="text-xl font-semibold mb-4">🌀 RLE Compression</h2>

        <input
          type="file"
          accept=".txt"
          onChange={(e) => {
            setRleFile(e.target.files[0]);
            setRleMessage("");
          }}
          className="mb-4 block w-full border rounded px-3 py-2"
        />

        <button
          onClick={handleRLECompress}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Compress using RLE
        </button>

        {rleMessage && <p className="mt-4 text-lg">{rleMessage}</p>}
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-lg p-6 shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">📂 RLE Decompression</h2>

        <input
          type="file"
          accept=".txt"
          onChange={(e) => {
            setRleDecompFile(e.target.files[0]);
            setRleDecompContent("");
            setRleDecompMessage("");
          }}
          className="mb-4 block w-full border rounded px-3 py-2"
        />

        <button
          onClick={handleRLEDecompress}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Decompress RLE File
        </button>

        {rleDecompMessage && <p className="mt-4 text-lg">{rleDecompMessage}</p>}

        {rleDecompContent && (
          <div className="mt-4 p-4 bg-gray-100 rounded max-h-48 overflow-auto whitespace-pre-wrap">
            <h3 className="font-semibold mb-2">Decompressed Output:</h3>
            <pre>{rleDecompContent}</pre>

            <button
              onClick={downloadRLEDecompressed}
              className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              💾 Download Decompressed File
            </button>
          </div>
        )}
      </div>

      {/* Algorithm Explanation */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg p-6 shadow-md mt-12 mb-12">
        <h2 className="text-2xl font-bold mb-4">📘 Algorithm Explanations</h2>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Huffman Coding</h3>
          <p className="text-gray-700">
            Huffman Coding is a lossless compression algorithm that assigns shorter binary codes
            to more frequent characters and longer codes to less frequent ones. It builds a binary
            tree based on character frequency and replaces each character with its corresponding
            binary code, significantly reducing file size for text with uneven character distributions.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-green-600 mb-2">Run-Length Encoding (RLE)</h3>
          <p className="text-gray-700">
            RLE compresses data by replacing sequences of the same character with a count followed
            by the character. For example, "AAAABBBCC" becomes "4A3B2C". It’s highly efficient for
            data containing lots of repeated characters, like images, logs, and simple text patterns.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-lg p-6 shadow-md mt-6">
  <h2 className="text-xl font-semibold mb-4">🧩 LZ77 Compression</h2>

  <input
    type="file"
    accept=".txt"
    onChange={(e) => {
      setLz77File(e.target.files[0]);
      setLz77Message("");
    }}
    className="mb-4 block w-full border rounded px-3 py-2"
  />

  <button
    onClick={handleLZ77Compress}
    className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
  >
    Compress using LZ77
  </button>

  {lz77Message && <p className="mt-4 text-lg">{lz77Message}</p>}
</div>

<div className="max-w-xl mx-auto bg-white rounded-lg p-6 shadow-md mt-6">
  <h2 className="text-xl font-semibold mb-4">📂 LZ77 Decompression</h2>

  <input
    type="file"
    accept=".txt"
    onChange={(e) => {
      setLz77DecompFile(e.target.files[0]);
      setLz77DecompContent("");
      setLz77DecompMessage("");
    }}
    className="mb-4 block w-full border rounded px-3 py-2"
  />

  <button
    onClick={handleLZ77Decompress}
    className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
  >
    Decompress LZ77 File
  </button>

  {lz77DecompMessage && <p className="mt-4 text-lg">{lz77DecompMessage}</p>}

  {lz77DecompContent && (
    <div className="mt-4 p-4 bg-gray-100 rounded max-h-48 overflow-auto whitespace-pre-wrap">
      <h3 className="font-semibold mb-2">Decompressed Output:</h3>
      <pre>{lz77DecompContent}</pre>

      <button
        onClick={downloadLZ77Decompressed}
        className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
      >
        💾 Download Decompressed File
      </button>
    </div>
  )}
</div>
 
    </div>
  );
}
