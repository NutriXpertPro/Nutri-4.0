"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { User, Target, AlertTriangle, Scale, Percent, Activity } from 'lucide-react'
import { useDietEditorStore } from '@/stores/diet-editor-store'

export function PatientContextPanel() {
    const patient = useDietEditorStore((state) => state.patient)

    if (!patient) {
        return (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Nenhum paciente selecionado</p>
                        <button className="text-xs text-indigo-400 hover:text-indigo-300">
                            Selecionar paciente →
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Patient Header */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                    {patient.avatar ? (
                        <img
                            src={patient.avatar}
                            alt={patient.name}
                            className="h-12 w-12 rounded-full object-cover border-2 border-white/20"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg">
                            {patient.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h3 className="text-white">{patient.name}</h3>
                        <p className="text-sm text-slate-400">
                            {patient.age} anos • {patient.sex === 'M' ? 'Masculino' : 'Feminino'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
                <StatCard
                    icon={<Scale className="h-4 w-4" />}
                    label="Peso"
                    value={patient.weight ? `${patient.weight} kg` : '--'}
                    color="blue"
                />
                <StatCard
                    icon={<Activity className="h-4 w-4" />}
                    label="Altura"
                    value={patient.height ? `${(patient.height * 100).toFixed(0)} cm` : '--'}
                    color="green"
                />
                {patient.bodyFat && (
                    <StatCard
                        icon={<Percent className="h-4 w-4" />}
                        label="% Gordura"
                        value={`${patient.bodyFat}%`}
                        color="orange"
                    />
                )}
                {patient.muscleMass && (
                    <StatCard
                        icon={<Activity className="h-4 w-4" />}
                        label="Massa Magra"
                        value={`${patient.muscleMass} kg`}
                        color="purple"
                    />
                )}
            </div>

            {/* Goal */}
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Target className="h-3 w-3" />
                    <span>Objetivo</span>
                </div>
                <p className="text-sm text-white">{patient.goal || 'Não definido'}</p>
            </div>

            {/* Restrictions */}
            {(patient.restrictions?.length ?? 0) > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                    <div className="flex items-center gap-2 text-amber-400 text-xs mb-2">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Restrições Alimentares</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {patient.restrictions?.map((restriction, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs"
                            >
                                {restriction}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Allergies */}
            {(patient.allergies?.length ?? 0) > 0 && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                    <div className="flex items-center gap-2 text-red-400 text-xs mb-2">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Alergias</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {patient.allergies?.map((allergy, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs"
                            >
                                {allergy}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

interface StatCardProps {
    icon: React.ReactNode
    label: string
    value: string
    color: 'blue' | 'green' | 'orange' | 'purple'
}

function StatCard({ icon, label, value, color }: StatCardProps) {
    const colorClasses = {
        blue: 'from-blue-500/20 to-blue-600/20 text-blue-400',
        green: 'from-green-500/20 to-green-600/20 text-green-400',
        orange: 'from-orange-500/20 to-orange-600/20 text-orange-400',
        purple: 'from-purple-500/20 to-purple-600/20 text-purple-400',
    }

    return (
        <div className={`rounded-lg bg-gradient-to-br ${colorClasses[color]} border border-white/10 p-3`}>
            <div className="flex items-center gap-1.5 text-xs opacity-80 mb-1">
                {icon}
                <span>{label}</span>
            </div>
            <p className="text-lg text-white">{value}</p>
        </div>
    )
}
