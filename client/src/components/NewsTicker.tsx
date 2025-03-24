import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

type NewsTickerProps = {
  speed?: number;
};

const NewsTicker = ({ speed = 30 }: NewsTickerProps) => {
  const [tickerItems, setTickerItems] = useState<string[]>([
    "Welcome to Qfvjug's YouTube Channel Website!",
    "Check out the latest videos and game downloads",
    "Join our Discord community for exclusive content!"
  ]);

  // Fetch ticker items from API
  const { data } = useQuery<{ newsTickerItems: string[] }>({
    queryKey: ['/api/settings'],
    select: (data) => ({ newsTickerItems: data.newsTickerItems || [] }),
  });

  // Update ticker items when data is fetched
  useEffect(() => {
    if (data?.newsTickerItems && data.newsTickerItems.length > 0) {
      setTickerItems(data.newsTickerItems);
    }
  }, [data]);

  // Calculate animation duration based on content length and speed
  const calculateDuration = () => {
    const totalLength = tickerItems.join(" • ").length;
    // The lower the speed value, the faster the animation
    return `${totalLength * speed}s`;
  };

  return (
    <div className="bg-accent/10 py-3 overflow-hidden">
      <div 
        className="whitespace-nowrap animate-ticker inline-block"
        style={{ 
          animation: `ticker ${calculateDuration()} linear infinite`,
          animationDuration: calculateDuration()
        }}
      >
        <div className="inline-flex items-center px-4 space-x-8">
          {tickerItems.map((item, index) => (
            <span key={index} className="font-medium">
              {index > 0 ? "• " : ""}{item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add animation to global styles (added via CSS in App)
const tickerAnimation = `
@keyframes ticker {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.animate-ticker {
  animation: ticker 30s linear infinite;
}
`;

export default NewsTicker;
