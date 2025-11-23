"use client";

import dynamic from "next/dynamic";

// Dynamically import VisitorTracker to avoid SSR issues
const VisitorTracker = dynamic(
  () => import("./VisitorTracker"),
  { ssr: false }
);

export default function VisitorTrackerWrapper() {
  return <VisitorTracker />;
}

