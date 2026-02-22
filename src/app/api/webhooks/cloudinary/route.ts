import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Video from '@/models/Video';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Cloudinary sends a 'notification_type' of 'eager' when background processing finishes
    if (body.notification_type === 'eager') {
      await connectToDatabase();

      const publicId = body.public_id;

      // Update the database to show the video is now ready to be watched!
      await Video.findOneAndUpdate(
        { publicId: publicId },
        { status: 'ready' }
      );

      console.log(`Video ${publicId} is successfully processed and ready!`);
    }

    // Always return a 200 OK so Cloudinary knows we received the webhook
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
