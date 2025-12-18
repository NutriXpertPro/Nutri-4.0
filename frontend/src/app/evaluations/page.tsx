"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  TrendingUp,
  Droplets,
  Flame,
  Users,
  Ruler,
  Target,
  FileText,
  Upload,
  Share2,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { evaluationService, Evaluation } from "@/services/evaluation-service";
import { useQuery } from "@tanstack/react-query";

export default function EvaluationsPage() {
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Carregar todas as avaliações
  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => evaluationService.listAll(),
    refetchOnWindowFocus: false,
  });

  // Filtrar avaliações com base na busca
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvaluations(evaluations);
      return;
    }

    const filtered = evaluations.filter(evaluation =>
      evaluation.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredEvaluations(filtered);
  }, [searchQuery, evaluations]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Avaliações Físicas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as avaliações físicas dos seus pacientes
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar avaliações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-linear-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total de Avaliações
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluations.length}</div>
              <p className="text-xs text-muted-foreground">+5 este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Média Peso
                </CardTitle>
                <Droplets className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluations.length ? (evaluations.reduce((sum, e) => sum + e.weight, 0) / evaluations.length).toFixed(1) : '0'} kg
              </div>
              <p className="text-xs text-muted-foreground">±0.5 kg</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Média Gordura
                </CardTitle>
                <Flame className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluations.length ? (evaluations.reduce((sum, e) => sum + e.body_fat, 0) / evaluations.length).toFixed(1) : '0'} %
              </div>
              <p className="text-xs text-muted-foreground">-1.2% médio</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-violet-500/10 to-violet-600/10 border-violet-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-violet-600 dark:text-violet-400">
                  Média Músculo
                </CardTitle>
                <Users className="h-4 w-4 text-violet-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluations.length ? (evaluations.reduce((sum, e) => sum + e.muscle_mass, 0) / evaluations.length).toFixed(1) : '0'} kg
              </div>
              <p className="text-xs text-muted-foreground">+0.8 kg médio</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolution Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Gráficos Evolutivos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Visualização de gráficos de evolução</p>
                <p className="text-sm mt-1">Peso • Água • Gordura • Músculo</p>
              </div>
            </CardContent>
          </Card>

          {/* Anthropometry Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Antropometria
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <Ruler className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Gráfico de medidas corporais</p>
                <p className="text-sm mt-1">Braço • Abdômen • Quadril • Cintura • etc</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Data Início</h4>
                <p className="text-2xl font-bold">01/12/2024</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Estado Atual</h4>
                <div className="space-y-1">
                  <p>Peso: 78.5 kg</p>
                  <p>Gordura: 22.5%</p>
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Meta</h4>
                <div className="space-y-1">
                  <p>Peso: 72 kg</p>
                  <p>Gordura: 18%</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Linha de Tendência de Evolução</h4>
              <div className="h-32 bg-muted rounded flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluations List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Histórico de Avaliações
            </CardTitle>
            {selectedPatient && (
              <Badge variant="secondary">
                Paciente: {selectedPatient}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Carregando avaliações...</p>
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma avaliação encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Nenhuma avaliação corresponde à sua busca" : "Comece adicionando avaliações para seus pacientes"}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Avaliação
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvaluations.map((evaluation) => (
                  <div 
                    key={evaluation.id} 
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{evaluation.patient.name}</h4>
                          <p className="text-sm text-muted-foreground">{evaluation.patient.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary">Peso: {evaluation.weight} kg</Badge>
                            <Badge variant="secondary">Gordura: {evaluation.body_fat}%</Badge>
                            <Badge variant="secondary">Músculo: {evaluation.muscle_mass} kg</Badge>
                            <Badge variant="secondary">Data: {new Date(evaluation.date).toLocaleDateString('pt-BR')}</Badge>
                          </div>
                          {evaluation.notes && (
                            <p className="text-sm text-muted-foreground mt-2">"{evaluation.notes}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Controls */}
        <div className="flex flex-wrap gap-4">
          <Card className="flex-1 min-w-[250px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ficha Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Criar Ficha Antropométrica
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[250px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Externo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload de Exame Externo
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[250px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Compartilhar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar Evolução
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}