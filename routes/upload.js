const express = require('express');
const router = express.Router();
const upload = require('../service/image');
const uploadControllers = require('../controllers/upload');
const { isAuth, generateSendJWT } = require('../service/auth');

router.post('/', upload, isAuth, uploadControllers.uploadFile);

module.exports = router;
