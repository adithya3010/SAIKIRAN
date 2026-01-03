import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
    heroVariant: {
        type: String,
        enum: ['default', 'creative', 'video', 'modern', 'designed'],
        default: 'default'
    },
    heroDesign: {
        version: { type: Number, default: 1 },
        publishedAt: { type: Date },
        publishedBy: { type: String },
        backgrounds: {
            desktop: { type: Object, default: null },
            tablet: { type: Object, default: null },
            mobile: { type: Object, default: null },
        },
        layouts: {
            desktop: { type: Object, default: null },
            tablet: { type: Object, default: null },
            mobile: { type: Object, default: null },
        },
        meta: {
            canvas: {
                desktop: { type: Object, default: { width: 1440, height: 720 } },
                tablet: { type: Object, default: { width: 834, height: 720 } },
                mobile: { type: Object, default: { width: 390, height: 720 } },
            }
        },
        draft: {
            updatedAt: { type: Date },
            layouts: {
                desktop: { type: Object, default: null },
                tablet: { type: Object, default: null },
                mobile: { type: Object, default: null },
            },
            backgrounds: {
                desktop: { type: Object, default: null },
                tablet: { type: Object, default: null },
                mobile: { type: Object, default: null },
            },
        }
    },
    // We can add other global settings here in the future
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent model recompilation error in Next.js
export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
