import type { Metadata } from "next";

export const SITE_NAME = "Nexworth";

// A page's own `openGraph`/`twitter` metadata object *replaces* its parent's
// entirely rather than merging (see Next.js's metadata "Overwriting fields"
// docs) — so any page that sets its own openGraph/twitter title has to
// re-spread this image in too, or it silently loses the image the parent
// layout set. Keeping it here as a shared constant is the pattern Next's own
// docs recommend for exactly this case.
export const DEFAULT_OG_IMAGES: NonNullable<Metadata["openGraph"]>["images"] = [
  {
    url: "/nexworth-og-signin.jpeg",
    width: 1424,
    height: 752,
    alt: SITE_NAME,
  },
];
