import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import Review from './models/Review.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('This website is not allowed to access the API.'));
    },
  })
);
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many review submissions. Please try again later.' },
});

app.get('/api/reviews/:projectId', async (request, response, next) => {
  try {
    const reviews = await Review.find({ projectId: request.params.projectId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('name text rating projectTitle createdAt')
      .lean();
    response.json(reviews);
  } catch (error) {
    next(error);
  }
});

app.post('/api/reviews/:projectId', reviewLimiter, async (request, response, next) => {
  try {
    const projectId = request.params.projectId.trim();
    const { name, text, rating, projectTitle } = request.body;
    if (!/^[a-z0-9:-]{1,140}$/i.test(projectId)) {
      return response.status(400).json({ message: 'Invalid project identifier.' });
    }

    const review = await Review.create({ projectId, projectTitle, name, text, rating });
    return response.status(201).json(review);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return response.status(400).json({ message: 'Please check the review fields and try again.' });
    }
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error.message);
  response.status(500).json({ message: 'The server could not complete this request.' });
});

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. Copy server/.env.example to server/.env.');
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`Akkhorekha API listening on port ${port}`));
} catch (error) {
  console.error(`API startup failed: ${error.message}`);
  process.exitCode = 1;
}