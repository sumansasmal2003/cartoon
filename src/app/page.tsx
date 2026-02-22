import connectToDatabase from '@/lib/mongodb';
import Video from '@/models/Video';
import VideoGrid from '@/components/VideoGrid';
import Link from 'next/link';
import { Upload, Tv, Search } from 'lucide-react';

// Force dynamic rendering so the feed updates immediately when a new video is uploaded
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch videos directly from the database
  await connectToDatabase();
  const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

  // Serialize the MongoDB objects to pass them to the Client Component
  const serializedVideos = videos.map((video: any) => ({
    _id: video._id.toString(),
    title: video.title,
    description: video.description,
    publicId: video.publicId,
    thumbnailUrl: video.thumbnailUrl,
    duration: video.duration,
    createdAt: video.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-gemini-bg">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-gemini-bg/90 backdrop-blur-md border-b border-gemini-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="w-8 h-8 text-gemini-accent" />
          <span className="text-xl font-bold text-gemini-text tracking-tight">CartoonTube</span>
        </div>

        {/* Dummy Search Bar */}
        <div className="hidden md:flex items-center bg-gemini-surface border border-gemini-border rounded-full px-4 py-2 w-full max-w-md focus-within:border-gemini-accent focus-within:ring-1 focus-within:ring-gemini-accent transition-all">
          <Search className="w-5 h-5 text-gemini-muted mr-2" />
          <input
            type="text"
            placeholder="Search cartoons..."
            className="bg-transparent border-none outline-none text-gemini-text w-full placeholder:text-gemini-muted"
          />
        </div>

        <div>
          <Link
            href="/upload"
            className="flex items-center gap-2 bg-gemini-surface hover:bg-gemini-border text-gemini-text px-4 py-2 rounded-full font-medium transition-colors border border-gemini-border"
          >
            <Upload className="w-4 h-4" />
            Upload
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-6 md:p-8 max-w-[1600px] mx-auto">
        <h2 className="text-xl font-bold text-gemini-text mb-6 border-b border-gemini-border pb-4">
          Latest Episodes
        </h2>

        {/* Render the Animated Grid */}
        <VideoGrid videos={serializedVideos} />
      </main>
    </div>
  );
}
