import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
	const { email, firstName, lastName, phone, cartItem } = req.body;

	if (!cartItem || cartItem.length === 0) {
		res.status(400);
		throw new Error('Cart is empty');
	}

	let orderItem = [];
	let total = 0;

	for (const cart of cartItem) {
		const productData = await Product.findOne({ _id: cart.product });
		if (!productData) {
			res.status(404);
			throw new Error(`Product not found `);
		}

		const { name, price, _id } = productData;
		const singleProduct = {
			quantity: cart.quantity,
			name,
			price,
			product: _id,
		};
		orderItem = [...orderItem, singleProduct];

		total += cart.quantity * price;
	}

	const order = await Order.create({
		itemDetails: orderItem,
		total,
		firstName,
		lastName,
		email,
		phone,
		user: req.user.id,
	});

	return res.status(201).json({
		total,
		order,
		message: 'Success create new order',
	});
});

export const getAllOrders = asyncHandler(async (req, res) => {
	const orders = await Order.find();

	return res.status(200).json({
		message: 'Success get all orders',
		data: orders,
	});
});

export const getOrderById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const order = await Order.findById(id);

	if (!order) {
		res.status(404);
		throw new Error('Order not found');
	}

	return res.status(200).json({
		message: 'Success get order by id',
		data: order,
	});
});

export const currentUserOrder = asyncHandler(async (req, res) => {
	const { id } = req.user;
	const order = await Order.find({ user: id });

	return res.status(200).json({
		message: 'Success get current user orders',
		data: order,
	});
});
