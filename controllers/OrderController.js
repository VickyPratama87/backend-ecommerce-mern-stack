import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';

dotenv.config();

let snap = new midtransClient.Snap({
	isProduction: false,
	serverKey: process.env.MIDTRANS_SERVER,
});

export const createOrder = asyncHandler(async (req, res) => {
	const { email, firstName, lastName, phone, cartItem } = req.body;

	if (!cartItem || cartItem.length === 0) {
		res.status(400);
		throw new Error('Cart is empty');
	}

	let orderItem = [];
	let orderMidtrans = [];
	let total = 0;

	for (const cart of cartItem) {
		const productData = await Product.findOne({ _id: cart.product });
		if (!productData) {
			res.status(404);
			throw new Error(`Product not found `);
		}

		const { name, price, _id } = productData;

		// For MongoDB
		const singleProduct = {
			quantity: cart.quantity,
			name,
			price,
			product: _id,
		};

		// For Midtrans
		const shortName = name.substring(0, 30);
		const singleProductMidtrans = {
			quantity: cart.quantity,
			name: shortName,
			price,
			id: _id,
		};

		orderItem = [...orderItem, singleProduct];
		orderMidtrans = [...orderMidtrans, singleProductMidtrans];

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

	let parameter = {
		transaction_details: {
			order_id: order._id,
			gross_amount: total,
		},
		item_details: orderMidtrans,
		customer_details: {
			first_name: firstName,
			last_name: lastName,
			email: email,
			phone: phone,
		},
	};

	const token = await snap.createTransaction(parameter);

	return res.status(201).json({
		total,
		order,
		message: 'Success create new order',
		token,
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

export const callbackPayment = asyncHandler(async (req, res) => {
	const statusResponse = await snap.transaction.notification(req.body);
	let orderId = statusResponse.order_id;
	let transactionStatus = statusResponse.transaction_status;
	let fraudStatus = statusResponse.fraud_status;

	const orderData = await Order.findById(orderId);

	if (!orderData) {
		res.status(404);
		throw new Error('Order not found');
	}

	if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
		if (fraudStatus == 'accept') {
			const orderProduct = orderData.itemDetails;

			for (const itemProduct of orderProduct) {
				const productData = await Product.findById(itemProduct.product);

				if (!productData) {
					res.status(404);
					throw new Error('Product not found');
				}

				productData.stock -= itemProduct.quantity;

				await productData.save();
			}
			orderData.status = 'success';
		}
	} else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
		orderData.status = 'failed';
	} else if (transactionStatus == 'pending') {
		orderData.status = 'pending';
	}

	await orderData.save();

	return res.status(200).send('Payment Status Succesfully');
});
