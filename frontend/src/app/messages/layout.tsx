import { DashboardLayout } from "@/components/layout";

export default function XpertMessengerLayout({
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