import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { mongo } from '../db/mongo';
import { ObjectId } from 'mongodb';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), (req, res, next) => {
  (async () => {
    if (!req.file) return res.status(400).send('No file uploaded');

    const image = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date()
    };

    const result = await mongo.collection('images').insertOne(image);
    res.status(201).json({ id: result.insertedId });
  })().catch(next);
});

router.get('/:id', (req, res, next) => {
  (async () => {
    try {
      const image = await mongo.collection('images').findOne({
        _id: new ObjectId(req.params.id)
      });

      if (!image) return res.status(404).send('Image not found');

      const fullPath = path.resolve(image.path);
      if (!fs.existsSync(fullPath)) return res.status(404).send('File not found');

      res.setHeader('Content-Type', image.mimeType);
      res.sendFile(fullPath);
    } catch (err) {
      res.status(400).send('Invalid ID');
    }
  })().catch(next);
});

export default router;
