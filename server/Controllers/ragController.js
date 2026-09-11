import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { Document } from "@langchain/core/documents"; // <--- ADD THIS IMPORT
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION_NAME = "webmate_documents";

const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY || "",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, "../temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export const uploadAndVectorizePdf = async (req, res) => {
  let tempFilePath = null;
  try {
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file is required" });
    }

    if (!req.file.originalname.toLowerCase().endsWith(".pdf")) {
      return res.status(400).json({ success: false, message: "Only PDF files are allowed" });
    }

    const apiKey = req.user?.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: "Gemini API Key is required to generate embeddings" });
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "gemini-embedding-2",
      apiKey: apiKey,
    });

    try {
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "userId",
        field_schema: "keyword",
      });
    } catch (indexError) {
      // Index already exists
    }

    tempFilePath = path.join(tempDir, `${Date.now()}-${req.file.originalname}`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    const loader = new PDFLoader(tempFilePath);
    const rawDocs = await loader.load();

    if (!rawDocs || rawDocs.length === 0) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ success: false, message: "PDF file is empty or could not be read" });
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
    });
    const splitDocs = await textSplitter.splitDocuments(rawDocs);

    const userIdString = String(userId);

    // FIX: Wrap in proper LangChain Document instances
    const docsWithMetadata = splitDocs.map(
      (doc, index) =>
        new Document({
          pageContent: doc.pageContent,
          metadata: {
            userId: userIdString,
            fileName: req.file.originalname,
            chunkIndex: index,
            source: doc.metadata?.source || "uploaded_pdf",
          },
        })
    );

    console.log(`📤 [VECTOR UPLOAD] Storing ${docsWithMetadata.length} chunks into Qdrant for userId: "${userIdString}"`);

    await QdrantVectorStore.fromDocuments(docsWithMetadata, embeddings, {
      url: QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY || "",
      collectionName: COLLECTION_NAME,
    });

    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    return res.status(200).json({
      success: true,
      message: "PDF vectorized and stored successfully",
      chunksCount: docsWithMetadata.length,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error("PDF Ingestion Error:", error);

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.error("Error cleaning temp file:", e);
      }
    }

    if (error.message?.includes("Connection refused") || error.message?.includes("ECONNREFUSED")) {
      return res.status(503).json({
        success: false,
        message: "Qdrant service is not available. Please ensure Qdrant is running on " + QDRANT_URL,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload and vectorize PDF",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};