import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
        return null;
    }
    return session;
}

export async function GET() {
    try {
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const { heroVariant, heroDesign, publishHeroDesign, saveHeroDesignDraft } = body;

        if (!heroVariant && !heroDesign && !publishHeroDesign && !saveHeroDesignDraft) {
            return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
        }

        const update = { updatedAt: new Date() };

        if (heroVariant) update.heroVariant = heroVariant;

        // Save full design (admin-controlled) without forcing publish.
        // IMPORTANT: do not combine a top-level heroDesign replacement with nested heroDesign.* updates.
        if (heroDesign && typeof heroDesign === 'object') {
            update.heroDesign = heroDesign;
        }

        // Save draft only (used by canvas autosave).
        // This must be a nested-path update and must NOT be combined with update.heroDesign.
        if (saveHeroDesignDraft && typeof saveHeroDesignDraft === 'object') {
            if (update.heroDesign) {
                return NextResponse.json(
                    { error: 'Invalid update: cannot set heroDesign and heroDesign.draft together' },
                    { status: 400 }
                );
            }
            update['heroDesign.draft'] = {
                ...saveHeroDesignDraft,
                updatedAt: new Date(),
            };
        }

        // Publish: copy draft -> published and stamp metadata.
        if (publishHeroDesign) {
            // Mark variant as designed when publishing.
            update.heroVariant = 'designed';
            update['heroDesign.publishedAt'] = new Date();
            update['heroDesign.publishedBy'] = session.user.email || session.user.id;

            // If client sent the full publish payload, merge it into published.
            if (typeof publishHeroDesign === 'object') {
                if (publishHeroDesign.layouts) update['heroDesign.layouts'] = publishHeroDesign.layouts;
                if (publishHeroDesign.backgrounds) update['heroDesign.backgrounds'] = publishHeroDesign.backgrounds;
                if (publishHeroDesign.meta) update['heroDesign.meta'] = publishHeroDesign.meta;
                if (publishHeroDesign.version) update['heroDesign.version'] = publishHeroDesign.version;
            }
        }

        // Update the singleton settings document, or create if it doesn't exist
        const settings = await SiteSettings.findOneAndUpdate(
            {},
            update,
            { new: true, upsert: true } // upsert creates if not found
        );

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating site settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
