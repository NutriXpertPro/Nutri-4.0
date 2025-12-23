"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { SkinfoldForm } from "@/components/evaluations/SkinfoldForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SkinfoldEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = parseInt(params.id as string);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Avaliação de Dobra Cutânea</h1>
            <p className="text-muted-foreground">Medidas com adipômetro</p>
          </div>
        </div>

        <SkinfoldForm
          patientId={patientId}
          onBack={() => router.back()}
        />
      </div>
    </DashboardLayout>
  );
}