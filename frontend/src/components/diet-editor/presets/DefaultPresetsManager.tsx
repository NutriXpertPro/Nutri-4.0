import React, { useState, useEffect } from 'react';
import {
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  Pill,
  Plus,
  Edit3,
  Trash2,
  Trash,
  X,
  Settings,
  Star,
  Save,
  Flame,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDietEditorStore, MealPreset } from '@/stores/diet-editor-store';
import { PresetFoodItem } from './PresetFoodItem';

// Tipos de refeio
const MEAL_TYPES = [
  { id: 'cafe_da_manha', label: 'Café da Manhã', icon: Coffee },
  { id: 'lanche_manha', label: 'Lanche da Manhã', icon: Cookie },
  { id: 'almoco', label: 'Almoço', icon: UtensilsCrossed },
  { id: 'lanche_tarde', label: 'Lanche da Tarde', icon: Cookie },
  { id: 'jantar', label: 'Jantar', icon: UtensilsCrossed },
  { id: 'ceia', label: 'Ceia', icon: Moon },
];

// Tipos de dieta
const DIET_TYPES = [
  { id: 'normocalorica', label: 'Normocalórica' },
  { id: 'low_carb', label: 'Low Carb' },
  { id: 'high_carb', label: 'High Carb' },
  { id: 'cetogenica', label: 'Cetogênica' },
  { id: 'mediterranea', label: 'Mediterrânea' },
  { id: 'vegetariana', label: 'Vegetariana' },
  { id: 'vegana', label: 'Vegana' },
  { id: 'sem_gluten', label: 'Sem Glúten' },
  { id: 'hiperproteica', label: 'Hiperproteica' },
  { id: 'personalizada', label: 'Personalizada' },
];

interface DefaultPresetsManagerProps {
  onBack?: () => void;
  targetMealId?: string; // ID da refeição alvo para aplicar o preset padrão (opcional)
  onPresetApplied?: () => void; // Callback quando um preset é aplicado
}

export function DefaultPresetsManager({ onBack, targetMealId, onPresetApplied }: DefaultPresetsManagerProps) {
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [selectedDietType, setSelectedDietType] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Pegar presets e funções do store
  const mealPresets = useDietEditorStore(state => state.mealPresets);
  const defaultPresets = useDietEditorStore(state => state.defaultPresets);
  const loadMealPresets = useDietEditorStore(state => state.loadMealPresets);
  const loadDefaultPresets = useDietEditorStore(state => state.loadDefaultPresets);
  const setDefaultPreset = useDietEditorStore(state => state.setDefaultPreset);
  const removeDefaultPreset = useDietEditorStore(state => state.removeDefaultPreset);
  const getDefaultPreset = useDietEditorStore(state => state.getDefaultPreset);

  // Carregar presets quando o componente montar
  useEffect(() => {
    loadMealPresets();
    loadDefaultPresets();
  }, [loadMealPresets, loadDefaultPresets]);

  // Obter presets filtrados por tipo de refeição e dieta
  const getPresetsForType = (mealType: string, dietType: string) => {
    return mealPresets.filter(preset =>
      preset.meal_type === mealType && preset.diet_type === dietType && preset.is_active
    );
  };

  // Obter preset padrão para combinação específica
  const currentDefaultPreset = selectedMealType && selectedDietType
    ? getDefaultPreset(selectedMealType, selectedDietType)
    : null;

  // Obter presets disponíveis para seleção
  const availablePresets = selectedMealType && selectedDietType
    ? getPresetsForType(selectedMealType, selectedDietType)
    : [];

  const handleSetDefaultPreset = async (presetId: number) => {
    if (selectedMealType && selectedDietType) {
      try {
        const { toast } = await import('sonner');
        await setDefaultPreset(selectedMealType, selectedDietType, presetId);
        // Atualizar a lista de presets padro
        loadDefaultPresets();
        toast.success('Tipo de refeição definido como padrão para esta dieta!');
      } catch (error) {
        console.error('Erro ao definir preset padrão:', error);
        const { toast } = await import('sonner');
        toast.error('Erro ao definir preset padrão');
      }
    }
  };

  const handleRemoveDefaultPreset = async () => {
    if (selectedMealType && selectedDietType) {
      try {
        const { toast } = await import('sonner');
        await removeDefaultPreset(selectedMealType, selectedDietType);
        // Atualizar a lista de presets padro
        loadDefaultPresets();
        toast.success('Padrão removido com sucesso!');
      } catch (error) {
        console.error('Erro ao remover preset padrão:', error);
        const { toast } = await import('sonner');
        toast.error('Erro ao remover padrão');
      }
    }
  };

  const handleApplyDefaultPreset = (targetMealIdParam: string) => {
    if (selectedMealType && selectedDietType) {
      alert('Alimentos aplicados à dieta com sucesso!');
      // Aplicar o preset padrão à refeição especificada
      useDietEditorStore.getState().applyDefaultPreset(targetMealIdParam, selectedMealType, selectedDietType);
      if (onPresetApplied) {
        onPresetApplied();
      }
    }
  };

  // Função para aplicar o preset padrão atual à refeição alvo
  const handleApplyToTargetMeal = () => {
    if (targetMealId && selectedMealType && selectedDietType) {
      handleApplyDefaultPreset(targetMealId);
    }
  };

  const getMealTypeIcon = (type: string) => {
    const meal = MEAL_TYPES.find(m => m.id === type);
    return meal ? meal.icon : UtensilsCrossed;
  };

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground min-h-0">
      {/* Header */}
      <div className="h-0" /> {/* Removido o header com botão X conforme solicitado */}

      {/* Conteúdo com Scroll Global */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          <div>
            {/* Seletores de tipo de refeição e dieta */}
            <div className="mb-8">
              <h3 className="text-sm font-normal text-foreground mb-3">Selecione o tipo de refeição e dieta</h3>

              <div className="mb-6">
                <h4 className="text-sm font-normal text-foreground mb-2">Tipo de Refeição</h4>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map(meal => (
                    <button
                      key={meal.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors ${selectedMealType === meal.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                        }`}
                      onClick={() => setSelectedMealType(meal.id === selectedMealType ? '' : meal.id)}
                    >
                      {meal.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-normal text-foreground mb-2">Tipo de Dieta</h4>
                <div className="flex flex-wrap gap-2">
                  {DIET_TYPES.map(diet => (
                    <button
                      key={diet.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors ${selectedDietType === diet.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                        }`}
                      onClick={() => setSelectedDietType(diet.id === selectedDietType ? '' : diet.id)}
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Configuração de preset padrão */}
            {selectedMealType && selectedDietType && (
              <div className="space-y-6">
                <Card className="shadow-lg border-primary/20">
                  <CardContent className="p-6">
                    {/* Exibir preset padrão atual */}
                    {currentDefaultPreset ? (
                      <div className="mb-0">
                        {(() => {
                          const preset = mealPresets.find(p => p.id === currentDefaultPreset.preset);
                          if (!preset) return <div className="text-muted-foreground text-center py-8">Preset não encontrado</div>;

                          const IconComponent = getMealTypeIcon(selectedMealType);
                          const mealLabel = MEAL_TYPES.find(m => m.id === selectedMealType)?.label || selectedMealType;
                          const dietLabel = DIET_TYPES.find(d => d.id === selectedDietType)?.label || selectedDietType;

                          return (
                            <Card className="group border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col shadow-xl">
                              {/* Cabeçalho do preset sincronizado */}
                              <div className="p-4 bg-muted/10 border-b border-border/10">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-md group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                      <IconComponent className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-normal text-lg text-foreground truncate flex items-center gap-2">
                                        {mealLabel}
                                        <span className="text-muted-foreground/40 mx-2 font-normal">-</span>
                                        <span className={`font-normal ${selectedDietType === 'low_carb' ? 'text-amber-500' :
                                          selectedDietType === 'cetogenica' ? 'text-purple-500' :
                                            selectedDietType === 'hiperproteica' ? 'text-rose-500' :
                                              selectedDietType === 'high_carb' ? 'text-blue-500' :
                                                (selectedDietType === 'vegetariana' || selectedDietType === 'vegana') ? 'text-emerald-500' :
                                                  selectedDietType === 'normocalorica' ? 'text-sky-500' :
                                                    'text-primary'
                                          }`}>
                                          {dietLabel}
                                        </span>
                                        <Star className="w-5 h-5 fill-primary text-primary animate-in zoom-in duration-300 opacity-80" />
                                      </h4>
                                      <p className="text-xs text-muted-foreground mt-1 font-normal">{preset.name}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={handleRemoveDefaultPreset}
                                      className="h-9 px-3 gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Remover Padrão
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Conteúdo sincronizado */}
                              <div className="p-6 flex flex-col">
                                {/* Quadrado de nutrientes sincronizado */}
                                <div className="mb-6 pb-6 border-b border-border/10">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="flex flex-col items-center justify-center p-3 bg-muted/20 rounded-xl border border-border/40">
                                      <div className="text-lg font-normal text-foreground">
                                        {preset.total_calories}
                                      </div>
                                      <div className="text-[10px] uppercase font-normal text-muted-foreground mt-0.5 tracking-tighter">kcal</div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 bg-primary/10 rounded-xl border border-primary/20">
                                      <div className="text-lg font-normal text-primary">
                                        {preset.total_protein}
                                      </div>
                                      <div className="text-[10px] uppercase font-normal text-muted-foreground mt-0.5 tracking-tighter">g PTN</div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 bg-primary/10 rounded-xl border border-primary/20">
                                      <div className="text-lg font-normal text-primary">
                                        {preset.total_carbs}
                                      </div>
                                      <div className="text-[10px] uppercase font-normal text-muted-foreground mt-0.5 tracking-tighter">g CHO</div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 bg-primary/10 rounded-xl border border-primary/20">
                                      <div className="text-lg font-normal text-primary">
                                        {preset.total_fats}
                                      </div>
                                      <div className="text-[10px] uppercase font-normal text-muted-foreground mt-0.5 tracking-tighter">g FAT</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Lista de Alimentos sincronizada */}
                                <div className="mb-6">
                                  <h5 className="text-[11px] font-normal text-foreground uppercase tracking-[0.2em] mb-4 opacity-70">Lista de Alimentos</h5>
                                  <div className="space-y-2">
                                    {preset.foods.map((food, idx) => (
                                      <PresetFoodItem key={idx} food={food} className="py-2.5 px-4 bg-muted/20" />
                                    ))}
                                  </div>
                                </div>

                                {/* Botão Salvar (ou Aplicar) */}
                                <div className="flex justify-end pt-2">
                                  <Button
                                    variant="default"
                                    size="lg"
                                    onClick={async () => {
                                      try {
                                        setIsSaving(true);
                                        const { toast } = await import('sonner');
                                        toast.success('Preferência padrão confirmada!');
                                        if (onPresetApplied) {
                                          setTimeout(() => {
                                            onPresetApplied();
                                            setIsSaving(false);
                                          }, 800);
                                        } else {
                                          setTimeout(() => setIsSaving(false), 2000);
                                        }
                                      } catch (error) {
                                        console.error(error);
                                        setIsSaving(false);
                                      }
                                    }}
                                    className={cn(
                                      "gap-2 px-8 h-11 transition-all duration-300 font-normal",
                                      isSaving ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-primary hover:bg-primary/90"
                                    )}
                                    disabled={isSaving}
                                  >
                                    {isSaving ? (
                                      <>
                                        <Check className="w-5 h-5 animate-in zoom-in duration-300" />
                                        Salvo
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-5 h-5" />
                                        Salvar
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {/* List available presets to set as default if none exists */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-foreground">Presets Disponíveis para esta Categoria</h4>
                          <Badge variant="outline">{availablePresets.length} encontrados</Badge>
                        </div>

                        {availablePresets.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availablePresets.map(preset => (
                              <Card key={preset.id} className="group border border-border/40 hover:border-primary/40 transition-all overflow-hidden flex flex-col bg-card/40">
                                <div className="p-4 border-b border-border/10 flex justify-between items-center">
                                  <h5 className="font-medium text-sm truncate">{preset.name}</h5>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 gap-2 text-xs hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleSetDefaultPreset(preset.id)}
                                  >
                                    <Star className="w-4 h-4" />
                                    Tornar Padrão
                                  </Button>
                                </div>
                                <div className="p-3 bg-muted/5 flex-1">
                                  <div className="grid grid-cols-4 gap-2 text-center">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] text-muted-foreground uppercase font-normal">kcal</span>
                                      <span className="text-xs font-normal">{preset.total_calories}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-border/10">
                                      <span className="text-[10px] text-muted-foreground uppercase font-normal">ptn</span>
                                      <span className="text-xs font-normal">{preset.total_protein}g</span>
                                    </div>
                                    <div className="flex flex-col border-l border-border/10">
                                      <span className="text-[10px] text-muted-foreground uppercase font-normal">cho</span>
                                      <span className="text-xs font-normal">{preset.total_carbs}g</span>
                                    </div>
                                    <div className="flex flex-col border-l border-border/10">
                                      <span className="text-[10px] text-muted-foreground uppercase font-normal">fat</span>
                                      <span className="text-xs font-normal">{preset.total_fats}g</span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="mb-6 p-12 flex flex-col items-center justify-center text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                            <div className="p-4 bg-muted/30 rounded-full mb-4">
                              <Star className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <p className="text-base font-medium text-foreground mb-1">Nenhum preset disponível</p>
                            <p className="text-sm text-muted-foreground">
                              Crie um preset em "Meus Presets" para esta categoria primeiro.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Dashboard de Presets Padrão Ativos */}
            {!selectedMealType && !selectedDietType && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Seus Padrões Ativos</h3>
                  <Badge variant="outline" className="text-xs">
                    {defaultPresets.length} configurados
                  </Badge>
                </div>

                {defaultPresets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                    <Settings className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h4 className="text-lg font-normal text-foreground mb-2">Nenhum padrão configurado</h4>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Use os filtros acima para definir presets padrão ou clique na estrela "Padrão" nos seus presets.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {defaultPresets.map((def) => {
                      const preset = mealPresets.find(p => p.id === def.preset);
                      if (!preset) return null;

                      const IconComponent = getMealTypeIcon(def.meal_type);
                      const mealLabel = MEAL_TYPES.find(m => m.id === def.meal_type)?.label || def.meal_type;
                      const dietLabel = DIET_TYPES.find(d => d.id === def.diet_type)?.label || def.diet_type;

                      return (
                        <Card key={`${def.meal_type}-${def.diet_type}`} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col">
                          <div className="flex flex-col h-full">
                            {/* Cabeçalho do preset sincronizado */}
                            <div className="p-4 bg-muted/10 border-b border-border/10">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center shadow-sm">
                                    <IconComponent className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-normal text-sm text-foreground truncate">
                                      {mealLabel}
                                      <span className="text-muted-foreground/40 mx-1.5 font-normal">-</span>
                                      <span className={`font-normal ${def.diet_type === 'low_carb' ? 'text-amber-500' :
                                        def.diet_type === 'cetogenica' ? 'text-purple-500' :
                                          def.diet_type === 'hiperproteica' ? 'text-rose-500' :
                                            def.diet_type === 'high_carb' ? 'text-blue-500' :
                                              (def.diet_type === 'vegetariana' || def.diet_type === 'vegana') ? 'text-emerald-500' :
                                                def.diet_type === 'normocalorica' ? 'text-sky-500' :
                                                  'text-primary'
                                        }`}>
                                        {dietLabel}
                                      </span>
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 italic">{preset.name}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                                  onClick={() => {
                                    if (confirm('Remover este padrão?')) {
                                      removeDefaultPreset(def.meal_type, def.diet_type).then(() => loadDefaultPresets());
                                    }
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Conteúdo sincronizado */}
                            <div className="flex-1 p-3 flex flex-col">
                              {/* Quadrado de nutrientes sincronizado */}
                              <div className="mb-4 pb-3 border-b border-border/10">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                  <div className="flex items-center justify-center p-1.5 bg-muted/20 rounded-md border border-border/40">
                                    <div className="text-sm font-normal text-foreground">
                                      {preset.total_calories} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">kcal</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center p-1.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                    <div className="text-sm font-normal text-emerald-600 dark:text-emerald-400">
                                      {preset.total_protein} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">g PTN</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                                    <div className="text-sm font-normal text-blue-600 dark:text-blue-400">
                                      {preset.total_carbs} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">g CHO</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center p-1.5 bg-orange-500/10 rounded-md border border-orange-500/20">
                                    <div className="text-sm font-normal text-orange-600 dark:text-orange-400">
                                      {preset.total_fats} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">g FAT</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Lista de Alimentos sincronizada */}
                              <div className="flex-1 min-h-0">
                                <h5 className="text-[10px] font-normal text-foreground uppercase tracking-widest mb-2 opacity-50">Alimentos</h5>
                                <div className="space-y-1">
                                  {preset.foods.map((food, idx) => (
                                    <PresetFoodItem key={idx} food={food} />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Rodapé com botão Salvar */}
                            <div className="p-3 bg-transparent">
                              <div className="flex justify-end">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className={cn(
                                    "gap-1.5 px-4 py-1 text-xs h-8 transition-all duration-300 font-normal",
                                    isSaving ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-primary hover:bg-primary/90"
                                  )}
                                  disabled={isSaving}
                                  onClick={async () => {
                                    try {
                                      setIsSaving(true);
                                      const { toast } = await import('sonner');
                                      toast.success('Preferência padrão confirmada!');
                                      if (onPresetApplied) {
                                        setTimeout(() => {
                                          onPresetApplied();
                                          setIsSaving(false);
                                        }, 800);
                                      } else {
                                        setTimeout(() => setIsSaving(false), 2000);
                                      }
                                    } catch (error) {
                                      console.error(error);
                                      setIsSaving(false);
                                    }
                                  }}
                                >
                                  {isSaving ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 animate-in zoom-in duration-300" />
                                      Salvo
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-3.5 h-3.5" />
                                      Salvar
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Mensagem quando há seleção mas não há presets disponíveis */}
            {selectedMealType && selectedDietType && availablePresets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UtensilsCrossed className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h4 className="text-lg font-normal text-foreground mb-2">Nenhum preset disponível</h4>
                <p className="text-sm text-muted-foreground max-w-md">
                  Não há presets criados para esta combinação. Crie um preset na aba "Meus Presets" primeiro.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}