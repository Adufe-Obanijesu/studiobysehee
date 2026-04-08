import AboutPageContent from "@/components/AboutPageContent";
import { buildMetadataForPath } from "@/data/seo";

export const metadata = buildMetadataForPath("/about");

export default function About() {
  return <AboutPageContent />;
}
