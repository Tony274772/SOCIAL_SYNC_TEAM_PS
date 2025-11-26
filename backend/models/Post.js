const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2200,
    },
    mediaUrl: {
      type: String,
      trim: true,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'text'],
      default: 'text',
    },
    ownerId: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    ownerUsername: {
      type: String,
      trim: true,
      default: 'unknown_user',
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: {
      type: [String],
      default: [],
      validate: {
        validator: Array.isArray,
        message: 'likedBy must be an array',
      },
    },
    comments: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        author: {
          type: String,
          default: 'anonymous',
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
postSchema.index({ ownerId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
