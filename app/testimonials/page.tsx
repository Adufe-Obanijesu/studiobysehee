import TestimonialsPageContent from "@/components/TestimonialsPageContent";
import { buildMetadataForPath } from "@/data/seo";

export const metadata = buildMetadataForPath("/testimonials");

export default function TestimonialsPage() {
  return <TestimonialsPageContent />;
}
