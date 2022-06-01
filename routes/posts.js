const express = require('express');
const router = express.Router();
const PostsControllers = require('../controllers/posts');
const { isAuth, generateSendJWT } = require('../service/auth');

router.get('/posts', isAuth, PostsControllers.getPosts);
router.get('/post/:id', isAuth, PostsControllers.getPost);
router.post('/post', isAuth, PostsControllers.createPost);

router.post('/post/:id/like', isAuth, PostsControllers.like);
router.delete('/post/:id/unlike', isAuth, PostsControllers.unlike);

router.post('/post/:id/comment', isAuth, PostsControllers.createComment);

//取得個人所有貼文列表
router.get('/post/user/:id', isAuth, PostsControllers.getUserPost);

module.exports = router;
