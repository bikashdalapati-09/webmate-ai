import express from "express";
import multer from "multer";
import { isAuth } from "../Middleware/isAuth.js";
import { deletePdf, uploadAndVectorizePdf } from "../Controllers/ragController.js";

const ragRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

ragRouter.post("/upload-pdf", isAuth, upload.single("pdf"), uploadAndVectorizePdf);
ragRouter.delete("/delete-pdf/:userId", isAuth, deletePdf);

export default ragRouter;