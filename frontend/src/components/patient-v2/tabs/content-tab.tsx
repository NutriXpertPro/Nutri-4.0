"use client"

import { Play, BookOpen, Star, Clock, ChevronRight } from "lucide-react"

export function ContentTab({ onBack }: { onBack?: () => void }) {
    const featured = {
        title: "Como manter a dieta em viagens",
        category: "Dicas Práticas",
        duration: "5 min",
        image: "bg-gradient-to-br from-orange-500 to-pink-600"
    }

    const articles = [
        {
            id: 1,
            title: "Os benefícios da água",
            category: "Hidratação",
            readTime: "3 min",
            icon: BookOpen,
            bg: "bg-blue-500/10",
            color: "text-blue-500"
        },
        {
            id: 2,
            title: "Receita: Whey Shake Cremoso",
            category: "Receitas",
            readTime: "10 min",
            icon: Star,
            bg: "bg-yellow-500/10",
            color: "text-yellow-500"
        },
        {
            id: 3,
            title: "Dormir bem emagrece?",
            category: "Sono",
            readTime: "6 min",
            icon: MoonIcon, // defined below
            bg: "bg-purple-500/10",
            color: "text-purple-500"
        }
    ]

    return (
        <div className="space-y-8 pb-20">
            {/* Featured Card */}
            <div className="relative h-64 rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl">
                <div className={`absolute inset-0 ${featured.image} transition-transform duration-700 group-hover:scale-105`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-black/80 to-transparent">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-2">
                        {featured.category}
                    </span>
                    <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                        {featured.title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-gray-200">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.duration} leitura</span>
                        <span className="flex items-center gap-1"><Play className="w-3 h-3 fill-current" /> Vídeo aula</span>
                    </div>
                </div>

                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                    <ChevronRight className="w-5 h-5 text-white" />
                </div>
            </div>

            {/* Horizontal Scroll Topics */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 px-1">Tópicos para você</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {["Nutrição Básica", "Receitas Fit", "Suplementação", "Psicologia"].map((topic, i) => (
                        <button key={i} className="whitespace-nowrap px-6 py-3 rounded-xl bg-card border border-border/10 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors">
                            {topic}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {articles.map((article) => {
                    const Icon = article.icon
                    return (
                        <div key={article.id} className="flex gap-4 p-4 rounded-2xl bg-card/40 border border-border/10 hover:bg-card/60 transition-all cursor-pointer group hover:shadow-md">
                            <div className={`w-12 h-12 rounded-xl ${article.bg} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${article.color}`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{article.category}</span>
                                    <span className="text-[10px] text-muted-foreground/80">{article.readTime}</span>
                                </div>
                                <h4 className="font-medium text-foreground mt-0.5 group-hover:text-primary transition-colors">{article.title}</h4>
                            </div>
                        </div>
                    )
                })}
            </div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="w-full mt-4 p-4 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
                </button>
            )}
        </div>
    )
}

function MoonIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    )
}
