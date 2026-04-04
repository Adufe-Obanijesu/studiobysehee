import PageEnterTemplate from "@/components/PageEnterTemplate";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageEnterTemplate>{children}</PageEnterTemplate>;
}
