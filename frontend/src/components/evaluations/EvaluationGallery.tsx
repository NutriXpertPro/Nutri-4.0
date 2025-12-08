"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Evaluation } from "@/services/evaluation-service"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EvaluationGalleryProps {
    evaluations: Evaluation[]
}

export function EvaluationGallery({ evaluations }: EvaluationGalleryProps) {
    // Filter only evaluations that have photos
    const evaluationsWithPhotos = React.useMemo(() => {
        return evaluations.filter(e => e.photos && e.photos.length > 0)
    }, [evaluations])

    if (evaluationsWithPhotos.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <p>Nenhuma foto registrada ainda.</p>
            </div>
        )
    }

    return (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
                <Tabs defaultValue="all" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Galeria de Evolução</h3>
                        <TabsList>
                            <TabsTrigger value="all">Todas</TabsTrigger>
                            <TabsTrigger value="front">Frente</TabsTrigger>
                            <TabsTrigger value="side">Lado</TabsTrigger>
                            <TabsTrigger value="back">Costas</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="space-y-8">
                        {evaluationsWithPhotos.map((evaluation) => (
                            <div key={evaluation.id} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-sm">
                                        {format(new Date(evaluation.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {evaluation.photos.map((photo) => (
                                        <div key={photo.id} className="relative group aspect-[3/4] overflow-hidden rounded-xl border bg-muted">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={photo.image}
                                                alt={`Foto ${photo.label}`}
                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 left-2">
                                                <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/70 border-0">
                                                    {photo.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    {['front', 'side', 'back'].map((filterType) => (
                        <TabsContent key={filterType} value={filterType} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {evaluationsWithPhotos.flatMap(ev =>
                                ev.photos
                                    .filter(p => p.label.toLowerCase() === (filterType === 'back' ? 'costas' : filterType === 'side' ? 'lado' : 'frente'))
                                    .map(photo => (
                                        <div key={photo.id} className="space-y-2">
                                            <div className="relative group aspect-[3/4] overflow-hidden rounded-xl border bg-muted">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={photo.image}
                                                    alt={`Foto ${photo.label}`}
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-2 left-2">
                                                    <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/70 border-0">
                                                        {format(new Date(ev.date), "dd/MM/yy")}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    )
}
