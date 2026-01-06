"use client"

import { Check, Circle, Clock, Camera, X, ChevronRight, Flame, Trophy, Loader2, AlertCircle } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTimeline } from "@/hooks/useTimeline"

export function TimelineWidget() {
    const [currentTime, setCurrentTime] = useState("")
    const [selectedMeal, setSelectedMeal] = useState<any>(null)
    const { events, loading, error, checkIn } = useTimeline()
    const [completedMeals, setCompletedMeals] = useState<number[]>([])

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
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4"
                        >
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#121212] w-full max-w-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative"
                            >
                                {/* Header Image Placeholder or Title */}
                                <div className="h-32 bg-gradient-to-br from-emerald-900/20 to-zinc-900 border-b border-white/5 flex items-center justify-center relative">
                                    <button
                                        onClick={() => setSelectedMeal(null)}
                                        className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white/70 hover:bg-black/40 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 text-emerald-500">
                                            {selectedMeal.type === 'workout' ? <Flame className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                        </div>
                                        <h2 className="text-lg font-bold text-white leading-none">{selectedMeal.title}</h2>
                                        <p className="text-emerald-400 text-sm font-medium mt-1">{selectedMeal.time}</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-6">
                                    {/* Stats Grid */}
                                    {selectedMeal.type === 'meal' && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 text-center">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Kcal</p>
                                                <p className="font-bold text-white">{selectedMeal.kcal}</p>
                                            </div>
                                            <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 text-center">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Prot</p>
                                                <p className="font-bold text-emerald-400">{selectedMeal.protein}</p>
                                            </div>
                                            <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 text-center">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Carb</p>
                                                <p className="font-bold text-blue-400">{selectedMeal.carbs}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-zinc-400">Descrição</h3>
                                        <p className="text-sm text-zinc-200 leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                                            {selectedMeal.description}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            className="w-full border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900 h-12 gap-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Foto
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
