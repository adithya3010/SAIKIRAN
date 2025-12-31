import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
    try {
        await dbConnect();

        // Find the settings document (we expect only one)
        let settings = await SiteSettings.findOne();

        // If no settings exist yet, create default
        if (!settings) {
            settings = await SiteSettings.create({ heroVariant: 'default' });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { heroVariant } = body;

        if (!heroVariant) {
            return NextResponse.json({ error: 'Missing heroVariant' }, { status: 400 });
        }

        // Update the singleton settings document, or create if it doesn't exist
        const settings = await SiteSettings.findOneAndUpdate(
            {},
            { heroVariant, updatedAt: new Date() },
            { new: true, upsert: true } // upsert creates if not found
        );

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating site settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
