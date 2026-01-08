import React, { useState, useEffect } from 'react';
import {
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  Pill,
  Settings,
  Search,
  Grid3X3,
  List,
  Plus,
  Flame,
  Apple,
  Wheat,
  Droplets,
  Star
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDietEditorStore, MealPreset } from '@/stores/diet-editor-store';
import { MealPresetsManager } from './MealPresetsManager';
import { PresetFoodItem } from './PresetFoodItem';

// Tipos de refeio
// Tipos de refeio
const MEAL_TYPES = [
  { id: 'cafe_da_manha', label: 'Café da Manhã', icon: Coffee },
  { id: 'lanche_manha', label: 'Lanche da Manhã', icon: Cookie },
  { id: 'almoco', label: 'Almoço', icon: UtensilsCrossed },
  { id: 'lanche_tarde', label: 'Lanche da Tarde', icon: Cookie },
  { id: 'jantar', label: 'Jantar', icon: UtensilsCrossed },
  { id: 'ceia', label: 'Ceia', icon: Moon },
];

// Tipos de dieta - Sincronizado com diet-editor-store.ts
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

const getMealTypeLabel = (type: string) => {
  const meal = MEAL_TYPES.find(m => m.id === type);
  return meal ? meal.label : type;
};

const getDietTypeLabel = (type: string) => {
  const diet = DIET_TYPES.find(d => d.id === type);
  return diet ? diet.label : type;
};

interface MealPresetSelectorProps {
  mealType: string;
  dietType: string;
  onPresetSelect: (preset: MealPreset) => void;
  currentMealName: string;
}

export function MealPresetSelector({ mealType, dietType, onPresetSelect, currentMealName }: MealPresetSelectorProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [selectedDietType, setSelectedDietType] = useState<string>('');
  const [showManager, setShowManager] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Alterado para grid como padrão

  // Pegar presets do store
  const mealPresets = useDietEditorStore(state => state.mealPresets);
  const favoritePresetIds = useDietEditorStore(state => state.favoritePresetIds);
  const loadMealPresets = useDietEditorStore(state => state.loadMealPresets);
  const { toggleFavoritePreset } = useDietEditorStore();

  // Carregar presets quando o componente montar
  useEffect(() => {
    loadMealPresets();
  }, [loadMealPresets]);

  // Filtrar presets com base nos critérios selecionados
  const filteredPresets = mealPresets.filter(p =>
    (!selectedMealType || p.meal_type === selectedMealType) &&
    (!selectedDietType || p.diet_type === selectedDietType) &&
    (searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePresetSelect = (preset: MealPreset) => {
    onPresetSelect(preset);
  };

  const getMealTypeIcon = (type: string) => {
    const meal = MEAL_TYPES.find(m => m.id === type);
    return meal ? meal.icon : UtensilsCrossed;
  };

  return (
    <div className="w-full flex flex-col bg-background min-h-0 flex-1 overflow-hidden">
      {/* Header com controles - Só exibe se NÃO estiver no modo gerenciador */}
      {!showManager && (
        <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Presets para {currentMealName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {filteredPresets.length} {filteredPresets.length === 1 ? 'preset encontrado' : 'presets encontrados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar presets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-8 text-sm w-48 sm:w-64"
                />
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManager(true)}
                className="gap-2 ml-2 h-8 text-xs font-semibold"
              >
                <Settings className="w-3.5 h-3.5" />
                Gerenciar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal com rolagem garantida */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {showManager ? (
          <div className="h-full flex flex-col min-h-0">
            <MealPresetsManager
              onApplyPreset={onPresetSelect}
              onBack={() => setShowManager(false)}
            />
          </div>
        ) : (
          <div className="flex flex-col min-h-0">
            {/* Lista de presets filtrados */}
            <div className="p-4 sm:p-6 min-h-full">
              {/* Seletores por tipo de refeição e dieta */}
              <div className="mb-6">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Tipo de Refeição</h4>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_TYPES.map(meal => (
                      <button
                        key={meal.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedMealType === meal.id
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
                  <h4 className="text-sm font-medium text-foreground mb-2">Tipo de Dieta</h4>
                  <div className="flex flex-wrap gap-2">
                    {DIET_TYPES.map(diet => (
                      <button
                        key={diet.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedDietType === diet.id
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

              {/* Filtro de busca */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar presets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              {filteredPresets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="p-4 bg-muted/30 rounded-full mb-4">
                    <UtensilsCrossed className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Nenhum preset encontrado</h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    Não encontramos presets para {currentMealName} do tipo {getDietTypeLabel(dietType)}.
                    Crie um novo preset usando o botão "Gerenciar" ou ajuste os filtros de busca.
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowManager(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Criar Primeiro Preset
                  </Button>
                </div>
              ) : (
                <div className={cn(
                  "grid gap-6", // Aumentei o gap para melhor espaçamento
                  viewMode === 'grid'
                    ? "grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2" // Reduzi o número de colunas para aumentar o tamanho dos cards
                    : "grid-cols-1"
                )}>
                  {filteredPresets.map((preset) => {
                    const IconComponent = getMealTypeIcon(preset.meal_type);
                    return (
                      <Card
                        key={preset.id}
                        className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer h-full flex flex-col max-h-[600px]"
                        onClick={() => handlePresetSelect(preset)}
                      >
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center shadow-sm">
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-foreground truncate">{preset.name}</h4>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {getMealTypeLabel(preset.meal_type)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                    {getDietTypeLabel(preset.diet_type)}
                                  </span>
                                </div>

                                {preset.description && (
                                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                    {preset.description}
                                  </p>
                                )}

                                {/* Lista de alimentos do preset */}
                                {preset.foods && preset.foods.length > 0 && (
                                  <div className="mt-4 border-t border-border/20 pt-3">
                                    <h5 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Alimentos</h5>
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                      {preset.foods.slice(0, 5).map((food, index) => (
                                        <PresetFoodItem key={index} food={food} />
                                      ))}
                                      {preset.foods.length > 5 && (
                                        <div className="text-xs text-muted-foreground text-center py-2">
                                          +{preset.foods.length - 5} alimentos...
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/20">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Flame className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{preset.total_calories}</div>
                                <div className="text-xs text-muted-foreground">kcal</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Apple className="w-4 h-4 text-emerald-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{preset.total_protein}g</div>
                                <div className="text-xs text-muted-foreground">prot</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Wheat className="w-4 h-4 text-orange-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{preset.total_carbs}g</div>
                                <div className="text-xs text-muted-foreground">carb</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Droplets className="w-4 h-4 text-amber-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{preset.total_fats}g</div>
                                <div className="text-xs text-muted-foreground">gord</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={preset.is_active ? "default" : "outline"}
                                className="text-xs px-3 py-1.5 font-medium"
                              >
                                <div className={`w-2 h-2 rounded-full mr-2 ${preset.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                {preset.is_active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoritePreset(preset.id);
                                }}
                                className="gap-2 px-3 text-sm"
                              >
                                <Star className="w-4 h-4" />
                                {favoritePresetIds.includes(preset.id) ? 'Favorito' : 'Favoritar'}
                              </Button>
                              <Button
                                size="sm"
                                className="gap-2 px-4 font-medium text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePresetSelect(preset);
                                }}
                              >
                                <Settings className="w-4 h-4" />
                                Salvar
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
          </div>
        )}
      </div>
    </div>
  );
}