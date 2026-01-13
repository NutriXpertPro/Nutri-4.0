'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Download,
  Printer,
  X,
  Clock,
  Phone,
  MapPin,
  Mail,
  Flame,
  Beef,
  Wheat,
  Droplets
} from 'lucide-react';
import api from '@/services/api';

import { DietPaperTemplate } from './DietPaperTemplate';

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  name: string;
  time: string;
  items: FoodItem[];
}

interface DietData {
  patientName: string;
  patientAge: number;
  patientGoal: string;
  dietName: string;
  dietType: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  meals: Meal[];
}

interface PatientDietPDFViewProps {
  dietData: DietData;
  onClose: () => void;
}

// --- Component Principal ---

export function PatientDietPDFView({ dietData, onClose }: PatientDietPDFViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-auto flex justify-center py-8 print:p-0 print:bg-white print:fixed print:inset-0">
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-full { width: 100% !important; max-width: none !important; margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
        `}
      </style>

      {/* Main Container */}
      <div
        className="w-full max-w-[210mm] bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col print-full"
      >

        {/* Actions Bar (Hidden in Print) */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10 no-print">
          <h2 className="text-base font-semibold flex items-center gap-2 text-slate-800">
            📄 Visualização do Plano Alimentar
          </h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir / PDF
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div ref={contentRef} className="flex-1 p-8 md:p-10 print:p-6 bg-white text-slate-800 font-sans">
            <DietPaperTemplate dietData={dietData} />
        </div>
      </div>
    </div>
  );
}