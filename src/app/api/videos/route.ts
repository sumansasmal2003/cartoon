import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Video from '@/models/Video';

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { title, description, publicId, duration, thumbnailUrl } = body;

    if (!title || !description || !publicId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newVideo = await Video.create({
      title,
      description,
      publicId,
      duration,
      thumbnailUrl,
    });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: 'Failed to save video to database' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find({}).sort({ createdAt: -1 });
    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
