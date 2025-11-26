const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    followers: {
      type: [String],
      default: [],
      validate: {
        validator: Array.isArray,
        message: 'Followers must be an array',
      },
    },
    following: {
      type: [String],
      default: [],
      validate: {
        validator: Array.isArray,
        message: 'Following must be an array',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ userId: 1 });

module.exports = mongoose.model('User', userSchema);
