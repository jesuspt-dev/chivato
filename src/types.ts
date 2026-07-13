export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type ModerationStatus = "pending" | "published" | "reported" | "hidden";

export interface Review {
  id: string;
  author: string;
  rating: number;
  livePeriod: string; // e.g. "Sep 2021 - Ene 2023 (1 año, 4 meses)"
  comments: string;
  tags: string[];
  verified: boolean; // backwards-compatible boolean used by existing UI/data
  verificationStatus?: VerificationStatus;
  moderationStatus?: ModerationStatus;
  reportCount?: number;
  date: string; // e.g. "15 Feb 2023"
  photos?: string[]; // Custom photos uploaded with this review
  propertyId?: string; // Backlink to property
  propertyAddress?: string; // Quick cache of address for independent rendering
  propertyDistrict?: string; // Quick cache of district
  ratingsBreakdown?: {
    casero: number;
    mantenimiento: number;
    vecindad: number;
  };
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface Property {
  id: string;
  address: string;
  flat: string;
  district: string;
  city: string;
  coords?: [number, number]; // [latitude, longitude]
  overallRating: number;
  ratingsBreakdown: {
    casero: number;
    mantenimiento: number;
    vecindad: number;
  };
  alerts: Alert[];
  gallery: {
    url: string;
    caption: string;
  }[];
  reviews: Review[];
}
