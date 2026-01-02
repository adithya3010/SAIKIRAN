import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    addresses: [{
        firstName: String,
        lastName: String,
        address: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        phone: String,
        isDefault: { type: Boolean, default: false }
    }]
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
