import { useState, useEffect } from 'react';
import { Play, ArrowLeft, Trophy } from 'lucide-react';
import Confetti from 'react-confetti';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Helper hook to get window dimensions for confetti
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  earn_amount: number;
  video_url: string; // The full YouTube URL
  thumbnail: string;
  premium?: boolean;
}

interface VideoPlayerProps {
  video: Video;
  onVideoComplete: (earnedAmount: number) => void;
  onBack: () => void;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const VideoPlayer = ({ video, onVideoComplete, onBack }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const { width, height } = useWindowSize();

  const videoId = getYouTubeId(video.video_url);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const totalDurationSeconds = (video.duration || 1) * 60;

    if (isPlaying && currentTime < totalDurationSeconds) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= totalDurationSeconds && !hasCompleted) {
            setHasCompleted(true);
            setIsPlaying(false);
            handleVideoCompletion();
            clearInterval(interval);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, video.duration, hasCompleted]);

  const handleVideoCompletion = () => {
    const earnedAmount = video.earn_amount;

    // CRITICAL FIX: Only proceed if there is a valid amount to be earned.
    // This prevents sending a bad request to the database.
    if (earnedAmount && earnedAmount > 0) {
      setShowCelebration(true);
      onVideoComplete(earnedAmount);

      // After 5 seconds, hide celebration and go back
      setTimeout(() => {
        setShowCelebration(false);
        onBack();
      }, 5000); // 5-second celebration
    } else {
      // If there's no valid earn amount, do not show celebration or try to update balance.
      // Just go back to the previous screen to prevent a crash.
      console.warn('Video completed, but no valid earn_amount found. Skipping earning process.', video);
      onBack();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDurationSeconds = (video.duration || 1) * 60;
  const progressPercentage = (currentTime / totalDurationSeconds) * 100;

  if (!videoId) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-red-600">Invalid Video URL</h2>
        <p className="text-gray-500">The provided video URL is not a valid YouTube link.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes splash-in {
          0% { opacity: 0; transform: scale(0.3) translateY(40px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-splash-in { animation: splash-in 0.5s ease-out forwards; opacity: 0; }
      `}</style>

      {showCelebration && (
        <>
          <Confetti width={width} height={height} recycle={false} numberOfPieces={600} tweenDuration={8000} />
          <div className="fixed inset-0 bg-gradient-to-br from-purple-600/80 via-blue-500/80 to-green-400/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100] p-4">
            <div className="text-center text-white">
              <Trophy className="h-28 w-28 text-yellow-300 mx-auto drop-shadow-lg animate-bounce" />
              <h2 className="text-5xl font-bold mt-4 animate-splash-in" style={{ animationDelay: '0.2s' }}>
                Congratulations!
              </h2>
              <p className="text-3xl mt-4 animate-splash-in" style={{ animationDelay: '0.5s' }}>
                You've earned
              </p>
              <p className="text-7xl font-bold text-green-300 mt-2 animate-splash-in drop-shadow-xl" style={{ animationDelay: '0.8s' }}>
                {video.earn_amount} KSH
              </p>
            </div>
          </div>
        </>
      )}

      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-800">Watching Video</h1>
          <Badge className="bg-green-100 text-green-800">
            Earn {video.earn_amount} KSH
          </Badge>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl mb-4">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&iv_load_policy=3&modestbranding=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">{video.title}</h2>
              {video.premium && <Badge className="bg-gradient-primary text-white">Premium</Badge>}
            </div>
            <p className="text-gray-600 mb-4">{video.description}</p>
            
            <div className="flex items-center gap-4">
              <Progress value={progressPercentage} className="w-full" />
              <span className="text-sm font-mono text-gray-500">
                {formatTime(currentTime)} / {formatTime(totalDurationSeconds)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
