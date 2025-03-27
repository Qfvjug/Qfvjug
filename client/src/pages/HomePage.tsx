import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLatestVideos } from "@/hooks/useYouTubeData";
import FeaturedVideo from "@/components/FeaturedVideo";
import SubscriberCount from "@/components/SubscriberCount";
import NewsTicker from "@/components/NewsTicker";
import NotificationSection from "@/components/NotificationSection";
import SocialLinks from "@/components/SocialLinks";
import { ChannelQRCode } from "@/components/ChannelQRCode";
import { Play, Download } from "lucide-react";
import { VideoCardSkeleton } from "@/components/VideoCard";

const HomePage = () => {
  // Fetch site settings to get the featured video ID
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  // Featured video ID (use a default if not found)
  const featuredVideoId = settings?.featuredVideoId || "dQw4w9WgXcQ"; // Default video

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></div>
                <span>New video: Minecraft Modding</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Qfvjug's Official Website</h1>
              <p className="text-muted-foreground text-lg mb-6">
                The ultimate website for my YouTube channel! Find all my videos, games, and exclusive content in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/videos">
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Watch Videos
                  </Button>
                </Link>
                <Link href="/downloads">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Download className="h-5 w-5" />
                    Download Games
                  </Button>
                </Link>
              </div>

              {/* Live Subscriber Count */}
              <SubscriberCount />
            </div>

            {/* Featured Video */}
            <FeaturedVideo videoId={featuredVideoId} />
          </div>
        </div>
      </section>

      {/* News Ticker */}
      <NewsTicker />

      {/* Latest Videos Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest Videos</h2>
            <Link href="/videos">
              <Button variant="link">View All</Button>
            </Link>
          </div>

          <LatestVideosGrid />
        </div>
      </section>

      {/* Notification Section */}
      <NotificationSection />

      {/* Connect Section with QR Code */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Verbinde dich mit mir</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* QR Code */}
            <div className="md:order-2">
              <ChannelQRCode />
            </div>
            
            {/* Info text */}
            <div className="space-y-4 md:order-1">
              <h3 className="text-2xl font-semibold">Scanne den QR-Code</h3>
              <p className="text-muted-foreground">
                Scanne einfach diesen QR-Code mit deinem Smartphone, um direkt zu meinem YouTube-Kanal zu gelangen. 
                Abonniere den Kanal, um keine neuen Videos zu verpassen!
              </p>
              <p className="text-muted-foreground">
                Du kannst den QR-Code auch mit Freunden teilen, die an meinen Inhalten interessiert sein könnten.
              </p>
              <div className="pt-4">
                <Button size="lg" onClick={() => window.open('https://youtube.com/channel/' + settings?.youtubeChannelId, '_blank')}>
                  Zum Kanal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <SocialLinks />
    </>
  );
};

const LatestVideosGrid = () => {
  const { videos, isLoading, error } = useLatestVideos(3);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <VideoCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load latest videos</p>
        <Button variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="bg-card rounded-xl overflow-hidden shadow-md border border-border transition-transform hover:-translate-y-1 hover:shadow-lg">
          <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
            <div className="relative pb-[56.25%] h-0">
              <img 
                src={video.snippet.thumbnails.high.url} 
                alt={video.snippet.title} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{video.snippet.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {video.snippet.description}
              </p>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
