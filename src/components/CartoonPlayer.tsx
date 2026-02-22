"use client";

import { useState } from 'react';
import { CldVideoPlayer } from 'next-cloudinary';
import { Loader2 } from 'lucide-react';
import 'next-cloudinary/dist/cld-video-player.css';
import './player-theme.css';

interface CartoonPlayerProps {
  publicId: string;
  title: string;
}

export default function CartoonPlayer({ publicId, title }: CartoonPlayerProps) {
  // State to track if the video is still processing on Cloudinary's servers
  const [isProcessing, setIsProcessing] = useState(false);

  const playerId = `player-${publicId.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gemini-border bg-black aspect-video relative group">

      {/* Friendly Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gemini-bg/95 backdrop-blur-md text-center p-6 border border-gemini-border rounded-2xl">
          <Loader2 className="w-12 h-12 text-gemini-accent animate-spin mb-4" />
          <h3 className="text-xl font-bold text-gemini-text mb-2">Processing Video...</h3>
          <p className="text-gemini-muted max-w-md text-sm">
            We are generating the HD streaming formats for this cartoon. This usually takes a minute or two depending on the video's length. <br/><br/> <b>Please refresh the page shortly!</b>
          </p>
        </div>
      )}

      <CldVideoPlayer
        id={playerId}
        width="1920"
        height="1080"
        src={publicId}
        sourceTypes={['hls']}
        transformation={{
          streaming_profile: 'full_hd',
        }}
        colors={{
          base: '#131314',
          text: '#e3e3e3',
          accent: '#a8c7fa',
        }}
        title={title}
        logo={false}
        fluid
        playbackRates={[0.5, 1, 1.25, 1.5, 2]}
        className="gemini-player"
        // If the player throws an error (like file not found), trigger our overlay
        onError={() => setIsProcessing(true)}
      />
    </div>
  );
}
