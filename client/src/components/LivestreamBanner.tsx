import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Youtube } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Define type for livestream data
interface LivestreamData {
  isLiveStreaming: boolean;
  liveStreamId?: string;
}

type LivestreamBannerProps = {
  className?: string;
};

export function LivestreamBanner({ className }: LivestreamBannerProps) {
  const { data, isLoading, error } = useQuery<LivestreamData>({
    queryKey: ['/api/livestream'],
    refetchInterval: 60000, // Check for live stream every minute
  });

  const { translate } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  
  // Effect to handle animation when stream is live
  useEffect(() => {
    if (data?.isLiveStreaming) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [data?.isLiveStreaming]);

  if (isLoading || error || !data?.isLiveStreaming) {
    return null;
  }

  const handleWatchNow = () => {
    if (data.liveStreamId) {
      window.open(`https://youtube.com/watch?v=${data.liveStreamId}`, '_blank');
    }
  };

  return (
    <div 
      className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20'} ${className}`}
    >
      <Card className="bg-[#2682B1] mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="animate-pulse">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <div>
                <div className="font-bold text-lg">{translate('liveStream')}</div>
                <div className="text-sm">{translate('liveNow')}</div>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={handleWatchNow} 
              className="bg-white text-[#2682B1] hover:bg-white/90 flex items-center space-x-2"
            >
              <Youtube className="h-4 w-4" />
              <span>{translate('watchNow')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}