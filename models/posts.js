const mongoose = require('mongoose');
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Content 未填寫'],
    },
    image: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: [true, '貼文ID未填寫'],
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual('comments', {
  ref: 'comment',
  foreignField: 'post',
  localField: '_id',
});

const Post = mongoose.model('post', postSchema);
module.exports = Post;
