import videoData from "@/data/video.json";
import VideoStackLayout from "@/components/Video/VideoStackLayout";
import type { VideoDataItem } from "@/components/Video/types";

export default function VideoPage() {
  return <VideoStackLayout videos={videoData as VideoDataItem[]} />;
}
