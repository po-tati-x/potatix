"use client";

import { useParams } from "next/navigation";
import { ReactNode } from "react";
import { Sidebar } from "./sidebar-nav";

export function AppSidebarNav({
  toolContent,
  newsContent,
}: {
  toolContent?: ReactNode;
  newsContent?: ReactNode;
}) {
  const { slug } = useParams() as { slug?: string };

  return (
    <Sidebar
      slug={slug || "workspace"}
      toolContent={toolContent}
      newsContent={newsContent}
      bottom={
        <>
        </>
      }
    />
  );
}
