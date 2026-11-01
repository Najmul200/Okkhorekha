import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, trim: true, maxlength: 140, index: true },
    projectTitle: { type: String, required: true, trim: true, maxlength: 160 },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    text: { type: String, required: true, trim: true, minlength: 8, maxlength: 1200 },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);