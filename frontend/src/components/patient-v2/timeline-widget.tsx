"use client"

import { Check, Circle, Clock, Camera, X, ChevronRight, Flame, Trophy, Loader2, AlertCircle } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTimeline } from "@/hooks/useTimeline"

export function TimelineWidget() {
    const [currentTime, setCurrentTime] = useState("")
    const [selectedMeal, setSelectedMeal] = useState<any>(null)
    const { events, loading, error, checkIn, uploadMealPhoto } = useTimeline()
    const [completedMeals, setCompletedMeals] = useState<number[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
            setCurrentTime(timeString)
        }
        updateTime()
        const interval = setInterval(updateTime, 60000)
        return () => clearInterval(interval)
    }, [])

    const getStatus = (event: any, index: number) => {
        if (!currentTime) return 'upcoming'
        const nextEvent = events[index + 1]

        // Manual override check
        if (completedMeals.includes(event.id) || event.status === 'completed') return 'completed'

        if (currentTime >= event.time) {
            if (nextEvent && currentTime >= nextEvent.time) {
                return 'completed'
            }
            return 'current'
        }
        return 'upcoming'
    }

    const handleCheckIn = async (id: number) => {
        if (!completedMeals.includes(id)) {
            try {
                await checkIn(id)
                setCompletedMeals([...completedMeals, id])
            } catch (err) {
                console.error('Check-in failed:', err)
            }
        }
        setSelectedMeal(null)
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !selectedMeal) return

        try {
            setUploadingPhoto(true)
            await uploadMealPhoto(selectedMeal.id, file)
            alert("Foto enviada com sucesso!")
        } catch (err) {
            console.error('Upload failed:', err)
            alert("Erro ao enviar foto.")
        } finally {
            setUploadingPhoto(false)
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-6">
                <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">{error}</p>
            </div>
        )
    }

    // Empty state
    if (events.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma refeição programada para hoje.</p>
            </div>
        )
    }

    return (
        <>
            <div className="relative pl-5 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary/50 before:via-muted before:to-transparent">

                {events.map((event, index) => {
                    const status = getStatus(event, index)
                    const isManualCompleted = completedMeals.includes(event.id)
                    const isCurrent = status === "current" && !isManualCompleted
                    const isCompleted = status === "completed" || isManualCompleted

                    return (
                        <div key={event.id} className={`relative transition-all duration-300 ${isCurrent ? "scale-100" : "opacity-90"} ${getStatus(event, index) === 'upcoming' ? 'opacity-50' : ''}`}>

                            {/* Timeline Dot */}
                            <div className={`absolute -left-[23px] top-3 w-4 h-4 rounded-full border-2 
                  flex items-center justify-center bg-background z-10 transition-colors duration-300
                  ${isCompleted ? "border-primary text-primary" :
                                    isCurrent ? "border-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)] shadow-primary/40" : "border-border bg-card"}
                `}>
                                {isCompleted && <Check className="w-2.5 h-2.5" />}
                                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                            </div>

                            {/* Card - Clickable now */}
                            <div
                                onClick={() => setSelectedMeal(event)}
                                className={`
                  rounded-xl p-3 border transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer group active:scale-95
                  ${isCurrent ?
                                        "bg-gradient-to-br from-card to-muted border-primary/50 shadow-lg shadow-primary/10 translate-x-1" :
                                        "bg-transparent border-transparent hover:bg-card/40 hover:border-border/10"}
                `}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-xs font-bold font-mono ${isCurrent ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                                            {event.time}
                                        </span>
                                        {isCurrent && (
                                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 rounded-full uppercase tracking-wide font-bold">
                                                Agora
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`font-medium text-sm leading-tight ${isCurrent ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                                        {event.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5 group-hover:text-muted-foreground/80">
                                        {event.subtitle}
                                    </p>
                                </div>

                                {isCurrent ? (
                                    <button className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                        <Clock className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Meal Details Sheet (Drawer) */}
            <AnimatePresence>
                {selectedMeal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMeal(null)}
                            className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4"
                        >
                            <div className="absolute inset-0 z-[-1]" />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-background w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border border-border shadow-2xl relative flex flex-col max-h-[85vh]"
                            >
                                {/* Header Image Placeholder or Title */}
                                <div className="h-32 bg-gradient-to-br from-primary/10 to-muted border-b border-border flex items-center justify-center relative">
                                    <button
                                        onClick={() => setSelectedMeal(null)}
                                        className="absolute top-4 right-4 p-2 bg-foreground/10 rounded-full text-foreground/70 hover:bg-foreground/20 hover:text-foreground transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary">
                                            {selectedMeal.type === 'workout' ? <Flame className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                        </div>
                                        <h2 className="text-lg font-bold text-foreground leading-none">{selectedMeal.title}</h2>
                                        <p className="text-primary text-sm font-medium mt-1">{selectedMeal.time}</p>
                                    </div>
                                </div>

                                {/* Content - Scrollable Area */}
                                <div className="p-6 space-y-6 flex-1 overflow-y-auto pb-10 scrollbar-hide">
                                    {/* Stats Grid */}
                                    {selectedMeal.type === 'meal' && (
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="bg-muted/50 p-2 rounded-xl border border-border text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Kcal</p>
                                                <p className="font-bold text-foreground text-xs">{selectedMeal.kcal}</p>
                                            </div>
                                            <div className="bg-muted/50 p-2 rounded-xl border border-border text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Prot</p>
                                                <p className="font-bold text-primary text-xs">{selectedMeal.protein}</p>
                                            </div>
                                            <div className="bg-muted/50 p-2 rounded-xl border border-border text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Carb</p>
                                                <p className="font-bold text-blue-500 text-xs">{selectedMeal.carbs}</p>
                                            </div>
                                            <div className="bg-muted/50 p-2 rounded-xl border border-border text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gord</p>
                                                <p className="font-bold text-amber-500 text-xs">{selectedMeal.fat}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Items List */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cardápio de Hoje</h3>
                                        <div className="space-y-3">
                                            {selectedMeal.items?.map((item: any, idx: number) => (
                                                <div key={idx} className="bg-card p-4 rounded-xl border border-border space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-foreground font-medium">{item.name}</span>
                                                        <span className="text-primary text-xs font-bold">{item.quantity}{item.unit}</span>
                                                    </div>

                                                    {item.substitutions && item.substitutions.length > 0 && (
                                                        <div className="pt-2 border-t border-border">
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Substituições</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.substitutions.map((sub: any, sIdx: number) => (
                                                                    <div key={sIdx} className="text-[11px] text-foreground/80 bg-muted px-2 py-1 rounded-lg border border-border">
                                                                        {sub.name} ({sub.quantity}{sub.unit})
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {(!selectedMeal.items || selectedMeal.items.length === 0) && (
                                                <p className="text-sm text-foreground/80 leading-relaxed bg-card p-4 rounded-xl border border-border">
                                                    {selectedMeal.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                    />

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingPhoto}
                                            className="w-full border-dashed border-border hover:border-primary/50 hover:bg-muted h-12 gap-2"
                                        >
                                            {uploadingPhoto ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Camera className="w-4 h-4" />
                                            )}
                                            {uploadingPhoto ? "Enviando..." : "Foto"}
                                        </Button>
                                        <Button
                                            onClick={() => handleCheckIn(selectedMeal.id)}
                                            className={`w-full h-12 gap-2 font-bold ${completedMeals.includes(selectedMeal.id) ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                            disabled={completedMeals.includes(selectedMeal.id)}
                                        >
                                            {completedMeals.includes(selectedMeal.id) ? (
                                                <>
                                                    <Check className="w-4 h-4" /> Feito
                                                </>
                                            ) : (
                                                <>
                                                    <Trophy className="w-4 h-4" /> Check-in
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
