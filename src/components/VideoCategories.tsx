
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Play, Eye, Clock, Star, Zap, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoList } from './VideoList';
import { VideoPlayer } from './VideoPlayer';
import PremiumModal from './PremiumModal';

interface VideoCategoriesProps {
  currentTier: string;
  onEarningsUpdate: (amount: number, title: string) => void;
}

export const VideoCategories = ({ currentTier, onEarningsUpdate }: VideoCategoriesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Dynamic data state
  const [categories, setCategories] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { data: categoriesData, error: catErr } = await supabase.from('categories').select('*').order('created_at');
      const { data: videosData, error: vidErr } = await supabase.from('videos').select('*').order('created_at');
      if (catErr || vidErr) {
        setError(catErr?.message || vidErr?.message || 'Error loading data');
      } else {
        // map snake_case DB fields to camelCase expected by UI
        const mapped = (categoriesData || []).map((c: any) => ({
          ...c,
          earnPerVideo: c.earn_per_video,
          totalViews: c.total_views,
          videoCount: c.video_count,
        }));
        setCategories(mapped);
        const videoMapped = (videosData || []).map((v: any)=>({
          ...v,
          earnAmount: v.earn_amount,
          duration: v.duration_minutes ?? v.duration,
          category: mapped.find((c:any)=>c.id===v.category_id)?.title || '',
        }));
        setVideos(videoMapped);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCategorySelect = (categoryTitle: string) => {
    setSelectedCategory(categoryTitle);
  };

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
  };

  const handleVideoComplete = (earnedAmount: number) => {
    if (selectedVideo) {
      onEarningsUpdate(earnedAmount, selectedVideo.title);
    }
    // The VideoPlayer component now handles navigation after showing the celebration.
  };

  const handleBack = () => {
    if (selectedVideo) {
      setSelectedVideo(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  // Filter videos by selected category
  let filteredVideos = selectedCategory
    ? videos.filter(video => {
        const cat = categories.find(c => c.title === selectedCategory);
        return cat ? video.category_id === cat.id : false;
      })
    : [];
  // non-premium videos first
  filteredVideos = filteredVideos.sort((a:any,b:any)=>{
    return (a.premium?1:0) - (b.premium?1:0);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  // If watching a video
  if (selectedVideo) {
    return (
      <VideoPlayer 
        video={selectedVideo} 
        onVideoComplete={handleVideoComplete} 
        onBack={handleBack} 
      />
    );
  }

  // Category selected: show videos
  if (selectedCategory) {
    return (
      <div>
        <button onClick={handleBack} className="mb-4 flex items-center text-primary-600 font-semibold text-sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Categories</button>
        <VideoList 
          videos={filteredVideos} 
          onSelectVideo={handleVideoSelect} 
          userTier={currentTier} 
          onShowPremiumModal={() => setShowPremiumModal(true)}
        />
        <PremiumModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      </div>
    );
  }

  // Default category view - Mobile optimized grid
  console.log('PremiumModal open:', showPremiumModal);
  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Video Categories</h2>
          <p className="text-gray-600 text-sm">Choose your favorite content to earn</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full border-2 hover:bg-primary-50 hover:border-primary-200 text-xs sm:text-sm px-3 py-2">
          View All
        </Button>
      </div>

      {/* Mobile-first responsive grid - Single column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4 lg:gap-6">
        {/* Render categories dynamically from Supabase */}
        {categories.length === 0 ? (
          <div className="text-gray-400 col-span-full text-center py-8">No categories found.</div>
        ) : (
          categories.map((category: any) => (
            <Card
              key={category.id}
              className="group hover:shadow-2xl transition-all duration-500 cursor-pointer animate-slide-up hover:scale-[1.02] active:scale-[0.98] rounded-2xl sm:rounded-3xl overflow-hidden border-0 shadow-lg bg-white touch-manipulation focus:ring-2 focus:ring-primary-400"
              tabIndex={0}
              role="button"
              aria-label={`Open category: ${category.title}`}
              onClick={() => handleCategorySelect(category.title)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCategorySelect(category.title);
                }
              }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={category.thumbnail || ''} 
                  alt={category.title}
                  className="w-full h-44 sm:h-40 lg:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                {/* Overlay play button is now pointer-events-none so card remains fully clickable */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                  <Button 
                    size="sm" 
                    className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full shadow-xl border border-white/20 px-4 py-2 pointer-events-none"
                    tabIndex={-1}
                    aria-hidden="true"
                    type="button"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Now
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                  {/* Stylish Play/Views Bar */}
                  <div className="flex gap-2">
                    <span className="flex items-center bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full px-3 py-1 font-medium shadow-sm">
                      <Play className="h-4 w-4 mr-1 text-blue-500" />
                      {category.videoCount ?? 0}
                    </span>
                    <span className="flex items-center bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full px-3 py-1 font-medium shadow-sm">
                      <Eye className="h-4 w-4 mr-1 text-purple-500" />
                      {category.totalViews ?? 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                    Earn per video
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-success-600 bg-success-50 px-3 py-1 rounded-full">
                    {category.earnPerVideo ?? 0} KSH
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
       </div>
       {/* Ensure modal is always in the DOM for safety */}
       <PremiumModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
     </section>
   );
};
