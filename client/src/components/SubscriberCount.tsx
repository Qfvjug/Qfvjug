import { useSubscriberCount } from "@/hooks/useYouTubeData";
import { formatCompactNumber } from "@/lib/utils";
import { RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const SubscriberCount = () => {
  const { subscriberCount, isLoading, error, refetch } = useSubscriberCount();

  return (
    <div className="mt-8 bg-card border border-border rounded-lg p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <div className="mr-3 relative">
          <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1 -right-1 animate-pulse"></div>
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Live Subscribers</div>
          <div className="text-xl font-bold">
            {isLoading ? (
              <span className="inline-block w-16 h-6 bg-muted animate-pulse rounded"></span>
            ) : error ? (
              "Failed to load"
            ) : (
              <span className="transition-all duration-300 ease-in-out">
                {formatCompactNumber(subscriberCount || 0)}
              </span>
            )}
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => refetch()} 
        disabled={isLoading}
        className="h-8 w-8 rounded-full"
        title="Refresh subscriber count"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default SubscriberCount;
