export type VideoDataItem = {
  id: string;
  client: string;
  videoUrl: string;
  thumbnail: string;
};

export type VideoItem = VideoDataItem & {
  youtubeId: string;
  embedUrl: string;
  thumbnailUrl: string;
};
