import { Suspense } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DietEcosystem } from '@/components/diet-editor/DietEcosystem'

export default function CreateDietPage() {
    return (
        <DashboardLayout className="bg-background" hideHeader={true}>
            <div suppressHydrationWarning>
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                }>
                    <DietEcosystem />
                </Suspense>
            </div>
        </DashboardLayout>
    )
}
