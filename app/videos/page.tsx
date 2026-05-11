import videoData from "@/data/video.json";
import VideoStackLayout from "@/components/Video/VideoStackLayout";
import type { VideoDataItem } from "@/components/Video/types";
import { buildMetadataForPath } from "@/data/seo";

export const metadata = buildMetadataForPath("/videos");

export default function VideoPage() {
  return <VideoStackLayout videos={videoData as VideoDataItem[]} />;
}
