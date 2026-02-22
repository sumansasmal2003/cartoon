import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { publicId } = await req.json();

    if (!publicId) return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });

    // This tells Cloudinary: "Take this existing video and process it into HLS now."
    const result = await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      resource_type: 'video',
      eager: 'sp_full_hd/f_m3u8',
      eager_async: true, // Do it in the background
      // Cloudinary will hit this URL when the processing is 100% finished
      eager_notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cloudinary`,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Explicit processing error:", error);
    return NextResponse.json({ error: 'Failed to start processing' }, { status: 500 });
  }
}
