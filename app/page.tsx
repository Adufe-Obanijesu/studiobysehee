import HomePageContent from "@/components/HomePageContent";
import { buildMetadataForPath } from "@/data/seo";

export const metadata = buildMetadataForPath("/");

export default function Home() {
  return <HomePageContent />;
}
