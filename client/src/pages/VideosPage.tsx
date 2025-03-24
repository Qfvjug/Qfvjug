import { useState } from "react";
import { useCategorizedVideos } from "@/hooks/useYouTubeData";
import VideoCard, { VideoCardSkeleton } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'minecraft', name: 'Minecraft' },
  { id: 'unity', name: 'Unity' },
  { id: 'tutorials', name: 'Tutorials' }
];

const VideosPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  
  const { videos, allVideos, isLoading, error, hasNextPage, nextPageToken } = 
    useCategorizedVideos(selectedCategory === 'all' ? '' : selectedCategory, 12);
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1); // Reset page when changing category
  };
  
  const loadMore = () => {
    if (hasNextPage) {
      setPage(page + 1);
      // Note: In a real implementation, we would pass the nextPageToken to the API
      // and load more videos. For simplicity, we're just increasing the page number here.
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-8">Videos</h1>
        
        {/* Category Selector */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto py-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <VideoCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load videos</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {selectedCategory === 'all' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No videos found in this category</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Load More Button */}
            {(selectedCategory === 'all' ? allVideos.length > 0 : videos.length > 0) && hasNextPage && (
              <div className="mt-8 text-center">
                <Button 
                  variant="outline" 
                  onClick={loadMore} 
                  className="inline-flex items-center gap-2"
                >
                  <span>Load More Videos</span>
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default VideosPage;
