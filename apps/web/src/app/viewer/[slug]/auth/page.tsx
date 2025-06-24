import { redirect } from "next/navigation";

import { env } from "@/env";

const BASE_URL = new URL(env.NEXT_PUBLIC_APP_URL ?? "https://potatix.com");

export default async function CourseAuthRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Build callback as root host with slug path (avoids port wildcard issue)
  const callback = `${BASE_URL.origin}/viewer/${slug}`;

  // Central login lives at BASE_URL.origin/login
  redirect(`${BASE_URL.origin}/login?callbackUrl=${encodeURIComponent(callback)}`);
}
