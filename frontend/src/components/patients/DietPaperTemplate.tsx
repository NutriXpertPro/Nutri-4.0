'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Phone,
  MapPin,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Utensils
} from 'lucide-react';
import api from '@/services/api';

// --- Interfaces ---

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

interface DietPaperTemplateProps {
  dietData: DietData;
}

interface BrandingSettings {
  logo?: string;
  signature_image?: string;
  primary_color: string;
  secondary_color: string;
  business_name: string;
  crn_number: string;
  email_signature: string;
  phone: string;
  address: string;
  document_header: string;
  document_footer: string;
}

// --- Gráfico SVG de Pizza ---
function MacroPieChart({ protein, carbs, fats, primaryColor }: { protein: number; carbs: number; fats: number; primaryColor: string }) {
  const total = protein + carbs + fats;
  if (total === 0) return null;

  const proteinPct = (protein / total) * 100;
  const carbsPct = (carbs / total) * 100;
  const fatsPct = (fats / total) * 100;

  // Função para calcular coordenadas do arco
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Cores
  const proteinColor = primaryColor;
  const carbsColor = '#f59e0b'; // amber
  const fatsColor = '#8b5cf6'; // violet

  let cumulative = 0;
  const slices = [
    { pct: proteinPct / 100, color: proteinColor, label: 'Proteínas' },
    { pct: carbsPct / 100, color: carbsColor, label: 'Carboidratos' },
    { pct: fatsPct / 100, color: fatsColor, label: 'Gorduras' },
  ];

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-24 h-24" style={{ transform: 'rotate(-90deg)' }}>
        {slices.map((slice, i) => {
          const [startX, startY] = getCoordinatesForPercent(cumulative);
          cumulative += slice.pct;
          const [endX, endY] = getCoordinatesForPercent(cumulative);
          const largeArcFlag = slice.pct > 0.5 ? 1 : 0;

          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');

          return <path key={i} d={pathData} fill={slice.color} />;
        })}
        <circle cx="0" cy="0" r="0.5" fill="white" />
      </svg>

      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: proteinColor }} />
          <span className="text-slate-600">Proteínas {proteinPct.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: carbsColor }} />
          <span className="text-slate-600">Carboidratos {carbsPct.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fatsColor }} />
          <span className="text-slate-600">Gorduras {fatsPct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

// --- Component Principal ---

export function DietPaperTemplate({ dietData }: DietPaperTemplateProps) {
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Branding Data
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await api.get('/branding/branding/me');
        setBranding(response.data);
      } catch (error) {
        console.error('Erro ao carregar branding:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBranding();
  }, []);

  // Defaults
  const logoSrc = branding?.logo || '/logo.png';
  const signatureSrc = branding?.signature_image;
  const primaryColor = branding?.primary_color || '#22c55e';
  const businessName = branding?.business_name || 'NutriXpertPro';
  const crnNumber = branding?.crn_number || '';

  // Calculate Daily Totals
  const dayTotals = dietData.meals.reduce(
    (acc, meal) => {
      meal.items.forEach(item => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fats += item.fats;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-slate-50 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-slate-800 font-sans" style={{ '--primary-color': primaryColor } as React.CSSProperties}>
      
      {/* === HEADER === */}
      <header className="flex justify-between items-start mb-8 pb-6 border-b-2" style={{ borderColor: primaryColor }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm overflow-hidden">
             {branding?.logo ? (
                <img src={branding.logo} alt="Logo" className="w-full h-full object-cover" />
             ) : (
                <Utensils className="h-7 w-7" style={{ color: primaryColor }} />
             )}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
              {businessName}
            </h1>
            {crnNumber && (
              <p className="text-sm text-slate-500 font-medium">CRN: {crnNumber}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Plano Alimentar</p>
          <p className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </header>

      {/* === PATIENT INFO === */}
      <section className="mb-8 p-5 rounded-xl" style={{ backgroundColor: `${primaryColor}10` }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Paciente</p>
            <p className="text-sm font-semibold text-slate-800">{dietData.patientName}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Idade</p>
            <p className="text-sm font-semibold text-slate-800">{dietData.patientAge} anos</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Objetivo</p>
            <p className="text-sm font-semibold text-slate-800">{dietData.patientGoal}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Estratégia</p>
            <p className="text-sm font-semibold" style={{ color: primaryColor }}>{dietData.dietType}</p>
          </div>
        </div>
      </section>

      {/* === MACROS DASHBOARD === */}
      <section className="mb-8 p-5 border border-slate-200 rounded-xl">
        <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Resumo Nutricional Diário</h2>
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Macro Cards */}
          <div className="flex gap-4">
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <Flame className="h-5 w-5 mx-auto mb-1" style={{ color: primaryColor }} />
              <p className="text-lg font-bold text-slate-800">{dayTotals.calories}</p>
              <p className="text-[10px] text-slate-500 uppercase">Kcal</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <Beef className="h-5 w-5 mx-auto mb-1" style={{ color: primaryColor }} />
              <p className="text-lg font-bold text-slate-800">{dayTotals.protein}g</p>
              <p className="text-[10px] text-slate-500 uppercase">Proteínas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <Wheat className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold text-slate-800">{dayTotals.carbs}g</p>
              <p className="text-[10px] text-slate-500 uppercase">Carboidratos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <Droplets className="h-5 w-5 mx-auto mb-1 text-violet-500" />
              <p className="text-lg font-bold text-slate-800">{dayTotals.fats}g</p>
              <p className="text-[10px] text-slate-500 uppercase">Gorduras</p>
            </div>
          </div>

          {/* Pie Chart */}
          <MacroPieChart
            protein={dayTotals.protein}
            carbs={dayTotals.carbs}
            fats={dayTotals.fats}
            primaryColor={primaryColor}
          />
        </div>
      </section>

      {/* === MEALS === */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Refeições do Dia</h2>
        <div className="space-y-4">
          {dietData.meals.map((meal, index) => {
            const mealTotals = meal.items.reduce(
              (acc, item) => ({
                calories: acc.calories + item.calories,
                protein: acc.protein + item.protein,
                carbs: acc.carbs + item.carbs,
                fats: acc.fats + item.fats,
              }),
              { calories: 0, protein: 0, carbs: 0, fats: 0 }
            );

            return (
              <div key={index} className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid">
                {/* Meal Header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{meal.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meal.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: primaryColor }}>{mealTotals.calories} kcal</p>
                    <p className="text-[10px] text-slate-500">
                      P:{mealTotals.protein}g | C:{mealTotals.carbs}g | G:{mealTotals.fats}g
                    </p>
                  </div>
                </div>

                {/* Meal Items */}
                <div className="px-4 py-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                        <th className="text-left font-semibold py-2">Alimento</th>
                        <th className="text-right font-semibold py-2">Quantidade</th>
                        <th className="text-right font-semibold py-2">Kcal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meal.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-50 last:border-0">
                          <td className="py-2 text-slate-700">{item.name}</td>
                          <td className="py-2 text-right text-slate-600">{item.quantity}</td>
                          <td className="py-2 text-right text-slate-600 font-medium">{item.calories}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* === FOOTER / ASSINATURA === */}
      <footer className="mt-10 pt-8 border-t-2 border-slate-200 break-inside-avoid">
        <div className="flex justify-between items-end">
          {/* Contato */}
          <div className="text-xs text-slate-500 space-y-1">
            {branding?.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3 w-3" /> {branding.phone}
              </p>
            )}
            {branding?.address && (
              <p className="flex items-center gap-2">
                <MapPin className="h-3 w-3" /> {branding.address}
              </p>
            )}
          </div>

          {/* Assinatura */}
          <div className="text-center">
            {signatureSrc ? (
              <div className="mb-2">
                <img
                  src={signatureSrc}
                  alt="Assinatura"
                  className="h-14 w-auto mx-auto object-contain"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            ) : (
              <div className="h-10 mb-2 border-b-2 border-slate-400 w-48 mx-auto" />
            )}
            <p className="text-sm font-semibold text-slate-800">{businessName}</p>
            {crnNumber && (
              <p className="text-xs text-slate-500">CRN: {crnNumber}</p>
            )}
          </div>

          {/* Data */}
          <div className="text-xs text-slate-400 text-right">
            <p>Documento gerado em:</p>
            <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {branding?.document_footer && (
          <p className="text-[10px] text-slate-400 text-center mt-6 max-w-xl mx-auto">
            {branding.document_footer}
          </p>
        )}
      </footer>
    </div>
  );
}
