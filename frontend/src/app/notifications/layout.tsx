import { DashboardLayout } from "@/components/layout";

export default function NotificationsLayout({
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