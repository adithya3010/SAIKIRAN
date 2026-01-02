import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file received.' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Create unique filename
        const filename = Date.now() + '_' + file.name.replace(/\s/g, '_');
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        // Ensure directory exists (basic check, though 'public' should exist)
        // For now assuming public/uploads exists or manual creation. 
        // Ideally ensureDir here.

        // Write file
        try {
            await writeFile(path.join(uploadDir, filename), buffer);

            return NextResponse.json({
                url: `/uploads/${filename}`,
                success: true
            });
        } catch (writeError) {
            console.error('Filesystem write failed (likely Vercel environment), falling back to Data URI:', writeError);

            // Convert buffer to base64 Data URI
            const base64 = buffer.toString('base64');
            const mimeType = file.type || 'application/octet-stream';
            const dataUri = `data:${mimeType};base64,${base64}`;

            return NextResponse.json({
                url: dataUri,
                success: true,
                message: 'Upload fallback used (Data URI)'
            });
        }
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed.' },
            { status: 500 }
        );
    }
}
