"use client";

import React from "react";
import { ShowcaseTab } from "@/components/dashboard/ShowcaseTab";
import { useDashboard } from "@/context/DashboardContext";

export default function ShowcasePage() {
  const {
    apiKey,
    copiedText,
    copyToClipboard,
    showError,
    showSuccess
  } = useDashboard();

  return (
    <ShowcaseTab
      apiKey={apiKey}
      copiedText={copiedText}
      copyToClipboard={copyToClipboard}
      showError={showError}
      showSuccess={showSuccess}
    />
  );
}
