"use client"

import { Search, Send, ArrowLeft, Mic, Phone, Video, MoreVertical, Paperclip, Camera, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createPortal } from "react-dom"
import { useMessages } from "@/hooks/useMessages"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function MessagesTab({ onBack }: { onBack?: () => void }) {
    const [mounted, setMounted] = useState(false)
    const [newMessage, setNewMessage] = useState("")
    const { user } = useAuth()

    const {
        conversations,
        messages,
        selectedConversation,
        loading,
        error,
        fetchMessages,
        sendMessage
    } = useMessages()

    useEffect(() => {
        setMounted(true)
    }, [])

    const activeChat = conversations.find(c => c.id === selectedConversation)

    const handleSelectChat = (chatId: number) => {
        fetchMessages(chatId)
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return

        try {
            await sendMessage(selectedConversation, newMessage)
            setNewMessage("")
        } catch (err) {
            console.error('Failed to send message:', err)
        }
    }

    // Loading state
    if (loading && conversations.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen pb-24">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando conversas...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error && conversations.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen pb-24">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} size="sm">
                        Tentar Novamente
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col relative">

            {/* Master View: Search & List */}
            <div className={`flex flex-col h-full ${selectedConversation ? 'hidden' : 'block'}`}>
                <div className="sticky top-0 bg-background z-10 pb-2">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        {onBack && (
                            <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted/10 rounded-full text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            className="w-full bg-card border border-border/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 mt-2 pb-20">
                    {conversations.map(chat => {
                        const isHighlighted = chat.unread > 0

                        // Find the other participant (Nutritionist)
                        const otherParticipant = chat.participants?.find(p => p.id !== user?.id)
                        const rawName = otherParticipant?.name || chat.name || 'Nutricionista'

                        // Name abbreviation: First and Last Name
                        const nameParts = rawName.trim().split(/\s+/)
                        const firstName = nameParts[0]
                        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""
                        const abbreviatedName = lastName ? `${firstName} ${lastName}` : firstName

                        // Title logic
                        const title = otherParticipant?.professional_title
                        const formattedName = title ? `${title} ${abbreviatedName}` : abbreviatedName

                        const displayAvatar = otherParticipant?.avatar || chat.avatar
                        const initial = firstName?.[0] || '?'

                        return (
                            <div
                                key={chat.id}
                                onClick={() => handleSelectChat(chat.id)}
                                className={`
                                    flex gap-4 p-4 rounded-xl transition-all cursor-pointer border active:scale-[0.98]
                                    ${isHighlighted
                                        ? "bg-gradient-to-br from-card to-muted border-primary/50 shadow-lg shadow-primary/10"
                                        : "bg-card/40 border-border/10 hover:bg-card/60"}
                                `}
                            >
                                <div className="relative shrink-0">
                                    <Avatar className={`w-12 h-12 aspect-square border ${isHighlighted ? 'border-primary/50' : 'border-border/10'}`}>
                                        <AvatarImage src={displayAvatar} className="object-cover" />
                                        <AvatarFallback className={isHighlighted ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground font-bold"}>{initial}</AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-semibold truncate text-base ${isHighlighted ? 'text-primary' : 'text-foreground'}`}>{formattedName}</h3>
                                        <span className={`text-xs whitespace-nowrap ml-2 ${isHighlighted ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                            {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate pr-4 ${isHighlighted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                            {chat.lastMessage || 'Nenhuma mensagem'}
                                        </p>
                                        {chat.unread > 0 && (
                                            <div className="min-w-[1.25rem] h-5 bg-primary rounded-full flex items-center justify-center px-1.5 shadow-sm shadow-primary/20">
                                                <span className="text-[10px] font-bold text-primary-foreground">{chat.unread}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Detail View: Full Screen Chat Overlay */}
            {mounted && selectedConversation && activeChat && createPortal(
                <AnimatePresence mode="wait">
                    <motion.div
                        key="chat-overlay"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[100] bg-background flex flex-col w-full max-w-md mx-auto overflow-hidden shadow-2xl safe-area-inset-bottom"
                        style={{ backgroundBlendMode: "overlay" }}
                    >
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}></div>

                        {/* Chat Header */}
                        <div className="bg-background/90 backdrop-blur-md p-3 flex items-center gap-3 border-b border-border/5 sticky top-0 z-10 pt-safe-top">
                            <button onClick={() => fetchMessages(0)} className="p-1 -ml-1 rounded-full hover:bg-muted/10">
                                <ArrowLeft className="w-6 h-6 text-primary" />
                            </button>

                            {(() => {
                                // Re-calculate correct participant for the active chat header
                                const activeParticipant = activeChat.participants?.find(p => p.id !== user?.id)

                                let activeDisplayName = 'Nutricionista'
                                let activeAvatar = activeChat.avatar

                                if (activeParticipant) {
                                    const title = activeParticipant.professional_title
                                    const pName = activeParticipant.name || 'Nutricionista'

                                    // Abreviar nome também no header para elegância
                                    const pParts = pName.trim().split(/\s+/)
                                    const pFirst = pParts[0]
                                    const pLast = pParts.length > 1 ? pParts[pParts.length - 1] : ""
                                    const pAbbr = pLast ? `${pFirst} ${pLast}` : pFirst

                                    activeDisplayName = title ? `${title} ${pAbbr}` : pAbbr
                                    activeAvatar = activeParticipant.avatar || activeChat.avatar
                                } else if (activeChat.name) {
                                    activeDisplayName = activeChat.name
                                }

                                const activeInitial = activeDisplayName.replace(/[^a-zA-Z]/g, '')?.[0] || '?'

                                return (
                                    <>
                                        <Avatar className="w-10 h-10 aspect-square border border-border/10 shrink-0">
                                            <AvatarImage src={activeAvatar} className="object-cover" />
                                            <AvatarFallback className="font-bold">{activeInitial}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground truncate text-sm leading-tight">{activeDisplayName}</h3>
                                            <p className="text-[10px] text-emerald-500 font-medium truncate flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                Online
                                            </p>
                                        </div>
                                    </>
                                )
                            })()}

                            <div className="flex gap-4 text-primary">
                                <Video className="w-5 h-5" />
                                <Phone className="w-5 h-5" />
                                <MoreVertical className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-0">
                            {/* Date Divider */}
                            <div className="flex justify-center my-4">
                                <span className="bg-card/80 text-muted-foreground text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider font-medium shadow-sm border border-border/5">Hoje</span>
                            </div>

                            {messages.map(msg => {
                                const isOwn = (msg.sender === user?.id || (msg.sender as any)?.id === user?.id)

                                // Helper function to render text with clickable links
                                const renderMessageContent = (content: string) => {
                                    const urlRegex = /(https?:\/\/[^\s]+)/g
                                    const parts = content.split(urlRegex)

                                    return parts.map((part, i) => {
                                        if (part.match(urlRegex)) {
                                            return (
                                                <a
                                                    key={i}
                                                    href={part}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`underline break-all font-semibold ${isOwn ? 'text-white' : 'text-emerald-700 hover:text-emerald-800'}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {part}
                                                </a>
                                            )
                                        }
                                        return part
                                    })
                                }

                                return (
                                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`
                                            max-w-[75%] px-3 py-1.5 rounded-lg text-sm relative shadow-sm border
                                            ${isOwn
                                                ? 'bg-emerald-600 text-white border-emerald-500 rounded-tr-none'
                                                : 'bg-zinc-100 text-zinc-950 border-zinc-200 rounded-tl-none'}
                                        `}>
                                            <div className="mr-12 pb-1 leading-relaxed whitespace-pre-wrap font-medium">
                                                {renderMessageContent(msg.content)}
                                            </div>
                                            <span className={`absolute bottom-1 right-2 text-[10px] ${isOwn ? 'text-white/80' : 'text-zinc-500'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Chat Footer */}
                        <div className="p-2 bg-background flex items-end gap-2 pb-safe-bottom relative z-10 border-t border-border/5">
                            <div className="flex-1 bg-card rounded-2xl flex items-center px-2 py-2 gap-2 border border-border/50 focus-within:border-primary/50 transition-colors shadow-sm">
                                <button className="text-muted-foreground hover:text-foreground"><span className="text-xl">😊</span></button>
                                <input
                                    type="text"
                                    placeholder="Mensagem"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm max-h-24 py-1"
                                />
                                <button className="text-muted-foreground hover:text-foreground transform rotate-45"><Paperclip className="w-5 h-5" /></button>
                                {!newMessage && <button className="text-muted-foreground hover:text-foreground"><Camera className="w-5 h-5" /></button>}
                            </div>

                            <button
                                onClick={newMessage ? handleSendMessage : () => alert("Segure para gravar áudio (Simulação)")}
                                className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                            >
                                {newMessage ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        </div>

                    </motion.div>
                </AnimatePresence>,
                document.body
            )}

        </div>
    )
}
