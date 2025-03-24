// YouTube API Response Types
export interface YouTubeVideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  channelTitle: string;
  tags?: string[];
  categoryId: string;
}

export interface YouTubeVideoContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  contentRating: {};
}

export interface YouTubeVideoStatistics {
  viewCount: string;
  likeCount: string;
  favoriteCount: string;
  commentCount: string;
}

export interface YouTubeVideo {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeVideoSnippet;
  contentDetails: YouTubeVideoContentDetails;
  statistics: YouTubeVideoStatistics;
}

export interface YouTubeVideoListResponse {
  kind: string;
  etag: string;
  items: YouTubeVideo[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
}

export interface YouTubeChannelSnippet {
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  localized: {
    title: string;
    description: string;
  };
  country?: string;
}

export interface YouTubeChannelStatistics {
  viewCount: string;
  subscriberCount: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

export interface YouTubeChannel {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeChannelSnippet;
  statistics: YouTubeChannelStatistics;
}

export interface YouTubeChannelListResponse {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeChannel[];
}
