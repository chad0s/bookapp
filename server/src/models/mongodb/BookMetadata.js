const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
  user_email: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const bookMetadataSchema = new mongoose.Schema({
  book_id: {
    type: Number,
    required: true,
    unique: true,
  },
  reviews: [reviewSchema],
  average_rating: {
    type: Number,
    default: 0,
  },
  total_reviews: {
    type: Number,
    default: 0,
  },
  tags: [String],
  view_count: {
    type: Number,
    default: 0,
  },
});

// Calculate average rating before saving
bookMetadataSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.average_rating = sum / this.reviews.length;
    this.total_reviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model("BookMetadata", bookMetadataSchema);
