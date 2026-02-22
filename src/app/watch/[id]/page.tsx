import connectToDatabase from '@/lib/mongodb';
import Video from '@/models/Video';
import CartoonPlayer from '@/components/CartoonPlayer';
import { notFound } from 'next/navigation';
import { Calendar, Tv, Upload, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Helper to format date cleanly
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default async function WatchPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // Unwrap the params Promise (Next.js 15 requirement)
  const { id } = await params;

  await connectToDatabase();

  // Fetch the main video using the unwrapped ID
  const video = await Video.findOne({ publicId: id }).lean();

  if (!video) {
    notFound();
  }

  // Fetch a few other videos for the "Up Next" sidebar and end-screen
  const recommendedVideos = await Video.find({ _id: { $ne: video._id } })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Check the status of the video from our database
  const isProcessing = video.status === 'processing';

  // Format the recommendations so they are safe to pass to the Client Component player
  const playerRecs = recommendedVideos.map((v: any) => ({
    publicId: v.publicId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl || ''
  }));

  return (
    <div className="min-h-screen bg-gemini-bg flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-gemini-bg/90 backdrop-blur-md border-b border-gemini-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Tv className="w-8 h-8 text-gemini-accent" />
          <span className="text-xl font-bold text-gemini-text tracking-tight">CartoonTube</span>
        </Link>
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

      {/* Main Content Layout */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">

        {/* Left Column: Video Player and Info */}
        <div className="flex-1 lg:max-w-[70%] xl:max-w-[75%]">
          <Link href="/" className="inline-flex items-center text-gemini-accent hover:text-white mb-4 text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to feed
          </Link>

          {/* Conditional Rendering based on Video Status */}
          {isProcessing ? (
            <div className="w-full rounded-2xl border border-gemini-border bg-gemini-surface aspect-video flex flex-col items-center justify-center text-center p-8 shadow-2xl">
              <Loader2 className="w-16 h-16 text-gemini-accent animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-gemini-text mb-3">Processing to HD Quality</h2>
              <p className="text-gemini-muted max-w-lg">
                We've received your video and are currently generating the adaptive bitrate streams (1080p, 720p, etc.).
                This page will update automatically when the stream is ready.
              </p>
            </div>
          ) : (
            <CartoonPlayer
              publicId={video.publicId}
              recommendations={playerRecs}
            />
          )}

          {/* Video Metadata */}
          <div className="mt-6 border-b border-gemini-border pb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gemini-text mb-4">
              {video.title}
            </h1>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gemini-accent to-purple-500 shadow-lg border-2 border-gemini-border"></div>
                <div>
                  <h3 className="text-gemini-text font-semibold text-lg">CartoonTube Channel</h3>
                  <p className="text-gemini-muted text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(video.createdAt as string)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Box */}
          <div className="mt-6 bg-gemini-surface p-4 rounded-xl border border-gemini-border">
            <p className="text-gemini-text whitespace-pre-wrap leading-relaxed">
              {video.description}
            </p>
          </div>
        </div>

        {/* Right Column: Up Next Recommendations */}
        <aside className="w-full lg:w-[30%] xl:w-[25%]">
          <h3 className="text-lg font-bold text-gemini-text mb-4">Up Next</h3>
          <div className="flex flex-col gap-4">
            {recommendedVideos.map((rec: any) => (
              <Link href={`/watch/${rec.publicId}`} key={rec._id.toString()} className="group flex gap-3 items-start">
                {/* Thumbnail */}
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gemini-surface border border-gemini-border">
                  <img
                    src={rec.thumbnailUrl || '/api/placeholder/320/180'}
                    alt={rec.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Processing overlay for sidebar thumbnails */}
                  {rec.status === 'processing' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                       <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex flex-col overflow-hidden">
                  <h4 className="text-gemini-text font-medium text-sm line-clamp-2 leading-snug group-hover:text-gemini-accent transition-colors">
                    {rec.title}
                  </h4>
                  <p className="text-gemini-muted text-xs mt-1">CartoonTube</p>
                </div>
              </Link>
            ))}
            {recommendedVideos.length === 0 && (
              <p className="text-gemini-muted text-sm border border-gemini-border bg-gemini-surface p-4 rounded-lg">
                No other cartoons found.
              </p>
            )}
          </div>
        </aside>

      </main>
    </div>
  );
}
