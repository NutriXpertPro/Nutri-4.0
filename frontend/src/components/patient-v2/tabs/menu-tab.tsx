"use client"

import { User, Settings, FileText, LogOut, HelpCircle, ChevronRight, MessageSquare, BookOpen, Mail } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface MenuTabProps {
    onNavigate: (tab: string) => void
    onBack?: () => void
}

export function MenuTab({ onNavigate, onBack }: MenuTabProps) {
    const [isHelpOpen, setIsHelpOpen] = useState(false)

    const menuItems = [
        { id: 'content', icon: BookOpen, label: "Conteúdos e Dicas", desc: "Artigos, receitas e vídeos" },
        { id: 'profile', icon: User, label: "Meu Perfil", desc: "Dados pessoais e objetivos" },
        { id: 'settings', icon: Settings, label: "Configurações", desc: "Preferências e Notificações" },
        // Share removed as per user request
        { id: 'help', icon: HelpCircle, label: "Ajuda", desc: "Suporte e FAQ" },
    ]

    const handleAction = (id: string) => {
        if (id === 'help') {
            setIsHelpOpen(true)
            return
        }
        // Navigation items
        if (['content', 'messages', 'settings', 'profile'].includes(id)) {
            onNavigate(id)
        }
    }

    const handleLogout = () => {
        if (confirm("Tem certeza que deseja sair?")) {
            // In a real app, clear tokens here
            window.location.href = "/" // Redirect to login
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="grid gap-3">
                {menuItems.map((item, i) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={i}
                            onClick={() => handleAction(item.id)}
                            className="flex items-center gap-4 p-4 bg-card border border-border/10 rounded-2xl hover:bg-card/80 transition-all text-left group shadow-sm"
                        >
                            <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-foreground">{item.label}</h3>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                        </button>
                    )
                })}
            </div>

            {/* Help Dialog */}
            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <DialogContent className="sm:max-w-md bg-card border-border/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-primary" /> Central de Ajuda
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-foreground">Dúvidas Frequentes</h4>

                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-sm font-medium">Como registrar refeições?</AccordionTrigger>
                                    <AccordionContent className="text-xs text-muted-foreground">
                                        Vá até a aba 'Diário' ou 'Refeições', selecione a refeição desejada e clique em 'Check-in' ou tire uma foto.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="text-sm font-medium">Como falar com o nutri?</AccordionTrigger>
                                    <AccordionContent className="text-xs text-muted-foreground">
                                        Utilize a aba 'Mensagens' no menu inferior para enviar dúvidas e feedbacks diretamente ao seu nutricionista.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="text-sm font-medium">Esqueci minha senha</AccordionTrigger>
                                    <AccordionContent className="text-xs text-muted-foreground">
                                        Na tela de login, clique em 'Esqueci minha senha' ou entre em contato com o suporte para redefinição.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        <div className="pt-4 border-t border-border/10">
                            <h4 className="text-sm font-medium text-foreground mb-2">Ainda precisa de ajuda?</h4>
                            <Button variant="outline" className="w-full gap-2 text-muted-foreground hover:text-primary">
                                <Mail className="w-4 h-4" /> Enviar E-mail para Suporte
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <button
                onClick={handleLogout}
                className="w-full p-4 mt-4 flex items-center justify-center gap-2 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-colors font-medium border border-red-500/20"
            >
                <LogOut className="w-4 h-4" />
                Sair do App
            </button>

            {onBack && (
                <button
                    onClick={onBack}
                    className="w-full mt-2 p-4 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <ChevronRight className="w-4 h-4 rotate-180" /> Voltar para o Início
                </button>
            )}

            <p className="text-center text-xs text-muted-foreground mt-8 opacity-60">Versão 4.0.1 (Pro)</p>
        </div>
    )
}
