import { DashboardLayout } from "@/components/layout";
import { type ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}