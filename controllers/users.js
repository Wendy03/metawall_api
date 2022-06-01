const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/users');
const Post = require('../models/posts');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const handleSuccess = require('../service/handleSuccess');
const { isAuth, generateSendJWT } = require('../service/auth');

const users = {
  signUp: handleErrorAsync(async (req, res, next) => {
    let { email, password, name } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return appError('400', '帳號已被註冊，請替換新的 Email！', next);
    }
    // 內容不可為空
    if (!email || !password || !name) {
      return appError('400', '欄位未填寫正確！', next);
    }
    // 暱稱 2 碼以上
    if (!validator.isLength(name, { min: 2 })) {
      return appError('400', '暱稱至少 2 個字元以上', next);
    }
    // 密碼 8 碼以上
    if (!validator.isLength(password, { min: 8 })) {
      return appError('400', '密碼需至少 8 碼以上，並中英混合', next);
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return appError('400', 'Email 格式不正確', next);
    }

    // 加密密碼
    password = await bcrypt.hash(req.body.password, 12);
    const newUser = await User.create({
      email,
      password,
      name,
    });
    generateSendJWT(newUser, 201, res);
  }),
  signIn: handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return appError(400, '帳號密碼不可為空', next);
    }
    const user = await User.findOne({ email }).select('+password');
    const auth = await bcrypt.compare(password, user.password);
    if (!auth || !user) {
      return appError(400, '帳號或密碼錯誤，請重新輸入！', next);
    }
    generateSendJWT(user, 200, res);
  }),
  getUsers: handleErrorAsync(async (req, res) => {
    const users = await User.find();
    handleSuccess(res, '取得使用者資料', users);
  }),
  getUser: handleErrorAsync(async (req, res) => {
    const currentUserId = req.user.id;
    const users = await User.findById(currentUserId);
    handleSuccess(res, '取得使用者資料', users);
  }),
  editUser: handleErrorAsync(async (req, res, next) => {
    if (req.user.id !== req.params.id) {
      return appError(401, '你沒有權限', next);
    } else {
      const { name, gender, photo } = req.body;
      const id = req.params.id;
      if (!name) {
        return appError(400, '欄位資料填寫不全', next);
      } else {
        const editUser = await User.findByIdAndUpdate(
          id,
          {
            name,
            gender,
            photo,
          },
          { new: true }
        );
        if (!editUser) {
          return appError(400, '編輯失敗', next);
        } else {
          const users = await User.find();
          handleSuccess(res, '編輯使用者', users);
        }
      }
    }
  }),
  updatePassword: handleErrorAsync(async (req, res, next) => {
    if (req.user.id !== req.params.id) {
      return appError(401, '你沒有權限', next);
    } else {
      const { password, confirmPassword } = req.body;
      if (!validator.isLength(password, { min: 8 })) {
        return appError('400', '密碼需至少 8 碼以上，並中英混合', next);
      }
      if (password !== confirmPassword) {
        return appError('400', '密碼不一致！', next);
      }
      newPassword = await bcrypt.hash(password, 12);
      const user = await User.findByIdAndUpdate(req.user.id, {
        password: newPassword,
      });
      generateSendJWT(user, 200, res);
    }
  }),
  getLikes: handleErrorAsync(async (req, res, next) => {
    const likeList = await Post.find({
      likes: { $in: [req.user.id] },
    }).populate({
      path: 'user',
      select: 'name _id',
    });
    handleSuccess(res, '取得 LikeList', likeList);
  }),
  follow: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return next(appError(401, '您無法追蹤自己', next));
    }
    await User.updateOne(
      {
        _id: req.user.id,
        'following.user': { $ne: req.params.id },
      },
      {
        $addToSet: { following: { user: req.params.id } },
      }
    );
    await User.updateOne(
      {
        _id: req.params.id,
        'followers.user': { $ne: req.user.id },
      },
      {
        $addToSet: { followers: { user: req.user.id } },
      }
    );
    res.status(200).json({
      status: 'success',
      message: '您已成功追蹤！',
    });
  }),
  unfollow: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return next(appError(401, '您無法取消追蹤自己', next));
    }
    await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $pull: { following: { user: req.params.id } },
      }
    );
    await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $pull: { followers: { user: req.user.id } },
      }
    );
    res.status(200).json({
      status: 'success',
      message: '您已成功取消追蹤！',
    });
  }),
  getFollowing: handleErrorAsync(async (req, res, next) => {
    const currentUserId = req.user.id;
    const followingList = await User.findById(currentUserId).populate({
      path: 'following.user',
      select: 'name',
    });
    handleSuccess(res, '取得 following', followingList);
  }),
};

module.exports = users;
