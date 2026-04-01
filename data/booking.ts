export const SHOOT_LOCATION_OPTIONS = [
  { value: "studio-la", label: "Studio — Los Angeles" },
  { value: "studio-ny", label: "Studio — New York" },
  { value: "outdoor", label: "Outdoor / on location" },
  { value: "undecided", label: "Not sure yet" },
] as const;

export const DISCOVERY_SOURCE_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "referral", label: "Friend or colleague" },
  { value: "search", label: "Search engine" },
  { value: "other", label: "Other" },
] as const;
