import { useState } from "react";
import { useVideo } from "@/hooks/useYouTubeData";
import { formatCompactNumber, formatRelativeTime, formatYouTubeDuration } from "@/lib/utils";
import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type FeaturedVideoProps = {
  videoId: string;
};

const FeaturedVideo = ({ videoId }: FeaturedVideoProps) => {
  const { data, isLoading, error } = useVideo(videoId);
  const [isPlaying, setIsPlaying] = useState(false);

  if (isLoading) {
    return (
      <Card className="rounded-xl overflow-hidden shadow-lg bg-card border border-border">
        <div className="relative pb-[56.25%] h-0">
          <Skeleton className="absolute inset-0" />
        </div>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data || !data.items || data.items.length === 0) {
    return (
      <Card className="rounded-xl overflow-hidden shadow-lg bg-card border border-border">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">Failed to load featured video</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const video = data.items[0];
  const { title, description, publishedAt, thumbnails } = video.snippet;
  const { viewCount } = video.statistics;
  const { duration } = video.contentDetails;
  
  // Get the highest quality thumbnail
  const thumbnail = thumbnails.maxres || thumbnails.standard || thumbnails.high;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <Card className="rounded-xl overflow-hidden shadow-lg bg-card border border-border transition-transform hover:-translate-y-1 hover:shadow-xl">
      <div className="relative pb-[56.25%] h-0">
        {isPlaying ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <>
            <img
              src={thumbnail.url}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <button
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors duration-200"
                onClick={handlePlay}
                aria-label="Play video"
              >
                <Play className="h-8 w-8 text-white" fill="white" />
              </button>
            </div>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs font-medium px-1 rounded">
              {formatYouTubeDuration(duration)}
            </div>
          </>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <span>{formatCompactNumber(viewCount)} views</span>
          <span className="mx-2">•</span>
          <span>{formatRelativeTime(publishedAt)}</span>
        </div>
        <p className="text-muted-foreground">
          {description.length > 120 ? `${description.substring(0, 120)}...` : description}
        </p>
      </CardContent>
    </Card>
  );
};

export default FeaturedVideo;
