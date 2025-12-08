"use client"

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Download,
    Send,
    Printer,
    FileText,
    Check,
    Loader2,
    Smartphone,
    Mail
} from 'lucide-react'
import { useDietEditorStore, useDietEditorMeals, useDietEditorTargets, DIET_TYPE_MACROS } from '@/stores/diet-editor-store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface PDFPreviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PDFPreviewModal({ open, onOpenChange }: PDFPreviewModalProps) {
    const [isSending, setIsSending] = useState(false)
    const [sendSuccess, setSendSuccess] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const { patient, dietName, dietType, targetCalories, targetMacros } = useDietEditorStore()
    const meals = useDietEditorMeals()
    const contentRef = useRef<HTMLDivElement>(null)

    const handleDownloadPDF = async () => {
        setIsDownloading(true)
        // Simulate PDF generation
        await new Promise(resolve => setTimeout(resolve, 1500))

        // In production, this would use a library like html2pdf.js or jsPDF
        // For now, we'll use the browser's print functionality
        window.print()

        setIsDownloading(false)
    }

    const handleSendToPatient = async () => {
        setIsSending(true)
        setSendSuccess(false)

        // Simulate API call to send diet to patient's app
        await new Promise(resolve => setTimeout(resolve, 2000))

        // TODO: Implement actual API call
        // await dietService.sendToPatient(patientId, dietData)

        setSendSuccess(true)
        setIsSending(false)

        // Reset success state after 3 seconds
        setTimeout(() => setSendSuccess(false), 3000)
    }

    const handlePrint = () => {
        window.print()
    }

    // Calculate day totals
    const dayTotals = meals.reduce(
        (acc, meal) => {
            meal.items.forEach(item => {
                acc.calories += item.calories
                acc.protein += item.protein
                acc.carbs += item.carbs
                acc.fats += item.fats
            })
            return acc
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )

    const dietTypeLabel = DIET_TYPE_MACROS[dietType]?.label || 'Personalizada'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border-white/10">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-400" />
                        Preview do Plano Alimentar
                    </DialogTitle>
                </DialogHeader>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4 flex-shrink-0">
                    <Button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    >
                        {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Baixar PDF
                    </Button>

                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="gap-2 border-white/20 text-white hover:bg-white/10"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir
                    </Button>

                    <Button
                        onClick={handleSendToPatient}
                        disabled={isSending || !patient}
                        className={`gap-2 ml-auto ${sendSuccess
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                            }`}
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : sendSuccess ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Smartphone className="h-4 w-4" />
                        )}
                        {sendSuccess ? 'Enviado!' : 'Enviar para App do Paciente'}
                    </Button>
                </div>

                {/* PDF Preview Content */}
                <div className="flex-1 overflow-y-auto bg-white rounded-lg">
                    <div
                        ref={contentRef}
                        className="p-8 text-gray-900 print:p-4"
                        id="pdf-content"
                    >
                        {/* Header */}
                        <div className="border-b-2 border-indigo-500 pb-4 mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-indigo-600">
                                        NutriXpertPro
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Plano Alimentar Personalizado
                                    </p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Patient Info */}
                        {patient && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h2 className="text-lg font-semibold mb-2">Paciente</h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Nome:</span>{' '}
                                        <span className="font-medium">{patient.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Idade:</span>{' '}
                                        <span className="font-medium">{patient.age} anos</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Objetivo:</span>{' '}
                                        <span className="font-medium">{patient.goal || 'Não definido'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Tipo de Dieta:</span>{' '}
                                        <span className="font-medium">{dietTypeLabel}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Nutritional Targets */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-3">Metas Nutricionais Diárias</h2>
                            <div className="grid grid-cols-4 gap-4">
                                <NutritionalCard
                                    label="Calorias"
                                    value={targetCalories}
                                    unit="kcal"
                                    color="indigo"
                                />
                                <NutritionalCard
                                    label="Carboidratos"
                                    value={targetMacros.carbs}
                                    unit="g"
                                    color="blue"
                                />
                                <NutritionalCard
                                    label="Proteínas"
                                    value={targetMacros.protein}
                                    unit="g"
                                    color="green"
                                />
                                <NutritionalCard
                                    label="Gorduras"
                                    value={targetMacros.fats}
                                    unit="g"
                                    color="orange"
                                />
                            </div>
                        </div>

                        {/* Meals */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-3">Refeições</h2>
                            <div className="space-y-4">
                                {meals.map((meal) => (
                                    <MealSection key={meal.id} meal={meal} />
                                ))}
                            </div>
                        </div>

                        {/* Day Summary */}
                        <div className="border-t-2 border-gray-200 pt-4 mt-6">
                            <h2 className="text-lg font-semibold mb-3">Resumo do Dia</h2>
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {dayTotals.calories.toFixed(0)}
                                    </p>
                                    <p className="text-xs text-gray-500">kcal</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-500">
                                        {dayTotals.carbs.toFixed(0)}g
                                    </p>
                                    <p className="text-xs text-gray-500">Carboidratos</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-500">
                                        {dayTotals.protein.toFixed(0)}g
                                    </p>
                                    <p className="text-xs text-gray-500">Proteínas</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-orange-500">
                                        {dayTotals.fats.toFixed(0)}g
                                    </p>
                                    <p className="text-xs text-gray-500">Gorduras</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
                            <p>Este plano alimentar foi elaborado especialmente para você.</p>
                            <p>Siga as orientações e consulte seu nutricionista em caso de dúvidas.</p>
                            <p className="mt-2">Gerado por NutriXpertPro</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

interface NutritionalCardProps {
    label: string
    value: number
    unit: string
    color: 'indigo' | 'blue' | 'green' | 'orange'
}

function NutritionalCard({ label, value, unit, color }: NutritionalCardProps) {
    const colorClasses = {
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
        blue: 'bg-blue-50 border-blue-200 text-blue-600',
        green: 'bg-green-50 border-green-200 text-green-600',
        orange: 'bg-orange-50 border-orange-200 text-orange-600',
    }

    return (
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold">{value} <span className="text-sm font-normal">{unit}</span></p>
        </div>
    )
}

interface MealSectionProps {
    meal: ReturnType<typeof useDietEditorMeals>[0]
}

function MealSection({ meal }: MealSectionProps) {
    const mealTotals = meal.items.reduce(
        (acc, item) => ({
            calories: acc.calories + item.calories,
            protein: acc.protein + item.protein,
            carbs: acc.carbs + item.carbs,
            fats: acc.fats + item.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )

    if (meal.items.length === 0) return null

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">{meal.name}</h3>
                    <p className="text-xs text-gray-500">{meal.time}</p>
                </div>
                <div className="text-sm text-gray-500">
                    {mealTotals.calories.toFixed(0)} kcal
                </div>
            </div>
            <div className="divide-y">
                {meal.items.map((item) => (
                    <div key={item.id} className="px-4 py-2 flex justify-between text-sm">
                        <div>
                            <span className="font-medium">
                                {item.food?.nome || item.customName || 'Alimento'}
                            </span>
                            <span className="text-gray-500 ml-2">
                                {item.quantity}{item.unit}
                            </span>
                        </div>
                        <div className="text-gray-500 flex gap-4">
                            <span>{item.calories.toFixed(0)} kcal</span>
                            <span className="text-blue-500">{item.carbs.toFixed(0)}g C</span>
                            <span className="text-green-500">{item.protein.toFixed(0)}g P</span>
                            <span className="text-orange-500">{item.fats.toFixed(0)}g G</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
