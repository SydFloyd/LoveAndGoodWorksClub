"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteResource,
  createResource,
  createStudy,
  getStudyById,
  restoreStudy,
  markPrayerReviewed,
  softDeleteStudy,
  updateResource,
  updateStudy,
  upsertSiteSettings,
} from "@/lib/data";
import {
  adminResourceSchema,
  adminSettingsSchema,
  adminStudySchema,
} from "@/lib/validation";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createStudyAction(formData: FormData) {
  const parsed = adminStudySchema.safeParse({
    title: stringValue(formData, "title"),
    summary: stringValue(formData, "summary"),
    studyDate: stringValue(formData, "studyDate"),
    bodyMd: stringValue(formData, "bodyMd"),
  });

  if (!parsed.success) {
    redirect("/admin/studies?error=invalid-study");
  }

  await createStudy({
    title: parsed.data.title,
    summary: parsed.data.summary,
    studyDate: parsed.data.studyDate,
    bodyMd: parsed.data.bodyMd,
  });

  revalidatePath("/");
  revalidatePath("/studies");
  revalidatePath("/admin/studies");
  redirect("/admin/studies?created=1");
}

export async function updateStudyAction(formData: FormData) {
  const parsed = adminStudySchema.safeParse({
    title: stringValue(formData, "title"),
    summary: stringValue(formData, "summary"),
    studyDate: stringValue(formData, "studyDate"),
    bodyMd: stringValue(formData, "bodyMd"),
  });
  const id = Number(stringValue(formData, "id"));

  if (!parsed.success || !Number.isFinite(id) || id <= 0) {
    redirect("/admin/studies?error=invalid-study-update");
  }

  const existingStudy = await getStudyById(id);
  if (!existingStudy || existingStudy.deletedAt) {
    redirect("/admin/studies?error=invalid-study-update");
  }

  await updateStudy({
    id,
    title: parsed.data.title,
    summary: parsed.data.summary,
    studyDate: parsed.data.studyDate,
    bodyMd: parsed.data.bodyMd,
  });

  revalidatePath("/");
  revalidatePath("/studies");
  revalidatePath("/studies/[slug]", "page");
  revalidatePath(`/studies/${existingStudy.slug}`);
  revalidatePath("/admin/studies");
  revalidatePath("/admin/studies/[id]", "page");
  revalidatePath(`/admin/studies/${id}`);
  redirect("/admin/studies?updated=1");
}

export async function softDeleteStudyAction(formData: FormData) {
  const id = Number(stringValue(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirect("/admin/studies?error=invalid-study-delete");
  }

  await softDeleteStudy(id);
  revalidatePath("/");
  revalidatePath("/studies");
  revalidatePath("/admin/studies");
  redirect("/admin/studies?deleted=1");
}

export async function restoreStudyAction(formData: FormData) {
  const id = Number(stringValue(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirect("/admin/studies?error=invalid-study-restore");
  }

  await restoreStudy(id);
  revalidatePath("/");
  revalidatePath("/studies");
  revalidatePath("/admin/studies");
  redirect("/admin/studies?restored=1");
}

export async function updateSiteSettingsAction(formData: FormData) {
  const parsed = adminSettingsSchema.safeParse({
    welcomeMessage: stringValue(formData, "welcomeMessage"),
  });

  if (!parsed.success) {
    redirect("/admin/content?error=invalid-settings");
  }

  await upsertSiteSettings({
    welcomeMessage: parsed.data.welcomeMessage,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?updated=settings");
}

export async function createResourceAction(formData: FormData) {
  const parsed = adminResourceSchema.safeParse({
    category: stringValue(formData, "category"),
    title: stringValue(formData, "title"),
    url: stringValue(formData, "url"),
    description: stringValue(formData, "description"),
  });

  if (!parsed.success) {
    redirect("/admin/content?error=invalid-resource");
  }

  await createResource({
    category: parsed.data.category,
    title: parsed.data.title,
    url: parsed.data.url,
    description: parsed.data.description || "",
  });

  revalidatePath("/resources");
  revalidatePath("/admin/content");
  redirect("/admin/content?updated=resource");
}

export async function updateResourceAction(formData: FormData) {
  const parsed = adminResourceSchema.safeParse({
    category: stringValue(formData, "category"),
    title: stringValue(formData, "title"),
    url: stringValue(formData, "url"),
    description: stringValue(formData, "description"),
  });
  const id = Number(stringValue(formData, "id"));

  if (!parsed.success || !Number.isFinite(id) || id <= 0) {
    redirect("/admin/content?error=invalid-resource-update");
  }

  await updateResource({
    id,
    category: parsed.data.category,
    title: parsed.data.title,
    url: parsed.data.url,
    description: parsed.data.description || "",
  });

  revalidatePath("/resources");
  revalidatePath("/admin/content");
  redirect("/admin/content?updated=resource-update");
}

export async function deleteResourceAction(formData: FormData) {
  const id = Number(stringValue(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirect("/admin/content?error=invalid-resource-delete");
  }

  await deleteResource(id);

  revalidatePath("/resources");
  revalidatePath("/admin/content");
  redirect("/admin/content?updated=resource-delete");
}

export async function markPrayerReviewedAction(formData: FormData) {
  const idRaw = stringValue(formData, "id");
  const note = stringValue(formData, "reviewerNote");
  const id = Number(idRaw);

  if (!Number.isFinite(id)) {
    redirect("/admin/prayer?error=invalid-id");
  }

  await markPrayerReviewed(id, note.trim());
  revalidatePath("/admin/prayer");
  redirect("/admin/prayer?updated=1");
}
