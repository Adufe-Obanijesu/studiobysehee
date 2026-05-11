import PeoplePageContent from "@/components/PeoplePageContent";
import { buildMetadataForPath } from "@/data/seo";

export const metadata = buildMetadataForPath("/people");

export default function PeoplePage() {
  return <PeoplePageContent />;
}
