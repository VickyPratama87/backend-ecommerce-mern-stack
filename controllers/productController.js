import Product from '../models/productModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

export const getAllProducts = asyncHandler(async (req, res) => {
	// Filtering
	const queryObj = { ...req.query };
	const excludeField = ['page', 'limit', 'name'];
	excludeField.forEach((el) => delete queryObj[el]);

	// Searching
	let query;
	if (req.query.name) {
		query = Product.find({
			name: { $regex: req.query.name, $options: 'i' },
		});
	} else {
		query = Product.find(queryObj);
	}

	// Pagination
	const page = parseInt(req.query.page) || 1;
	// const limitData = parseInt(req.query.limit) || 10;
	const limitData = parseInt(req.query.limit) || 3;
	const skipData = (page - 1) * limitData;

	query = query.skip(skipData).limit(limitData);

	let countProduct = await Product.countDocuments(queryObj);
	if (req.query.page) {
		if (skipData >= countProduct) {
			res.status(404);
			throw new Error('This page does not exist');
		}
	}

	const products = await query;
	const totalPage = Math.ceil(countProduct / limitData);

	return res.status(200).json({
		message: 'Success get all products',
		data: products,
		pagination: {
			totalPage,
			page,
			totalProduct: countProduct,
		},
	});
});

export const getProductById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const product = await Product.findById(id);

	if (!product) {
		res.status(404);
		throw new Error('Product not found');
	}

	return res.status(200).json({
		message: 'Success get product by id',
		data: product,
	});
});

export const addProduct = asyncHandler(async (req, res) => {
	const newProduct = await Product.create(req.body);

	return res.status(201).json({
		message: 'Success add new product',
		data: newProduct,
	});
});

export const updateProduct = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const product = await Product.findByIdAndUpdate(id, req.body, {
		runValidators: true,
		new: true,
	});

	if (!product) {
		res.status(404);
		throw new Error('Product not found');
	}

	return res.status(200).json({
		message: 'Success update product',
		data: product,
	});
});

export const deleteProduct = asyncHandler(async (req, res) => {
	const { id } = req.params;

	await Product.findByIdAndDelete(id);

	return res.status(200).json({
		message: 'Success delete product',
	});
});

export const uploadFileProduct = asyncHandler(async (req, res) => {
	// Without Cloudinary

	// {
	// 	const file = req.file;
	// 	if (!file) {
	// 		res.status(400);
	// 		throw new Error('Please upload a file');
	// 	}
	// 	const imageFileName = file.filename;
	// 	const pathImageFile = `/uploads/${imageFileName}`;
	// 	res.status(200).json({
	// 		message: 'Success upload file',
	// 		image: pathImageFile,
	// 	});
	// }

	// With Cloudinary
	const stream = cloudinary.uploader.upload_stream(
		{
			folder: 'uploads',
			allowed_formats: ['jpg', 'png', 'jpeg'],
		},
		function (err, result) {
			if (err) {
				console.log(err);
				return res.status(500).json({
					message: 'Failed to upload image',
					error: err,
				});
			}

			res.json({
				message: 'Success upload image',
				url: result.secure_url,
			});
		}
	);

	streamifier.createReadStream(req.file.buffer).pipe(stream);
});
