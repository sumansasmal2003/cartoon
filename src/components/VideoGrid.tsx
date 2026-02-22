"use client";

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { PlayCircle, Clock } from 'lucide-react';

// Type definition for our video data
type VideoProps = {
  _id: string;
  title: string;
  description: string;
  publicId: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: string;
};

// Helper to format Cloudinary duration (seconds) into MM:SS
const formatDuration = (totalSeconds: number) => {
  if (!totalSeconds) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Helper to format the date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  // Replace `undefined` with a hardcoded locale like 'en-US'
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Framer motion variants for the staggered animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function VideoGrid({ videos }: { videos: VideoProps[] }) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gemini-muted">
        <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">No cartoons uploaded yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {videos.map((video) => (
        <motion.div key={video._id} variants={itemVariants}>
          <Link href={`/watch/${video.publicId}`} className="group block">
            {/* Thumbnail Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gemini-surface border border-gemini-border shadow-sm mb-3">
              <img
                src={video.thumbnailUrl || '/api/placeholder/640/360'}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
                <Clock className="w-3 h-3" />
                {formatDuration(video.duration)}
              </div>
              {/* Hover Play Overlay */}
              <div className="absolute inset-0 bg-gemini-bg/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-gemini-accent" />
              </div>
            </div>

            {/* Video Meta Info */}
            <div className="flex gap-3 pr-2">
              <div className="flex-shrink-0 mt-1">
                {/* Placeholder Avatar - can be replaced with actual user avatars later */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gemini-accent to-purple-500"></div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <h3 className="text-gemini-text font-semibold text-base line-clamp-2 leading-tight group-hover:text-gemini-accent transition-colors">
                  {video.title}
                </h3>
                <p className="text-gemini-muted text-sm mt-1">CartoonTube Channel</p>
                <p className="text-gemini-muted text-xs mt-1">
                  {formatDate(video.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
