"use client"

import { PatientHeaderV2 } from "@/components/patient-v2/header"
import { PatientBottomNav } from "@/components/patient-v2/bottom-nav"
import { MetricsCarousel } from "@/components/patient-v2/metrics-carousel"
import { TimelineWidget } from "@/components/patient-v2/timeline-widget"
import { usePatient } from "@/contexts/patient-context"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { DietTab } from "@/components/patient-v2/tabs/diet-tab"
import { EvolutionTab } from "@/components/patient-v2/tabs/evolution-tab"
import { AgendaTab } from "@/components/patient-v2/tabs/agenda-tab"
import { MenuTab } from "@/components/patient-v2/tabs/menu-tab"
import { MessagesTab } from "@/components/patient-v2/tabs/messages-tab"
import { ContentTab } from "@/components/patient-v2/tabs/content-tab"
import { ExamsTab } from "@/components/patient-v2/tabs/exams-tab"
import { SettingsTab } from "@/components/patient-v2/tabs/settings-tab"
import { ProfileTab } from "@/components/patient-v2/tabs/profile-tab"
import { NotificationsTab } from "@/components/patient-v2/tabs/notifications-tab"

export default function PatientDashboardV2() {
    const { patient, loading } = usePatient()
    const [activeTab, setActiveTab] = useState("home")

    return (
        <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-emerald-500/30">

            {/* Background Ambient Mesh Gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen opacity-30" />
            </div>

            <PatientHeaderV2 onNavigate={setActiveTab} />

            <main className="relative z-10 pt-20 px-4 space-y-8 max-w-md mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Welcome Section */}
                            <div className="pt-2 mb-8 flex items-start justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm font-medium">
                                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                                    </p>
                                    <h1 className="text-3xl font-light tracking-tight mt-1">
                                        Bom dia, <span className="font-semibold text-emerald-400">
                                            {loading ? (
                                                <span className="animate-pulse">...</span>
                                            ) : (
                                                patient?.name?.split(' ')[0] || 'Paciente'
                                            )}
                                        </span>
                                    </h1>
                                    {!loading && patient?.nutritionist_name && (
                                        <div className="flex items-center gap-2 mt-2 group cursor-default">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-emerald-500/20 blur-sm rounded-full group-hover:bg-emerald-500/40 transition-colors" />
                                                <img
                                                    src={patient.nutritionist_avatar || "/default-avatar.png"}
                                                    className="w-6 h-6 rounded-full relative border border-emerald-500/30 object-cover"
                                                    alt={patient.nutritionist_name}
                                                />
                                            </div>
                                            <p className="text-xs font-medium text-zinc-400">
                                                {patient.nutritionist_gender === 'M' ? 'Seu Nutri' : 'Sua Nutri'}: <span className="text-zinc-200">{patient.nutritionist_title} {patient.nutritionist_name.split(' ')[0]}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Horizontal Metrics */}
                            <div className="mb-8">
                                <h2 className="text-sm font-medium text-zinc-500 mb-3 px-1 uppercase tracking-wider">Seu Progresso</h2>
                                <MetricsCarousel />
                            </div>

                            {/* Timeline Agenda */}
                            <div className="pb-4">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Timeline de Hoje</h2>
                                    <button onClick={() => setActiveTab('agenda')} className="text-xs text-primary font-medium hover:underline">Ver agenda completa</button>
                                </div>
                                <TimelineWidget />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'diet' && (
                        <motion.div
                            key="diet"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DietTab />
                        </motion.div>
                    )}

                    {activeTab === 'agenda' && (
                        <motion.div
                            key="agenda"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AgendaTab onNavigate={setActiveTab} />
                        </motion.div>
                    )}

                    {activeTab === 'evolution' && (
                        <motion.div
                            key="evolution"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <EvolutionTab />
                        </motion.div>
                    )}

                    {activeTab === 'messages' && (
                        <motion.div
                            key="messages"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessagesTab onBack={() => setActiveTab('menu')} />
                        </motion.div>
                    )}

                    {activeTab === 'content' && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ContentTab onBack={() => setActiveTab('menu')} />
                        </motion.div>
                    )}

                    {activeTab === 'exams' && (
                        <motion.div
                            key="exams"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ExamsTab onBack={() => setActiveTab('menu')} />
                        </motion.div>
                    )}
                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <SettingsTab onBack={() => setActiveTab('menu')} />
                        </motion.div>
                    )}

                    {activeTab === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MenuTab onNavigate={setActiveTab} onBack={() => setActiveTab('home')} />
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ProfileTab onBack={() => setActiveTab('menu')} />
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            key="notifications"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <NotificationsTab onNavigate={setActiveTab} onBack={() => setActiveTab('home')} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <PatientBottomNav activeTab={activeTab === 'notifications' ? 'home' : activeTab} onTabChange={setActiveTab} />
        </div>
    )
}
