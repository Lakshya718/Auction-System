import express from 'express';
import upload from '../utils/multer.js';
import { register, login, getProfile, logout, updateProfile } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', upload.single('teamLogo'), register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('profilePicture'), updateProfile);

export default router;
