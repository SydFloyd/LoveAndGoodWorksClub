import { z } from "zod";

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
  next: z.string().optional(),
});

export const prayerRequestSchema = z
  .object({
    requesterName: z.string().trim().max(120).optional(),
    requesterEmail: z.string().trim().email().max(180).optional().or(z.literal("")),
    requestText: z.string().trim().min(10).max(5000),
  })
  .transform((value) => ({
    requesterName: value.requesterName?.trim() || null,
    requesterEmail: value.requesterEmail?.trim() || null,
    requestText: value.requestText.trim(),
  }));

export const adminStudySchema = z.object({
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().min(8).max(320),
  studyDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD for study date.")
    .refine((value) => !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime()), {
      message: "Study date is invalid.",
    }),
  memoryVerses: z.string().trim().max(500),
  bodyMd: z.string().trim().min(10).max(50000),
});

export const adminSettingsSchema = z.object({
  welcomeMessage: z.string().trim().min(10).max(4000),
});

export const adminResourceSchema = z.object({
  category: z.enum(["BOOK", "ARTICLE", "TOOL"]),
  title: z.string().trim().min(2).max(200),
  url: z.string().trim().url().max(500),
  description: z.string().trim().max(2000).optional(),
});
