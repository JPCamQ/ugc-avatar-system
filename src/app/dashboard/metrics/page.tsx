"use client";

import React from "react";
import { MetricsTab } from "@/components/dashboard/MetricsTab";
import { useDashboard } from "@/context/DashboardContext";

export default function MetricsPage() {
  const {
    currentAvatar,
    showSuccess,
    showError
  } = useDashboard();

  return (
    <MetricsTab
      currentAvatar={currentAvatar}
      showSuccess={showSuccess}
      showError={showError}
    />
  );
}
