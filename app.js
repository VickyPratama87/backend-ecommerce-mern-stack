import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuration
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(ExpressMongoSanitize());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(morgan('dev'));

// Endpoints
app.use(router.authRouter);
app.use(router.productRouter);
app.use(router.orderRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(port, () => {
	console.log(`Server up and running on port ${port}`);
});

// Connect to MongoDB
mongoose.connect(process.env.DATABASE, {}).then(() => {
	console.log('Connected to MongoDB');
});
