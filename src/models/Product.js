import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative'],
    },
    category: {
        type: String,
        required: [true, 'Please specify a category'],
        enum: ['T-Shirt', 'Hoodie', 'Jacket', 'Trousers', 'Dress'],
    },
    fit: {
        type: String,
        enum: ['Regular', 'Oversized', 'Relaxed', 'Boxy', 'Tapered'],
        default: 'Regular'
    },
    fabric: {
        type: String,
        required: [true, 'Please specify fabric'],
    },
    printType: {
        type: String,
        enum: ['Solid', 'Typography', 'Illustration'],
        default: 'Solid'
    },
    occasion: {
        type: String,
        enum: ['Casual', 'Streetwear', 'Everyday', 'Evening'],
        default: 'Everyday'
    },
    images: {
        type: [String],
        required: [true, 'Please provide at least one image'],
    },
    colors: [{
        name: String,
        hex: String,
        stock: { type: Number, default: 0 } // Keep for backward compatibility or aggregate view
    }],
    variants: [{
        color: {
            name: String,
            hex: String
        },
        size: String,
        stock: { type: Number, default: 0 }
    }],
    sizes: {
        type: [String],
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    },
    inStock: {
        type: Boolean,
        default: true
    },
    isNewProduct: { // 'isNew' is a mongoose reserved word
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
