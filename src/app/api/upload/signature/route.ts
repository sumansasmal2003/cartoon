import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// 1. FORCE NEXT.JS NOT TO CACHE THIS ROUTE
export const dynamic = 'force-dynamic';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Check if the secret exists to prevent silent failures
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error("CLOUDINARY_API_SECRET is missing from environment variables");
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    // We only sign the timestamp now, because the raw upload has no 'eager' parameters
    const paramsToSign = {
      timestamp: timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error: any) {
    console.error("Signature generation error:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate signature' }, { status: 500 });
  }
}
