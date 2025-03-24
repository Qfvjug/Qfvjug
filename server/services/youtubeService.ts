import { YouTubeVideoListResponse, YouTubeChannelListResponse } from '@shared/types';

// YouTube API base URL
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Get YouTube API key from environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

export class YouTubeService {
  /**
   * Get channel information including subscriber count
   * @param channelId YouTube channel ID
   */
  static async getChannelInfo(channelId: string = process.env.YOUTUBE_CHANNEL_ID || ''): Promise<YouTubeChannelListResponse> {
    try {
      // Use the provided channelId or fall back to the environment variable
      const effectiveChannelId = channelId || process.env.YOUTUBE_CHANNEL_ID || '';
      console.log(`Fetching channel info for: ${effectiveChannelId}`);
      
      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics&id=${effectiveChannelId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching channel info:', error);
      throw error;
    }
  }
  
  /**
   * Get videos from a channel
   * @param channelId YouTube channel ID
   * @param maxResults Maximum number of results to return
   * @param pageToken Page token for pagination
   */
  static async getChannelVideos(
    channelId: string = process.env.YOUTUBE_CHANNEL_ID || '', 
    maxResults: number = 50,
    pageToken?: string
  ): Promise<YouTubeVideoListResponse> {
    try {
      // Use the provided channelId or fall back to the environment variable
      const effectiveChannelId = channelId || process.env.YOUTUBE_CHANNEL_ID || '';
      console.log(`Fetching videos for channel: ${effectiveChannelId}`);
      
      // First get playlist ID for uploads
      const channelResponse = await fetch(
        `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&id=${effectiveChannelId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!channelResponse.ok) {
        throw new Error(`YouTube API error: ${channelResponse.statusText}`);
      }
      
      const channelData = await channelResponse.json();
      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
      
      if (!uploadsPlaylistId) {
        throw new Error('Could not find uploads playlist for channel');
      }
      
      // Then get videos from the uploads playlist
      let url = `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`;
      
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }
      
      const videosResponse = await fetch(url);
      
      if (!videosResponse.ok) {
        throw new Error(`YouTube API error: ${videosResponse.statusText}`);
      }
      
      const playlistData = await videosResponse.json();
      
      // Extract video IDs
      const videoIds = playlistData.items
        .map((item: any) => item.snippet.resourceId.videoId)
        .join(',');
      
      // Get full video details
      const detailsResponse = await fetch(
        `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!detailsResponse.ok) {
        throw new Error(`YouTube API error: ${detailsResponse.statusText}`);
      }
      
      const videoDetails = await detailsResponse.json();
      
      // Return combined data
      return {
        ...videoDetails,
        pageInfo: videoDetails.pageInfo,
        nextPageToken: playlistData.nextPageToken
      };
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      throw error;
    }
  }
  
  /**
   * Get a single video by ID
   * @param videoId YouTube video ID
   */
  static async getVideo(videoId: string): Promise<YouTubeVideoListResponse> {
    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }
  
  /**
   * Format duration from ISO 8601 to human-readable format (e.g. PT1H2M3S to 1:02:03)
   * @param isoDuration ISO 8601 duration string
   */
  static formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }
  
  /**
   * Format view count to human-readable format (e.g. 1234567 to 1.2M)
   * @param viewCount View count as string
   */
  static formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount, 10);
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    } else {
      return count.toString();
    }
  }
}
