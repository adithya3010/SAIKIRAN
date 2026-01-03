import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    nameNormalized: {
        type: String,
        index: true,
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
    categoryNormalized: {
        type: String,
        index: true,
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
        stock: { type: Number, default: 0 },
        images: [String] // Color-specific images
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

// Indexes for faster catalog queries
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ category: 1, createdAt: -1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 1 });

ProductSchema.pre('save', function (next) {
    if (this.isModified('name') || this.nameNormalized == null) {
        this.nameNormalized = (this.name || '').trim().toLowerCase();
    }
    if (this.isModified('category') || this.categoryNormalized == null) {
        this.categoryNormalized = (this.category || '').trim().toLowerCase();
    }
    next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
