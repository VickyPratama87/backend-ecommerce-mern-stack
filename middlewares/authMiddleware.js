import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from './asyncHandler.js';

// Protect routes
export const protectedMiddleware = asyncHandler(async (req, res, next) => {
	let token;
	token = req.cookies.jwt;

	if (token) {
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			req.user = await User.findById(decoded.id).select('-password');
			next();
		} catch (error) {
			res.status(401);
			throw new Error('Not authorized, token failed');
		}
	} else {
		res.status(401);
		throw new Error('Not authorized, no token');
	}
});

// Check if user is owner
export const ownerMiddleware = asyncHandler(async (req, res, next) => {
	if (req.user && req.user.role === 'owner') {
		next();
	} else {
		res.status(403);
		throw new Error('Forbidden, not authorized as owner');
	}
});
