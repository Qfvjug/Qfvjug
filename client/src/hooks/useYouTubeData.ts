import { useQuery } from "@tanstack/react-query";
import { YouTubeVideoListResponse, YouTubeChannelListResponse } from "@shared/types";
import React from "react";

export function useChannelData() {
  return useQuery<YouTubeChannelListResponse>({
    queryKey: ['/api/youtube/channel'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVideosList(maxResults: number = 12, pageToken?: string) {
  const queryParams = new URLSearchParams({
    maxResults: maxResults.toString(),
  });
  
  if (pageToken) {
    queryParams.append('pageToken', pageToken);
  }
  
  return useQuery<YouTubeVideoListResponse>({
    queryKey: [`/api/youtube/videos?${queryParams.toString()}`],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVideo(videoId: string, enableAutoRefresh: boolean = false) {
  const query = useQuery<YouTubeVideoListResponse>({
    queryKey: [`/api/youtube/video/${videoId}`],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!videoId,
  });
  
  // Auto-refresh option for featured videos
  React.useEffect(() => {
    if (!enableAutoRefresh) return;
    
    const interval = setInterval(() => {
      if (videoId) {
        query.refetch();
      }
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [videoId, query.refetch, enableAutoRefresh]);
  
  return query;
}

export function useSubscriberCount() {
  const { data, isLoading, error, refetch } = useChannelData();
  
  const subscriberCount = data?.items[0]?.statistics?.subscriberCount 
    ? parseInt(data.items[0].statistics.subscriberCount, 10)
    : null;
  
  // Refetch the data every 30 seconds for live updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  return {
    subscriberCount,
    isLoading,
    error,
    refetch
  };
}

export function useLatestVideos(count: number = 6) {
  const { data, isLoading, error } = useVideosList(count);
  
  return {
    videos: data?.items || [],
    isLoading,
    error,
    hasNextPage: !!data?.nextPageToken,
    nextPageToken: data?.nextPageToken
  };
}

export function useCategorizedVideos(category: string, count: number = 12) {
  const { data, isLoading, error } = useVideosList(count);
  
  // In a real implementation, we would filter by category on the backend
  // For now, we'll just filter the videos client-side
  const filteredVideos = data?.items
    ? data.items.filter(video => {
        // Simple category filtering based on title/description
        const lowerTitle = video.snippet.title.toLowerCase();
        const lowerDescription = video.snippet.description.toLowerCase();
        const lowerCategory = category.toLowerCase();
        
        return lowerTitle.includes(lowerCategory) || 
               lowerDescription.includes(lowerCategory) ||
               (video.snippet.tags && video.snippet.tags.some(tag => 
                 tag.toLowerCase().includes(lowerCategory)
               ));
      })
    : [];
  
  return {
    videos: filteredVideos,
    allVideos: data?.items || [],
    isLoading,
    error,
    hasNextPage: !!data?.nextPageToken,
    nextPageToken: data?.nextPageToken
  };
}
