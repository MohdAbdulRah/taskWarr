const express = require("express");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const cors = require("cors")

// Node-fetch CJS fix
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { pipeline } = require("@xenova/transformers");

const app = express();
app.use(express.json());
app.use(cors())

// Load embeddings model
let embedder;
(async () => {
  embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("✅ Embedding model loaded");
})();

// Cosine similarity helper
function cosineSim(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Convert Google Drive / GitHub links to direct/raw
function fixFileUrl(url) {
  // Google Drive view link → direct download
  if (url.includes("drive.google.com") && url.includes("/d/")) {
    const match = url.match(/\/d\/(.*?)\//);
    if (match) {
      const id = match[1];
      return `https://drive.google.com/uc?export=download&id=${id}`;
    }
  }

  // GitHub blob → raw
  if (url.includes("github.com") && url.includes("/blob/")) {
    return url.replace(
      "github.com",
      "raw.githubusercontent.com"
    ).replace("/blob/", "/");
  }

  return url;
}

// Extract text from PDF / DOCX / TXT / PY
async function extractText(fileUrl) {
  fileUrl = fixFileUrl(fileUrl);

  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (fileUrl.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (fileUrl.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (fileUrl.endsWith(".txt") || fileUrl.endsWith(".py")) {
    return buffer.toString("utf-8");
  }

  // fallback
  return buffer.toString("utf-8");
}

// Hybrid scoring: embeddings + keyword overlap
function hybridScore(taskText, fileText, fileEmbedding, taskEmbedding) {
  // 1. Embedding similarity
  const simScore = cosineSim(fileEmbedding.data, taskEmbedding.data);

  // 2. Keyword overlap (can adjust keywords for code vs resume etc.)
  let keywords = [];
  if (taskText.toLowerCase().includes("resume")) {
    keywords = ["experience", "skills", "education", "projects", "summary"];
  } else if (taskText.toLowerCase().includes(".py") || taskText.toLowerCase().includes("code")) {
    keywords = ["import", "def", "class", "return", "model", "predict"];
  }

  const taskLower = taskText.toLowerCase();
  const fileLower = fileText.toLowerCase();

  let keywordHits = 0;
  for (let kw of keywords) {
    if (fileLower.includes(kw) && taskLower.includes(kw)) keywordHits++;
  }
  const keywordScore = keywords.length ? keywordHits / keywords.length : 0;

  // Weighted sum (70% embeddings, 30% keywords)
  const finalScore = 0.7 * simScore + 0.3 * keywordScore;
  return Math.round(finalScore * 100);
}

app.post("/validate", async (req, res) => {
  try {
    const { fileUrl, taskTitle } = req.body;

    const fileText = await extractText(fileUrl);

    if (!fileText || fileText.trim().length < 20) {
      return res.json({
        score: 0,
        reason: "File text too short or invalid",
        preview: fileText.slice(0, 300),
      });
    }

    // Generate embeddings
    const taskEmbedding = await embedder(taskTitle, {
      pooling: "mean",
      normalize: true,
    });
    const fileEmbedding = await embedder(fileText, {
      pooling: "mean",
      normalize: true,
    });

    const score = hybridScore(taskTitle, fileText, fileEmbedding, taskEmbedding);

    res.json({
      score,
      reason: "Hybrid: embeddings + keyword overlap",
      preview: fileText.slice(0, 300),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
