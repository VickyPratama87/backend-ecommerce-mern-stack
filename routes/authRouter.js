import express from 'express';
import { registerUser, loginUser, getCurrentUser, logoutUser } from '../controllers/authController.js';
import { protectedMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const baseURL = '/api/v1/auth';

router.post(`${baseURL}/register`, registerUser);
router.post(`${baseURL}/login`, loginUser);
router.get(`${baseURL}/logout`, protectedMiddleware, logoutUser);
router.get(`${baseURL}/getuser`, protectedMiddleware, getCurrentUser);

export default router;
