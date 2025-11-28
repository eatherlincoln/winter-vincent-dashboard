// src/pages/Admin.tsx
import React from "react";

// Auth gate (keeps this page private). If you removed AdminGate, you can delete the wrapper.
import AdminGate from "@/components/admin/AdminGate";

// Shared admin layout container (title bar, padding, etc.)
import AdminLayout from "@/components/admin/AdminLayout";

// Sections (already in your repo)
import AudienceGlobalEditor from "@/components/admin/AudienceGlobalEditor";
import StatsForm from "@/components/admin/StatsForm";
import BrandAssets from "@/components/admin/BrandAssets";

// Reusable top-posts editor (one component, three uses)
import AdminTopPosts from "@/components/admin/AdminTopPosts";

function Admin() {
  return (
    <AdminGate>
      <AdminLayout title="Admin Dashboard">
        <div className="space-y-8">
          {/* 1) Demographics (global, single source of truth) */}
          <AudienceGlobalEditor />

          {/* 2) KPI metrics (followers, monthly views, engagement auto-recalc) */}
          <StatsForm />

          {/* 3) Brand imagery */}
          <BrandAssets />

          {/* 3) Top posts per platform */}
          <div className="space-y-8">
            <AdminTopPosts platform="instagram" />
            <AdminTopPosts platform="youtube" />
            <AdminTopPosts platform="tiktok" />
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export default Admin;
