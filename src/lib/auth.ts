import type { NextRequest } from "next/server";

export const SITE_AUTH_COOKIE = "lgwc_access";
export type SiteAccessRole = "user" | "admin";

export function getUserPassword() {
  const password = process.env.SITE_PASSWORD_USER || process.env.SITE_PASSWORD;
  if (!password) {
    throw new Error("SITE_PASSWORD (or SITE_PASSWORD_USER) is not configured.");
  }
  return password;
}

export function getAdminPassword() {
  return process.env.SITE_PASSWORD_ADMIN || process.env.ADMIN_PASSWORD || getUserPassword();
}

export function getUserAccessToken() {
  return process.env.SITE_ACCESS_TOKEN_USER || process.env.SITE_ACCESS_TOKEN || getUserPassword();
}

export function getAdminAccessToken() {
  return process.env.SITE_ACCESS_TOKEN_ADMIN || getAdminPassword();
}

export function buildAuthCookieValue(role: SiteAccessRole) {
  const token = role === "admin" ? getAdminAccessToken() : getUserAccessToken();
  return `${role}:${token}`;
}

export function resolveRoleForPassword(password: string): SiteAccessRole | null {
  if (password === getAdminPassword()) {
    return "admin";
  }
  if (password === getUserPassword()) {
    return "user";
  }
  return null;
}

export function getAccessRoleFromCookieValue(cookieValue?: string): SiteAccessRole | null {
  if (!cookieValue) {
    return null;
  }

  if (cookieValue === buildAuthCookieValue("admin") || cookieValue === getAdminAccessToken()) {
    return "admin";
  }

  if (cookieValue === buildAuthCookieValue("user") || cookieValue === getUserAccessToken()) {
    return "user";
  }

  return null;
}

export function getRequestAccessRole(request: NextRequest) {
  const cookieToken = request.cookies.get(SITE_AUTH_COOKIE)?.value;
  return getAccessRoleFromCookieValue(cookieToken);
}

export function isAuthorizedRequest(request: NextRequest) {
  return getRequestAccessRole(request) !== null;
}
