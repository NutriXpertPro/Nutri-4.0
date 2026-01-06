"use client"

import { Card } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Activity, Scale, Dumbbell, Ruler, Trophy, Camera, FilePlus, Users, Upload, X, Loader2 } from 'lucide-react'
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePatient } from "@/contexts/patient-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEvolution } from "@/hooks/useEvolution"

export function EvolutionTab() {
    const { patient } = usePatient()
    const [activeChart, setActiveChart] = useState<'comparison' | 'weight' | 'fat' | 'muscle'>('weight')
    const [activeMeasure, setActiveMeasure] = useState<'comparison' | 'waist' | 'arms' | 'legs' | 'glutes'>('comparison')
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
    const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false)
    const [adipometerProtocol, setAdipometerProtocol] = useState<'pollock3' | 'pollock7' | 'jackson' | 'guedes'>('pollock3')

    // API Hooks
    const { data: weightData, loading: weightLoading } = useEvolution('weight')
    const { data: fatData, loading: fatLoading } = useEvolution('fat')
    const { data: muscleData, loading: muscleLoading } = useEvolution('muscle')

    const loading = weightLoading || fatLoading || muscleLoading

    const getActiveData = () => {
        switch (activeChart) {
            case 'weight': return weightData;
            case 'fat': return fatData;
            case 'muscle': return muscleData;
            default: return weightData;
        }
    }

    // Calculate current weight and total loss from API data
    const currentWeight = weightData.length > 0 ? (weightData[weightData.length - 1].value || 0) : 0
    const initialWeight = weightData.length > 0 ? (weightData[0].value || 0) : 0
    const totalLoss = initialWeight - currentWeight
    const percentLoss = initialWeight > 0 ? ((totalLoss / initialWeight) * 100).toFixed(0) : 0

    const handleRegisterPhoto = () => {
        setIsPhotoDialogOpen(true)
    }

    const handleNewEvaluation = () => {
        setIsEvaluationDialogOpen(true)
    }

    return (
        <div className="space-y-6 pb-24">

            {/* Main Stats Card - Highlighted */}
            <div className="bg-gradient-to-br from-card to-muted border-primary/50 shadow-lg shadow-primary/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Activity className="w-24 h-24 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Peso Atual</p>
                <div className="flex items-end gap-3 mb-4">
                    {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                        <>
                            <h1 className="text-5xl font-bold text-foreground tracking-tighter">
                                {currentWeight > 0 ? currentWeight.toFixed(1) : '--'}
                                <span className="text-2xl text-muted-foreground ml-1">kg</span>
                            </h1>
                            {totalLoss > 0 && (
                                <div className="mb-2 flex items-center text-primary bg-primary/10 px-2 py-1 rounded-lg text-sm font-bold">
                                    <ArrowDownRight className="w-4 h-4 mr-1" />
                                    -{totalLoss.toFixed(1)}kg
                                </div>
                            )}
                        </>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    {totalLoss > 0 ? `Desde o início (-${percentLoss}%)` : 'Sem dados de evolução'}
                </p>
            </div>

            {/* History Section */}
            <div className="bg-card border border-border/10 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Histórico</h3>
                </div>

                {/* Integrated Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        { id: 'comparison', label: 'Comparação', icon: Users },
                        { id: 'weight', label: 'Peso', icon: Scale },
                        { id: 'fat', label: 'Gordura', icon: Activity },
                        { id: 'muscle', label: 'Músculos', icon: Dumbbell },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveChart(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-1 justify-center min-w-[100px]
                                ${activeChart === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}
                            `}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getActiveData()}>
                            <defs>
                                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                            <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    borderColor: 'var(--border)',
                                    borderRadius: '12px',
                                    color: 'var(--foreground)'
                                }}
                                itemStyle={{ color: 'var(--primary)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorMetric)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Antropometric Section */}
            <div className="bg-card border border-border/10 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Ruler className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Medidas</h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { id: 'comparison', label: 'Comparação' },
                        { id: 'waist', label: 'Cintura' },
                        { id: 'arms', label: 'Braços' },
                        { id: 'legs', label: 'Pernas' },
                        ...(patient?.gender === 'female' ? [{ id: 'glutes', label: 'Glúteos' }] : [])
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMeasure(tab.id as any)}
                            className={`
                                px-4 py-1.5 rounded-full text-xs font-medium transition-all border flex-grow justify-center
                                ${activeMeasure === tab.id
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-transparent border-border/40 text-muted-foreground hover:border-primary/50'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Mock Visualization for Measures */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Inicial</p>
                        <p className="text-xl font-bold text-foreground">
                            {activeMeasure === 'waist' ? '72cm' :
                                activeMeasure === 'arms' ? '30cm' :
                                    activeMeasure === 'legs' ? '58cm' :
                                        activeMeasure === 'glutes' ? '102cm' : '-'}
                        </p>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Atual</p>
                        <p className="text-xl font-bold text-foreground">
                            {activeMeasure === 'waist' ? '68cm' :
                                activeMeasure === 'arms' ? '28cm' :
                                    activeMeasure === 'legs' ? '54cm' :
                                        activeMeasure === 'glutes' ? '98cm' : '-'}
                        </p>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Evolução</p>
                        <div className="flex items-center text-emerald-500 font-bold text-lg">
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                            {activeMeasure === 'waist' ? '-4cm' :
                                activeMeasure === 'arms' ? '-2cm' :
                                    activeMeasure === 'legs' ? '-4cm' :
                                        activeMeasure === 'glutes' ? '-4cm' : '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Comparison Section - NEW */}
            <div className="bg-card border border-border/10 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Camera className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Comparação Fotográfica</h3>
                </div>

                <div className="space-y-4">
                    {['Frente', 'Lado', 'Costas'].map((angle) => (
                        <div key={angle}>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{angle}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Inicial</p>
                                    <div className="aspect-[3/4] bg-muted/30 rounded-xl border border-dashed border-border/40 flex flex-col items-center justify-center">
                                        <Camera className="w-8 h-8 text-muted-foreground/40" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Atual</p>
                                    <div className="aspect-[3/4] bg-muted/30 rounded-xl border border-dashed border-border/40 flex flex-col items-center justify-center">
                                        <Camera className="w-8 h-8 text-muted-foreground/40" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-card border border-border/10 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-foreground">Conquistas</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center border border-white/5 opacity-80 hover:opacity-100 hover:scale-105 transition-all">
                            <Trophy className={`w-6 h-6 ${i === 1 ? 'text-yellow-500' : 'text-muted-foreground/40'}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={handleRegisterPhoto}
                    variant="outline"
                    className="h-12 rounded-2xl border-dashed border-primary/50 text-primary hover:bg-primary/5"
                >
                    <Camera className="w-4 h-4 mr-2" />
                    Registrar Foto
                </Button>
                <Button
                    onClick={handleNewEvaluation}
                    className="h-12 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                >
                    <FilePlus className="w-4 h-4 mr-2" />
                    Nova Avaliação
                </Button>
            </div>

            {/* Photo Upload Dialog */}
            <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                <DialogContent className="sm:max-w-md bg-card border-border/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-primary" />
                            Registrar Fotos do Progresso
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Envie 3 fotos do seu físico atual para o nutricionista acompanhar sua evolução.
                        </p>
                        {['Frente', 'Lado', 'Costas'].map((angle) => (
                            <div key={angle} className="space-y-2">
                                <Label className="text-sm font-medium">{angle}</Label>
                                <div className="flex items-center gap-2">
                                    <Input type="file" accept="image/*" className="flex-1" />
                                    <Button size="icon" variant="ghost" className="h-10 w-10">
                                        <Camera className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={() => {
                            alert('Fotos enviadas para o nutricionista! ✅')
                            setIsPhotoDialogOpen(false)
                        }}>
                            <Upload className="w-4 h-4 mr-2" />
                            Enviar Fotos
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Evaluation Form Dialog */}
            <Dialog open={isEvaluationDialogOpen} onOpenChange={setIsEvaluationDialogOpen}>
                <DialogContent className="sm:max-w-2xl bg-card border-border/20 max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FilePlus className="w-5 h-5 text-primary" />
                            Nova Avaliação Física
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* Antropometria */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-primary" />
                                Antropometria
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Peso (kg)</Label>
                                    <Input type="number" step="0.1" placeholder="69.7" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Altura (cm)</Label>
                                    <Input type="number" placeholder="170" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Cintura (cm)</Label>
                                    <Input type="number" placeholder="68" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Braços (cm)</Label>
                                    <Input type="number" placeholder="28" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Pernas (cm)</Label>
                                    <Input type="number" placeholder="54" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Glúteos (cm)</Label>
                                    <Input type="number" placeholder="98" />
                                </div>
                            </div>
                        </div>

                        {/* Bioimpedância */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                Bioimpedância
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">% Gordura</Label>
                                    <Input type="number" step="0.1" placeholder="18.5" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Massa Muscular (kg)</Label>
                                    <Input type="number" step="0.1" placeholder="32.5" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Água Corporal (%)</Label>
                                    <Input type="number" step="0.1" placeholder="55.0" />
                                </div>
                            </div>
                        </div>

                        {/* Adipômetro */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                                <Scale className="w-4 h-4 text-primary" />
                                Adipômetro (Dobras Cutâneas)
                            </h4>

                            {/* Protocol Selector */}
                            <div className="space-y-1">
                                <Label className="text-xs">Protocolo</Label>
                                <select
                                    value={adipometerProtocol}
                                    onChange={(e) => setAdipometerProtocol(e.target.value as any)}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background"
                                >
                                    <option value="pollock3">Pollock 3 Dobras</option>
                                    <option value="pollock7">Pollock 7 Dobras</option>
                                    <option value="jackson">Jackson & Pollock</option>
                                    <option value="guedes">Guedes</option>
                                </select>
                            </div>

                            {/* Dynamic Fields Based on Protocol */}
                            <div className="grid grid-cols-2 gap-3">
                                {adipometerProtocol === 'pollock3' && (
                                    <>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Tríceps (mm)</Label>
                                            <Input type="number" placeholder="12" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Abdominal (mm)</Label>
                                            <Input type="number" placeholder="18" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Suprailíaca (mm)</Label>
                                            <Input type="number" placeholder="15" />
                                        </div>
                                    </>
                                )}

                                {adipometerProtocol === 'pollock7' && (
                                    <>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Tríceps (mm)</Label>
                                            <Input type="number" placeholder="12" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Peitoral (mm)</Label>
                                            <Input type="number" placeholder="10" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Subescapular (mm)</Label>
                                            <Input type="number" placeholder="15" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Axilar Média (mm)</Label>
                                            <Input type="number" placeholder="14" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Suprailíaca (mm)</Label>
                                            <Input type="number" placeholder="15" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Abdominal (mm)</Label>
                                            <Input type="number" placeholder="18" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Coxa (mm)</Label>
                                            <Input type="number" placeholder="16" />
                                        </div>
                                    </>
                                )}

                                {adipometerProtocol === 'jackson' && (
                                    <>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Peitoral (mm)</Label>
                                            <Input type="number" placeholder="10" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Abdominal (mm)</Label>
                                            <Input type="number" placeholder="18" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Coxa (mm)</Label>
                                            <Input type="number" placeholder="16" />
                                        </div>
                                    </>
                                )}

                                {adipometerProtocol === 'guedes' && (
                                    <>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Tríceps (mm)</Label>
                                            <Input type="number" placeholder="12" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Subescapular (mm)</Label>
                                            <Input type="number" placeholder="15" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Suprailíaca (mm)</Label>
                                            <Input type="number" placeholder="15" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Abdominal (mm)</Label>
                                            <Input type="number" placeholder="18" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEvaluationDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={() => {
                            alert('Avaliação enviada para o nutricionista! ✅')
                            setIsEvaluationDialogOpen(false)
                        }}>
                            <Upload className="w-4 h-4 mr-2" />
                            Enviar Avaliação
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
