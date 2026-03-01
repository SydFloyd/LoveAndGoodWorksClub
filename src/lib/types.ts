export type SiteSettings = {
  welcomeMessage: string;
  updatedAt: Date;
};

export type Study = {
  id: number;
  slug: string;
  title: string;
  bodyMd: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type PrayerRequest = {
  id: number;
  requesterName: string | null;
  requesterEmail: string | null;
  isAnonymous: boolean;
  requestText: string;
  reviewed: boolean;
  reviewerNote: string;
  submittedIpHash: string;
  createdAt: Date;
};

export type ResourceLink = {
  id: number;
  category: "BOOK" | "ARTICLE" | "TOOL";
  title: string;
  url: string;
  description: string;
  createdAt: Date;
};
