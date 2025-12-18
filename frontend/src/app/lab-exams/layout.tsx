import { DashboardLayout } from "@/components/layout";

export default function LabExamsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}