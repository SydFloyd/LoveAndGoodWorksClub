import slugify from "slugify";
import { unstable_noStore as noStore } from "next/cache";
import { sql } from "@/lib/db";
import type {
  PrayerRequest,
  ResourceLink,
  SiteSettings,
  Study,
  StudyMemoryVerse,
} from "@/lib/types";

type SiteSettingsRow = {
  welcome_message: string;
  updated_at: Date;
};

type StudyRow = {
  id: number | string;
  slug: string;
  title: string;
  summary: string;
  study_date: Date | string;
  memory_verses: string | null;
  body_md: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

type StudyMemoryVerseRow = {
  id: number | string;
  slug: string;
  title: string;
  study_date: Date | string;
  memory_verses: string | null;
};

type PrayerRequestRow = {
  id: number | string;
  requester_name: string | null;
  requester_email: string | null;
  is_anonymous: boolean;
  request_text: string;
  reviewed: boolean;
  reviewer_note: string;
  submitted_ip_hash: string;
  created_at: Date;
};

type ResourceRow = {
  id: number | string;
  category: "BOOK" | "ARTICLE" | "TOOL";
  title: string;
  url: string;
  description: string;
  created_at: Date;
};

function mapSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    welcomeMessage: row.welcome_message,
    updatedAt: row.updated_at,
  };
}

function markdownPreview(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function normalizeDate(value: Date | string): Date {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 12, 0, 0));
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00Z`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return parsed;
}

function mapStudy(row: StudyRow): Study {
  const summary = row.summary.trim() || markdownPreview(row.body_md) || "Study outline available.";
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`Invalid study id: ${String(row.id)}`);
  }

  return {
    id,
    slug: row.slug,
    title: row.title,
    summary,
    studyDate: normalizeDate(row.study_date),
    memoryVerses: (row.memory_verses || "").trim(),
    bodyMd: row.body_md,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function mapStudyMemoryVerse(row: StudyMemoryVerseRow): StudyMemoryVerse {
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`Invalid study id: ${String(row.id)}`);
  }

  return {
    id,
    slug: row.slug,
    title: row.title,
    studyDate: normalizeDate(row.study_date),
    memoryVerses: (row.memory_verses || "").trim(),
  };
}

function mapPrayerRequest(row: PrayerRequestRow): PrayerRequest {
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`Invalid prayer request id: ${String(row.id)}`);
  }

  return {
    id,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    isAnonymous: row.is_anonymous,
    requestText: row.request_text,
    reviewed: row.reviewed,
    reviewerNote: row.reviewer_note,
    submittedIpHash: row.submitted_ip_hash,
    createdAt: row.created_at,
  };
}

function mapResource(row: ResourceRow): ResourceLink {
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`Invalid resource id: ${String(row.id)}`);
  }

  return {
    id,
    category: row.category,
    title: row.title,
    url: row.url,
    description: row.description,
    createdAt: row.created_at,
  };
}

export async function getSiteSettings() {
  const [row] = await sql<SiteSettingsRow[]>`
    select
      welcome_message,
      updated_at
    from site_settings
    where id = 1
    limit 1
  `;

  if (!row) {
    throw new Error("Site settings are not initialized.");
  }

  return mapSiteSettings(row);
}

export async function listStudies(params: { query?: string }) {
  noStore();
  const searchQuery = params.query?.trim() || null;

  const rows = await sql<StudyRow[]>`
    select
      s.id,
      s.slug,
      s.title,
      s.summary,
      s.study_date,
      s.memory_verses,
      s.body_md,
      s.created_at,
      s.updated_at,
      s.deleted_at
    from studies s
    where (
      ${searchQuery}::text is null
      or s.title ilike '%' || ${searchQuery} || '%'
      or s.summary ilike '%' || ${searchQuery} || '%'
      or s.memory_verses ilike '%' || ${searchQuery} || '%'
      or s.body_md ilike '%' || ${searchQuery} || '%'
    )
    and s.deleted_at is null
    order by s.study_date desc, s.created_at desc
  `;

  return rows.map(mapStudy);
}

export async function listTrashedStudies() {
  noStore();
  const rows = await sql<StudyRow[]>`
    select
      s.id,
      s.slug,
      s.title,
      s.summary,
      s.study_date,
      s.memory_verses,
      s.body_md,
      s.created_at,
      s.updated_at,
      s.deleted_at
    from studies s
    where s.deleted_at is not null
    order by s.deleted_at desc, s.updated_at desc
  `;

  return rows.map(mapStudy);
}

export async function getStudyBySlug(slug: string) {
  noStore();
  const [row] = await sql<StudyRow[]>`
    select
      s.id,
      s.slug,
      s.title,
      s.summary,
      s.study_date,
      s.memory_verses,
      s.body_md,
      s.created_at,
      s.updated_at,
      s.deleted_at
    from studies s
    where s.slug = ${slug}
    and s.deleted_at is null
    limit 1
  `;

  return row ? mapStudy(row) : null;
}

export async function getStudyById(id: number) {
  noStore();
  const [row] = await sql<StudyRow[]>`
    select
      s.id,
      s.slug,
      s.title,
      s.summary,
      s.study_date,
      s.memory_verses,
      s.body_md,
      s.created_at,
      s.updated_at,
      s.deleted_at
    from studies s
    where s.id = ${id}
    limit 1
  `;

  return row ? mapStudy(row) : null;
}

export async function createStudy(input: {
  title: string;
  summary: string;
  studyDate: string;
  memoryVerses: string;
  bodyMd: string;
}) {
  const baseSlug = slugify(input.title, { lower: true, strict: true, trim: true }) || "study";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await sql<{ id: number }[]>`
      select id
      from studies
      where slug = ${slug}
      limit 1
    `;
    if (existing.length === 0) {
      break;
    }
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const [study] = await sql<{ id: number; slug: string }[]>`
    insert into studies (slug, title, summary, study_date, memory_verses, body_md)
    values (
      ${slug},
      ${input.title},
      ${input.summary},
      ${input.studyDate}::date,
      ${input.memoryVerses},
      ${input.bodyMd}
    )
    returning id, slug
  `;

  return study.slug;
}

export async function updateStudy(input: {
  id: number;
  title: string;
  summary: string;
  studyDate: string;
  memoryVerses: string;
  bodyMd: string;
}) {
  await sql`
    update studies
    set
      title = ${input.title},
      summary = ${input.summary},
      study_date = ${input.studyDate}::date,
      memory_verses = ${input.memoryVerses},
      body_md = ${input.bodyMd},
      updated_at = now()
    where id = ${input.id}
      and deleted_at is null
  `;
}

export async function listStudyMemoryVerses() {
  noStore();
  const rows = await sql<StudyMemoryVerseRow[]>`
    select
      s.id,
      s.slug,
      s.title,
      s.study_date,
      s.memory_verses
    from studies s
    where s.deleted_at is null
    order by s.study_date desc, s.created_at desc
  `;

  return rows.map(mapStudyMemoryVerse);
}

export async function softDeleteStudy(id: number) {
  await sql`
    update studies
    set deleted_at = now(), updated_at = now()
    where id = ${id}
      and deleted_at is null
  `;
}

export async function restoreStudy(id: number) {
  await sql`
    update studies
    set deleted_at = null, updated_at = now()
    where id = ${id}
      and deleted_at is not null
  `;
}

export async function createPrayerRequest(input: {
  requesterName: string | null;
  requesterEmail: string | null;
  isAnonymous: boolean;
  requestText: string;
  submittedIpHash: string;
}) {
  await sql`
    insert into prayer_requests (
      requester_name,
      requester_email,
      is_anonymous,
      request_text,
      submitted_ip_hash
    )
    values (
      ${input.requesterName},
      ${input.requesterEmail},
      ${input.isAnonymous},
      ${input.requestText},
      ${input.submittedIpHash}
    )
  `;
}

export async function listPrayerRequestsSince(days: number) {
  noStore();
  const rows = await sql<PrayerRequestRow[]>`
    select
      id,
      requester_name,
      requester_email,
      is_anonymous,
      request_text,
      reviewed,
      reviewer_note,
      submitted_ip_hash,
      created_at
    from prayer_requests
    where created_at >= now() - (${days} * interval '1 day')
    order by created_at desc
  `;
  return rows.map(mapPrayerRequest);
}

function normalizeDateFilter(value?: string) {
  const input = value?.trim() || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return null;
  }
  const parsed = new Date(`${input}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : input;
}

export async function listPrayerRequests(params: {
  page: number;
  pageSize: number;
  pendingOnly?: boolean;
  requesterName?: string;
  fromDate?: string;
  toDate?: string;
}) {
  noStore();
  const pendingOnly = Boolean(params.pendingOnly);
  const requesterName = params.requesterName?.trim() || null;
  const fromDate = normalizeDateFilter(params.fromDate);
  const toDate = normalizeDateFilter(params.toDate);
  const pageSize = Number.isFinite(params.pageSize) ? Math.max(1, Math.min(100, Math.floor(params.pageSize))) : 25;
  const requestedPage = Number.isFinite(params.page) ? Math.max(1, Math.floor(params.page)) : 1;

  const [countRow] = await sql<{ total: number | string }[]>`
    select count(*)::int as total
    from prayer_requests p
    where (
      ${pendingOnly}::boolean = false
      or p.reviewed = false
    )
    and (
      ${requesterName}::text is null
      or coalesce(p.requester_name, '') ilike '%' || ${requesterName} || '%'
    )
    and (
      ${fromDate}::date is null
      or p.created_at::date >= ${fromDate}::date
    )
    and (
      ${toDate}::date is null
      or p.created_at::date <= ${toDate}::date
    )
  `;

  const total = Number(countRow?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * pageSize;

  const rows = await sql<PrayerRequestRow[]>`
    select
      p.id,
      p.requester_name,
      p.requester_email,
      p.is_anonymous,
      p.request_text,
      p.reviewed,
      p.reviewer_note,
      p.submitted_ip_hash,
      p.created_at
    from prayer_requests p
    where (
      ${pendingOnly}::boolean = false
      or p.reviewed = false
    )
    and (
      ${requesterName}::text is null
      or coalesce(p.requester_name, '') ilike '%' || ${requesterName} || '%'
    )
    and (
      ${fromDate}::date is null
      or p.created_at::date >= ${fromDate}::date
    )
    and (
      ${toDate}::date is null
      or p.created_at::date <= ${toDate}::date
    )
    order by p.created_at desc
    limit ${pageSize}
    offset ${offset}
  `;

  return {
    items: rows.map(mapPrayerRequest),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getPrayerRequestStats() {
  noStore();
  const [row] = await sql<{ total: number | string; unreviewed: number | string }[]>`
    select
      count(*)::int as total,
      count(*) filter (where reviewed = false)::int as unreviewed
    from prayer_requests
  `;

  return {
    total: Number(row?.total || 0),
    unreviewed: Number(row?.unreviewed || 0),
  };
}

export async function markPrayerReviewed(id: number, reviewerNote: string) {
  await sql`
    update prayer_requests
    set reviewed = true, reviewer_note = ${reviewerNote}
    where id = ${id}
  `;
}

export async function upsertSiteSettings(input: {
  welcomeMessage: string;
}) {
  await sql`
    update site_settings
    set
      welcome_message = ${input.welcomeMessage},
      updated_at = now()
    where id = 1
  `;
}

export async function getResources() {
  const rows = await sql<ResourceRow[]>`
    select id, category, title, url, description, created_at
    from resources_links
    order by category asc, created_at asc
  `;
  return rows.map(mapResource);
}

export async function createResource(input: {
  category: "BOOK" | "ARTICLE" | "TOOL";
  title: string;
  url: string;
  description: string;
}) {
  await sql`
    insert into resources_links (category, title, url, description)
    values (${input.category}, ${input.title}, ${input.url}, ${input.description})
  `;
}

export async function updateResource(input: {
  id: number;
  category: "BOOK" | "ARTICLE" | "TOOL";
  title: string;
  url: string;
  description: string;
}) {
  await sql`
    update resources_links
    set
      category = ${input.category},
      title = ${input.title},
      url = ${input.url},
      description = ${input.description}
    where id = ${input.id}
  `;
}

export async function deleteResource(id: number) {
  await sql`
    delete from resources_links
    where id = ${id}
  `;
}
