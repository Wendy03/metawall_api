const Post = require('../models/posts');
const Comment = require('../models/comments');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const handleSuccess = require('../service/handleSuccess');

const posts = {
  getPosts: handleErrorAsync(async (req, res) => {
    const { keyword, sortby } = req.query;
    const search =
      keyword !== undefined ? { content: new RegExp(`${keyword}`) } : {};
    const sort = sortby === 'asc' ? 'createdAt' : '-createdAt';
    const posts = await Post.find(search)
      .populate({
        path: 'user',
        select: 'name photo ',
      })
      .sort(sort);
    handleSuccess(res, '取得資料', posts);
  }),
  getPost: handleErrorAsync(async (req, res) => {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    handleSuccess(res, '取得貼文', post);
  }),
  createPost: handleErrorAsync(async (req, res, next) => {
    const { content, image, createdAt } = req.body;
    if (content === '') {
      return appError(400, '欄位資料填寫不全', next);
    } else {
      const newPost = await Post.create({
        content,
        image,
        user: req.user.id,
        createdAt,
      });
      handleSuccess(res, '新增成功', newPost);
    }
  }),
  like: handleErrorAsync(async function (req, res, next) {
    const _id = req.params.id;
    await Post.findOneAndUpdate({ _id }, { $addToSet: { likes: req.user.id } });
    res.status(201).json({
      status: 'success',
      postId: _id,
      userId: req.user.id,
    });
  }),
  unlike: handleErrorAsync(async (req, res, next) => {
    const _id = req.params.id;
    await Post.findOneAndUpdate({ _id }, { $pull: { likes: req.user.id } });
    res.status(201).json({
      status: 'success',
      postId: _id,
      userId: req.user.id,
    });
  }),
  createComment: handleErrorAsync(async (req, res, next) => {
    const user = req.user.id;
    const post = req.params.id;
    const { comment } = req.body;
    const newComment = await Comment.create({
      post,
      user,
      comment,
    });
    res.status(201).json({
      status: 'success',
      data: {
        comments: newComment,
      },
    });
  }),
  getUserPost: handleErrorAsync(async (req, res, next) => {
    const user = req.params.id;
    const posts = await Post.find({ user }).populate({
      path: 'comments',
      select: 'comment user',
    });
    res.status(200).json({
      status: 'success',
      results: posts.length,
      posts,
    });
  }),
};

module.exports = posts;
