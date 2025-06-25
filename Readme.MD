# Data Compression & Decompression Portal

##  Project Description

This is a full-stack web application that allows users to upload files and apply data compression algorithms such as **Huffman Coding** and **Run-Length Encoding (RLE)** to reduce file size. It also supports decompression of previously compressed files and visualizes compression efficiency through statistics and charts. The project is designed for educational and practical demonstration of how different lossless compression techniques work.

---

##  Features

*  **File Upload**: Supports uploading text, image, and binary files
*  **Compression Algorithms**:

  * Huffman Coding
  * Run-Length Encoding (RLE)
* **Decompression Support**: Handles decompression of `.bin + .json` and `.txt` compressed formats
*  **Compression Statistics**: Shows original vs compressed size, compression ratio, and processing time
*  **Visualization**: Displays compression comparison using a bar chart (Chart.js)
*  **PDF Export**: Generate and download a PDF report of compression stats and charts
*  **Algorithm Explanation**: Brief explanations of Huffman and RLE for user learning
*  **Error Handling**: Smart feedback for unsupported files or failed decompressions
*  **Responsive Design**: Clean UI with Tailwind CSS and React.js

---

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Chart.js (for graph visualization)
* jsPDF + html2canvas (PDF export)

### Backend

* Node.js
* Express.js
* multer (file uploads)
* Custom modules for Huffman & RLE compression

### Optional (skipped)

* MongoDB (for compression logs) — *skipped in this version*

---

##  How to Run Locally

### ✈ Prerequisites:

* Node.js v18+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/compression-portal.git
cd compression-portal
```

### 2. Start Backend

```bash
cd backend
npm install
node index.js
```

### 3. Start Frontend

```bash
cd ../frontend
npm install
npm start
```

### Open

```
http://localhost:3000
```

---

##  Live Demo

> https://mars-dev-project.vercel.app/

---

##  Demo Video

> [Google Drive / YouTube Demo Link](https://your-demo-video-url)

---

##  Author

Made with  by **Pragati Rathore**
Batch 2026, Mechanical Engineering, IIT Roorkee

---

##  Plagiarism Disclaimer
This project is built from scratch using original logic, open-source packages, and custom algorithms. Any resemblance to public repositories is coincidental or due to use of widely known compression logic.﻿# MarsDevProject
