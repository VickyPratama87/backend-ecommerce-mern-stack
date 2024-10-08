import express from 'express';
import { createOrder, getAllOrders, getOrderById, currentUserOrder, callbackPayment } from '../controllers/OrderController.js';
import { protectedMiddleware, ownerMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const baseURL = '/api/v1/order';

router.post(`${baseURL}/`, protectedMiddleware, createOrder);
router.get(`${baseURL}/`, protectedMiddleware, ownerMiddleware, getAllOrders);
router.get(`${baseURL}/:id`, protectedMiddleware, ownerMiddleware, getOrderById);
router.get(`${baseURL}/current/user`, protectedMiddleware, currentUserOrder);
router.post(`${baseURL}/callback/midtrans`, callbackPayment);

export default router;
