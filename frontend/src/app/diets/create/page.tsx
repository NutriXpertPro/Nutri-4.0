import { DietEcosystem } from '@/components/diet-editor/DietEcosystem'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function CreateDietPage() {
    return (
        <DashboardLayout className="bg-background" hideHeader={true}>
            <DietEcosystem />
        </DashboardLayout>
    )
}
