import express from 'express';
import { getAllProducts, getProductById, addProduct, updateProduct, deleteProduct, uploadFileProduct } from '../controllers/productController.js';
import { protectedMiddleware, ownerMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/uploadFileHandler.js';

const router = express.Router();
const baseURL = '/api/v1/product';

router.get(`${baseURL}/`, getAllProducts);
router.get(`${baseURL}/:id`, getProductById);
router.post(`${baseURL}/`, protectedMiddleware, ownerMiddleware, addProduct);
router.put(`${baseURL}/:id`, protectedMiddleware, ownerMiddleware, updateProduct);
router.delete(`${baseURL}/:id`, protectedMiddleware, ownerMiddleware, deleteProduct);
router.post(`${baseURL}/file-upload`, protectedMiddleware, ownerMiddleware, upload.single('image'), uploadFileProduct);

export default router;
