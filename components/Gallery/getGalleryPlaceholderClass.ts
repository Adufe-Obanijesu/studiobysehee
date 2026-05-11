const PLACEHOLDER_CLASSES = [
  "bg-gradient-to-br from-rose-200/70 via-orange-200/60 to-amber-200/70",
  "bg-gradient-to-br from-sky-200/70 via-cyan-200/60 to-teal-200/70",
  "bg-gradient-to-br from-violet-200/70 via-fuchsia-200/60 to-pink-200/70",
  "bg-gradient-to-br from-lime-200/70 via-emerald-200/60 to-green-200/70",
  "bg-gradient-to-br from-indigo-200/70 via-blue-200/60 to-sky-200/70",
  "bg-gradient-to-br from-yellow-200/70 via-orange-200/60 to-rose-200/70",
];

export function getGalleryPlaceholderClass(id: number) {
  const index = Math.abs(id) % PLACEHOLDER_CLASSES.length;
  return PLACEHOLDER_CLASSES[index];
}
