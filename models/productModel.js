import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Product name is required'],
		unique: [true, 'Product name already exists'],
	},
	price: {
		type: Number,
		required: [true, 'Price is required'],
	},
	description: {
		type: String,
		required: [true, 'Product description is required'],
	},
	image: {
		type: String,
		default: null,
	},
	category: {
		type: String,
		required: [true, 'Category product is required'],
		enum: ['sepatu', 'kemeja', 'baju', 'celana'],
	},
	stock: {
		type: Number,
		default: 0,
	},
});

const Product = mongoose.model('Product', productSchema);

export default Product;
