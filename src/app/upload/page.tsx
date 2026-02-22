"use client";

import { useState, useEffect } from 'react';
import { UploadCloud, Loader2, CheckCircle2, Film, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // New stage-based state management
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'processing' | 'ready'>('idle');
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  // Polling effect: Checks the database every 5 seconds while processing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (uploadStage === 'processing' && uploadedId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/videos/${uploadedId}/status`);
          const data = await res.json();

          if (data.status === 'ready') {
            setUploadStage('ready');
            clearInterval(interval); // Stop polling once it's ready!
          }
        } catch (error) {
          console.error("Status check failed:", error);
        }
      }, 5000);
    }

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [uploadStage, uploadedId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !description) return;

    setUploadStage('uploading');

    try {
      // 1. Get Signature
      const sigResponse = await fetch('/api/upload/signature');
      const { signature, timestamp, apiKey } = await sigResponse.json();
      if (!apiKey) throw new Error("API Key missing");

      // 2. Upload raw video to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: 'POST',
        body: formData,
      });
      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok) throw new Error(cloudinaryData.error?.message || "Upload failed");

      // 3. Save to MongoDB (Status defaults to 'processing')
      const dbRes = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          publicId: cloudinaryData.public_id,
          duration: cloudinaryData.duration,
          thumbnailUrl: cloudinaryData.secure_url.replace(/\.[^/.]+$/, ".jpg"),
        }),
      });
      if (!dbRes.ok) throw new Error("Database save failed");

      // 4. Trigger background processing
      await fetch('/api/videos/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: cloudinaryData.public_id }),
      });

      // 5. Move to processing stage so the UI updates and polling begins
      setUploadedId(cloudinaryData.public_id);
      setUploadStage('processing');

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
      setUploadStage('idle');
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setUploadedId(null);
    setUploadStage('idle');
  };

  return (
    <div className="min-h-screen bg-gemini-bg p-8 flex justify-center items-start pt-20">
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-bold text-gemini-text">Upload Cartoon</h1>
          <Link href="/" className="text-sm text-gemini-accent hover:underline">Back to Feed</Link>
        </div>

        {/* State 1: Upload Form */}
        {uploadStage === 'idle' || uploadStage === 'uploading' ? (
          <form onSubmit={handleUpload} className="bg-gemini-surface p-6 md:p-8 rounded-2xl border border-gemini-border shadow-xl">
            {/* Input fields remain the same */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gemini-muted mb-2">Video Title</label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                disabled={uploadStage === 'uploading'}
                className="w-full bg-gemini-bg border border-gemini-border rounded-lg px-4 py-3 text-gemini-text focus:outline-none focus:border-gemini-accent disabled:opacity-50"
                placeholder="e.g., Tom and Jerry Episode 1"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gemini-muted mb-2">Description</label>
              <textarea
                required value={description} onChange={(e) => setDescription(e.target.value)}
                disabled={uploadStage === 'uploading'}
                className="w-full bg-gemini-bg border border-gemini-border rounded-lg px-4 py-3 text-gemini-text focus:outline-none focus:border-gemini-accent h-32 resize-none disabled:opacity-50"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gemini-muted mb-2">Video File</label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative ${file ? 'border-gemini-accent bg-gemini-accent/5' : 'border-gemini-border hover:border-gemini-muted'} ${uploadStage === 'uploading' ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="file" accept="video/*" required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className={`mx-auto h-12 w-12 mb-4 ${file ? 'text-gemini-accent' : 'text-gemini-muted'}`} />
                <p className="text-sm font-medium text-gemini-text">
                  {file ? file.name : "Drag and drop or click to select"}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadStage === 'uploading' || !file}
              className="w-full bg-gemini-text text-gemini-bg font-bold py-3.5 rounded-lg hover:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {uploadStage === 'uploading' ? (
                <><Loader2 className="animate-spin h-5 w-5" /> Uploading to Server...</>
              ) : (
                'Publish Video'
              )}
            </button>
          </form>
        ) : null}

        {/* State 2 & 3: Processing and Ready UI */}
        {uploadStage === 'processing' || uploadStage === 'ready' ? (
          <div className="bg-gemini-surface p-8 md:p-12 rounded-2xl border border-gemini-border shadow-xl text-center flex flex-col items-center">

            {uploadStage === 'processing' ? (
              <>
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gemini-accent blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <Loader2 className="w-20 h-20 text-gemini-accent animate-spin relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-gemini-text mb-3">Processing HD Quality</h2>
                <p className="text-gemini-muted mb-8 max-w-sm">
                  Your video is successfully uploaded. We are currently generating the adaptive bitrate streams. Please keep this page open.
                </p>
                {/* Simulated Progress Bar */}
                <div className="w-full max-w-sm bg-gemini-bg rounded-full h-2 mb-2 overflow-hidden border border-gemini-border">
                  <div className="bg-gemini-accent h-2 rounded-full w-full animate-pulse origin-left"></div>
                </div>
                <p className="text-xs text-gemini-muted font-mono uppercase tracking-widest mt-2">Encoding in progress...</p>
              </>
            ) : (
              <>
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
                  <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-gemini-text mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" /> Processing Complete!
                </h2>
                <p className="text-gemini-muted mb-8 max-w-sm">
                  Your cartoon is fully encoded into all HD formats and is ready to be watched by the world.
                </p>
                <div className="flex gap-4 w-full max-w-sm">
                  <button onClick={resetForm} className="flex-1 py-3 px-4 rounded-lg font-semibold text-gemini-text bg-gemini-bg border border-gemini-border hover:bg-gemini-border transition-colors">
                    Upload Another
                  </button>
                  <Link href={`/watch/${uploadedId}`} className="flex-1 py-3 px-4 rounded-lg font-bold text-gemini-bg bg-gemini-accent hover:bg-blue-400 transition-colors flex items-center justify-center gap-2">
                    <Film className="w-4 h-4" /> Watch Now
                  </Link>
                </div>
              </>
            )}

          </div>
        ) : null}
      </div>
    </div>
  );
}
