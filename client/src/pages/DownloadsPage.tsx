import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DownloadCard, { DownloadCardSkeleton } from "@/components/DownloadCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download as DownloadType } from "@shared/schema";
import { Search } from "lucide-react";

const DownloadsPage = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all downloads
  const { data: downloads, isLoading, error } = useQuery<DownloadType[]>({
    queryKey: ['/api/downloads'],
  });
  
  // Filter downloads based on selected type and search query
  const filteredDownloads = downloads?.filter(download => {
    const matchesType = selectedType ? download.type === selectedType : true;
    const matchesSearch = searchQuery 
      ? download.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (download.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      : true;
    
    return matchesType && matchesSearch;
  });

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Games & Downloads</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Check out my games, mods, and tools. Everything is free to download and play.
          Don't forget to leave feedback!
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button 
            variant={selectedType === null ? "default" : "outline"}
            onClick={() => setSelectedType(null)}
          >
            All
          </Button>
          <Button 
            variant={selectedType === "game" ? "default" : "outline"}
            onClick={() => setSelectedType("game")}
          >
            Games
          </Button>
          <Button 
            variant={selectedType === "mod" ? "default" : "outline"}
            onClick={() => setSelectedType("mod")}
          >
            Mods
          </Button>
          <Button 
            variant={selectedType === "tool" ? "default" : "outline"}
            onClick={() => setSelectedType("tool")}
          >
            Tools
          </Button>
          
          {/* Search */}
          <div className="relative ml-auto">
            <Input
              type="text"
              placeholder="Search downloads..."
              className="pl-10 pr-4 py-2 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Downloads Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <DownloadCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load downloads</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDownloads && filteredDownloads.length > 0 ? (
              filteredDownloads.map((download) => (
                <DownloadCard key={download.id} download={download} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No downloads found matching your criteria</p>
                {(selectedType || searchQuery) && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSelectedType(null);
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DownloadsPage;
