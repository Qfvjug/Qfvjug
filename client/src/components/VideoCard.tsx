import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber, formatRelativeTime, formatYouTubeDuration } from "@/lib/utils";
import { YouTubeVideo } from "@shared/types";

type VideoCardProps = {
  video: YouTubeVideo;
  onClick?: () => void;
};

const VideoCard = ({ video, onClick }: VideoCardProps) => {
  if (!video) {
    return <VideoCardSkeleton />;
  }

  const { snippet, statistics, contentDetails } = video;
  const { title, publishedAt, thumbnails } = snippet;
  
  // Get the best thumbnail available
  const thumbnail = thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium;
  
  // Format duration
  const duration = formatYouTubeDuration(contentDetails.duration);
  
  // Format view count
  const views = formatCompactNumber(statistics.viewCount);
  
  // Format publish date
  const timeAgo = formatRelativeTime(publishedAt);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
    }
  };

  return (
    <Card 
      className="rounded-xl overflow-hidden shadow-md border border-border bg-card cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="relative pb-[56.25%] h-0">
        <img 
          src={thumbnail.url} 
          alt={`Thumbnail for ${title}`} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs font-medium px-1 rounded">
          {duration}
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold mb-1 line-clamp-2 text-sm sm:text-base">{title}</h3>
        <div className="flex items-center text-muted-foreground text-xs">
          <span>{views} views</span>
          <span className="mx-1">•</span>
          <span>{timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const VideoCardSkeleton = () => {
  return (
    <Card className="rounded-xl overflow-hidden shadow-md border border-border bg-card">
      <div className="relative pb-[56.25%] h-0">
        <Skeleton className="absolute inset-0" />
      </div>
      <CardContent className="p-3">
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
};

export default VideoCard;
