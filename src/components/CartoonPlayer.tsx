"use client";

import { useState } from 'react';
import { CldVideoPlayer } from 'next-cloudinary';
import { Loader2, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import 'next-cloudinary/dist/cld-video-player.css';
import './player-theme.css';

// 1. Define the type for our recommendations
interface RecommendedVideo {
  publicId: string;
  title: string;
  thumbnailUrl: string;
}

interface CartoonPlayerProps {
  publicId: string;
  recommendations: RecommendedVideo[]; // New prop added!
}

export default function CartoonPlayer({ publicId, recommendations }: CartoonPlayerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRecs, setShowRecs] = useState(false); // Controls the end-screen

  const playerId = `player-${publicId.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gemini-border bg-black aspect-video relative group">

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gemini-bg/95 backdrop-blur-md text-center p-6">
          <Loader2 className="w-12 h-12 text-gemini-accent animate-spin mb-4" />
          <h3 className="text-xl font-bold text-gemini-text mb-2">Processing Video...</h3>
          <p className="text-gemini-muted text-sm">Generating HD formats. Please refresh shortly!</p>
        </div>
      )}

      {/* YouTube-Style Post-Video Recommendations */}
      {showRecs && !isProcessing && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-6 animate-in fade-in duration-500">
          <h3 className="text-white text-xl font-bold mb-6">Up Next</h3>

          <div className="flex gap-6 w-full max-w-2xl">
            {/* Show up to 2 recommendations */}
            {recommendations.slice(0, 2).map((video) => (
              <Link
                key={video.publicId}
                href={`/watch/${video.publicId}`}
                className="flex-1 group/item"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group-hover/item:border-gemini-accent transition-colors">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Play className="w-10 h-10 text-white fill-white" />
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-white line-clamp-2 group-hover/item:text-gemini-accent">
                  {video.title}
                </p>
              </Link>
            ))}
          </div>

          <button
            onClick={() => setShowRecs(false)}
            className="mt-8 flex items-center gap-2 text-gemini-muted hover:text-white transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" /> Cancel Replay
          </button>
        </div>
      )}

      <CldVideoPlayer
        id={playerId}
        width="1920"
        height="1080"
        src={publicId}
        sourceTypes={['hls']}
        transformation={{ streaming_profile: 'full_hd' }}
        colors={{ base: '#131314', text: '#e3e3e3', accent: '#a8c7fa' }}
        logo={false}
        fluid
        playbackRates={[0.5, 1, 1.25, 1.5, 2]}
        className="gemini-player"
        onError={() => setIsProcessing(true)}

        // Listeners for the end screen!
        onEnded={() => setShowRecs(true)}
        onPlay={() => setShowRecs(false)}
      />
    </div>
  );
}
