import { useSubscriberCount } from "@/hooks/useYouTubeData";
import { formatCompactNumber } from "@/lib/utils";
import { Users } from "lucide-react";

const SubscriberCount = () => {
  const { subscriberCount, isLoading, error } = useSubscriberCount();

  return (
    <div className="mt-8 bg-card border border-border rounded-lg p-4 inline-flex items-center shadow-sm">
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
            formatCompactNumber(subscriberCount || 0)
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriberCount;
