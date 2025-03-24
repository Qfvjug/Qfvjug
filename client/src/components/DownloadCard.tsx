import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Download as DownloadType } from "@shared/schema";
import { formatCompactNumber, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type DownloadCardProps = {
  download: DownloadType;
};

const DownloadCard = ({ download }: DownloadCardProps) => {
  const { toast } = useToast();

  if (!download) {
    return <DownloadCardSkeleton />;
  }

  const {
    id,
    title,
    description,
    type,
    version,
    thumbnailUrl,
    downloadCount,
    rating,
    ratingCount,
    releaseDate
  } = download;

  // Calculate rating stars
  const renderRatingStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 dark:text-gray-600">★</span>
        ))}
        <span className="ml-1 text-xs text-muted-foreground">
          ({ratingCount})
        </span>
      </div>
    );
  };

  // Badge color based on type
  const getBadgeColor = () => {
    switch (type) {
      case 'game':
        return 'bg-primary';
      case 'mod':
        return 'bg-blue-500';
      case 'tool':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDownload = async () => {
    try {
      // Increment download count
      await apiRequest('POST', `/api/downloads/${id}/increment`, null);
      
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/downloads'] });
      
      // Redirect to download URL (in a real app this would point to an actual file)
      window.open(download.downloadUrl, '_blank');
      
      toast({
        title: "Download started",
        description: `${title} is now downloading.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card rounded-xl overflow-hidden shadow-md border border-border transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48">
        <img 
          src={thumbnailUrl} 
          alt={`Screenshot of ${title}`} 
          className="w-full h-full object-cover" 
        />
        <div className={`absolute top-3 left-3 ${getBadgeColor()} rounded-full px-3 py-1 text-xs text-white font-medium`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{title}</h3>
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">
            v{version}
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm mt-2 mb-3 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center text-muted-foreground text-xs mt-2 mb-4">
          <span>{formatCompactNumber(downloadCount)} downloads</span>
          <span className="mx-2">•</span>
          <span>Released: {new Date(releaseDate).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          {renderRatingStars()}
          <Button 
            size="sm" 
            className="inline-flex items-center"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const DownloadCardSkeleton = () => {
  return (
    <Card className="bg-card rounded-xl overflow-hidden shadow-md border border-border">
      <Skeleton className="h-48" />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-4 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadCard;
