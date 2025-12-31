import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
    heroVariant: {
        type: String,
        enum: ['default', 'creative'],
        default: 'default'
    },
    // We can add other global settings here in the future
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent model recompilation error in Next.js
export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
