const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/users');
const { isAuth, generateSendJWT } = require('../service/auth');

router.post('/sign_up', UsersControllers.signUp);
router.post('/sign_in', UsersControllers.signIn);

router.get('/users', isAuth, UsersControllers.getUsers);
router.get('/user', isAuth, UsersControllers.getUser);
router.patch('/user/:id/edit', isAuth, UsersControllers.editUser);
router.patch(
  '/user/:id/updatePassword',
  isAuth,
  UsersControllers.updatePassword
);

router.get('/user/getLikes', isAuth, UsersControllers.getLikes);
router.post('/user/:id/follow', isAuth, UsersControllers.follow);
router.delete('/user/:id/unfollow', isAuth, UsersControllers.unfollow);
router.get('/user/following', isAuth, UsersControllers.getFollowing);

module.exports = router;
