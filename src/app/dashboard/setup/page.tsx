"use client";

import React from "react";
import { SetupTab } from "@/components/dashboard/SetupTab";
import { useDashboard } from "@/context/DashboardContext";

export default function SetupPage() {
  const {
    currentAvatar,
    setupData,
    generatingSetup,
    handleGetSetupData,
    copiedText,
    copyToClipboard
  } = useDashboard();

  return (
    <SetupTab
      currentAvatar={currentAvatar}
      setupData={setupData}
      generatingSetup={generatingSetup}
      handleGetSetupData={handleGetSetupData}
      copiedText={copiedText}
      copyToClipboard={copyToClipboard}
    />
  );
}
