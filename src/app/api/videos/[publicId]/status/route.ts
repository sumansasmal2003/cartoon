import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    await connectToDatabase();

    // We strictly select only the 'status' field to make this database query ultra-fast
    const video = await Video.findOne({ publicId }).select('status').lean();

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ status: video.status }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
