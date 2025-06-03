"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "./sidebar-nav";

interface AppSidebarNavProps {
  toolContent?: ReactNode;
  newsContent?: ReactNode;
  bottom?: ReactNode;
}

export function AppSidebarNav({
  toolContent,
  newsContent,
  bottom,
}: AppSidebarNavProps) {
  const { slug } = useParams() as { slug?: string };

  return (
    <Sidebar
      slug={slug || "dashboard"}
      toolContent={toolContent}
      newsContent={newsContent}
      bottom={bottom}
    />
  );
}
