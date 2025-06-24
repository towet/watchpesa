
import { Play, Clock, DollarSign, Star, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: number;
  title: string;
  description: string;
  duration: number;
  earnAmount: number;
  category: string;
  youtubeId: string;
  thumbnail: string;
  premium?: boolean;
}

interface VideoListProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  userTier: string;
  onShowPremiumModal: () => void;
}

export const VideoList = ({ videos, onSelectVideo, userTier, onShowPremiumModal }: VideoListProps) => {
  const canWatchPremium = userTier === 'Elite' || userTier === 'Premium';

  return (
    <div className="space-y-3 sm:space-y-4">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 group border-0 bg-white cursor-pointer focus:ring-2 focus:ring-primary-400 active:scale-[0.98]"
          tabIndex={0}
          role="button"
          aria-label={`Open video: ${video.title}`}
          onClick={() => {
            if (video.premium && !canWatchPremium) {
              onShowPremiumModal();
            } else {
              onSelectVideo(video);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (video.premium && !canWatchPremium) {
                onShowPremiumModal();
              } else {
                onSelectVideo(video);
              }
            }
          }}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail - Mobile full width, desktop side */}
            <div className="relative w-full sm:w-40 lg:w-48 flex-shrink-0 h-48 sm:h-28 lg:h-32">
              <img 
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Play className="h-5 w-5 text-white" />
                </div>
              </div>
              {video.premium && (
                <Badge className="absolute top-2 right-2 bg-gradient-success text-white text-xs rounded-full px-2 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>

            {/* Content - Mobile full width, desktop flex */}
            <CardContent className="flex-1 p-4 sm:p-3 lg:p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-bold text-base sm:text-sm lg:text-base text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-tight">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed hidden sm:block">
                  {video.description}
                </p>
                
                {/* Mobile: Show description below title */}
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed sm:hidden">
                  {video.description}
                </p>
                
                <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                {/* Stylish Play/Views/Earnings Bar */}
                <div className="flex gap-2">
                  <span className="flex items-center bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full px-3 py-1 font-medium shadow-sm">
                    <Play className="h-4 w-4 mr-1 text-blue-500" />
                    32
                  </span>
                  <span className="flex items-center bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full px-3 py-1 font-medium shadow-sm">
                    <Eye className="h-4 w-4 mr-1 text-purple-500" />
                    18.7K
                  </span>
                </div>
                <span className="flex items-center bg-gray-100 rounded-full px-2 py-1 ml-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {video.duration}m
                </span>
                <span className="bg-primary-100 text-primary-700 rounded-full px-2 py-1">
                  {video.category}
                </span>
              </div>
              </div>

              {/* Action bar - Mobile optimized */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="flex items-center text-success-600 font-bold text-base">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {video.earnAmount} KSH
                </span>
                <Button
                  size="sm"
                  className={`rounded-full px-5 py-2 text-sm font-semibold shadow-md transition-all duration-300 flex items-center gap-2 ${video.premium ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white' : 'bg-success-100 text-success-700 hover:bg-success-200'}`}
                  onClick={() => {
                    if (video.premium && !canWatchPremium) {
                      onShowPremiumModal();
                    } else {
                      onSelectVideo(video);
                    }
                  }}
                >
                  {video.premium && <Star className="h-4 w-4 text-yellow-400" />}Watch
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};
