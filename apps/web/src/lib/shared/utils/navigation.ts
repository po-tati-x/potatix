export function getLessonPath(courseSlug: string, lessonId: string): string {
  if (typeof window === "undefined") {
    // During SSR we can't inspect host, assume non-subdomain viewer path
    return `/viewer/${courseSlug}/lesson/${lessonId}`;
  }

  const host = window.location.hostname;

  // Development sub-domain pattern: xxx.localhost
  if (host.endsWith(".localhost")) {
    const sub = host.replace(".localhost", "");
    if (sub && sub !== "localhost") {
      return `/lesson/${lessonId}`;
    }
  }

  // Production: anything like sub.example.com where base domain is the last 2 labels
  const labels = host.split(".");
  if (labels.length > 2) {
    return `/lesson/${lessonId}`;
  }

  return `/viewer/${courseSlug}/lesson/${lessonId}`;
} 