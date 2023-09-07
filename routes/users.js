const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/users');
const { isAuth } = require('../service/auth');

router.post('/sign_up', UsersControllers.signUp);
router.post('/sign_in', UsersControllers.signIn);
router.get('/user', isAuth, UsersControllers.getUser);
router.patch('/user/edit', isAuth, UsersControllers.editUser);
router.patch('/user/update_password', isAuth, UsersControllers.updatePassword);

router.get('/user/getLikes', isAuth, UsersControllers.getLikes);
router.post('/user/:id/follow', isAuth, UsersControllers.follow);
router.delete('/user/:id/unfollow', isAuth, UsersControllers.unfollow);
router.get('/user/following', isAuth, UsersControllers.getFollowing);

module.exports = router;
