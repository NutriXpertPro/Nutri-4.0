import React, { useState, useEffect, useRef } from 'react';
import {
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  Pill,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Settings,
  Search,
  Filter,
  LayoutGrid,
  List,
  Flame,
  Apple,
  Wheat,
  Droplets,
  Star,
  Layers
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useDietEditorStore, MealPreset, MealPresetFood } from '@/stores/diet-editor-store';
import { Food, foodService } from '@/services/food-service';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { PresetQuantitySelector } from './PresetQuantitySelector';
import { PresetFoodItem } from './PresetFoodItem';
import { DefaultPresetsManager } from './DefaultPresetsManager';

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

interface PresetManagerProps {
  onApplyPreset?: (preset: MealPreset) => void;
  onBack?: () => void;
  targetMealId?: string;
  onPresetApplied?: () => void;
  initialMealType?: string;
  initialDietType?: string;
}

export function PresetManager({ onApplyPreset, onBack, targetMealId, onPresetApplied, initialMealType, initialDietType }: PresetManagerProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'defaults'>('presets');

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">Gerenciador de Presets</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Configure seus modelos de refeição</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/50 bg-muted/20">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'presets' | 'defaults')} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-12">
            <TabsTrigger value="presets" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Meus Presets
            </TabsTrigger>
            <TabsTrigger value="defaults" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Presets Padrão
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'presets' ? (
          <MealPresetsManagerContent
            onApplyPreset={onApplyPreset}
            initialMealType={initialMealType}
            initialDietType={initialDietType}
          />
        ) : (
          <DefaultPresetsManager
            onBack={() => setActiveTab('presets')}
            targetMealId={targetMealId}
            onPresetApplied={onPresetApplied}
          />
        )}
      </div>
    </div>
  );
}

// Componente separado para os presets normais
function MealPresetsManagerContent({
  onApplyPreset,
  initialMealType = '',
  initialDietType = ''
}: {
  onApplyPreset?: (preset: MealPreset) => void,
  initialMealType?: string,
  initialDietType?: string
}) {
  const [selectedMealType, setSelectedMealType] = useState<string>(initialMealType);
  const [selectedDietType, setSelectedDietType] = useState<string>(initialDietType);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingPreset, setEditingPreset] = useState<MealPreset | null>(null);
  const [newPreset, setNewPreset] = useState<Omit<MealPreset, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    meal_type: 'cafe_da_manha',
    diet_type: 'normocalorica',
    description: '',
    foods: [],
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0,
    is_active: true,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estados para gerenciamento de alimentos
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Hooks para busca de alimentos
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['food-search-preset', debouncedQuery, sourceFilter],
    queryFn: () => foodService.search(debouncedQuery, {
      source: sourceFilter || undefined,
      limit: 50,
      page_size: 50
    }),
    enabled: debouncedQuery.length >= 2,
  });

  // Ref para o container de busca
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Efeito para fechar o dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pegar presets e funções do store
  const mealPresets = useDietEditorStore(state => state.mealPresets);
  const favoritePresetIds = useDietEditorStore(state => state.favoritePresetIds);
  const createMealPreset = useDietEditorStore(state => state.createMealPreset);
  const updateMealPreset = useDietEditorStore(state => state.updateMealPreset);
  const deleteMealPreset = useDietEditorStore(state => state.deleteMealPreset);
  const loadMealPresets = useDietEditorStore(state => state.loadMealPresets);
  const { toggleFavoritePreset } = useDietEditorStore();

  // Carregar presets quando o componente montar
  useEffect(() => {
    loadMealPresets();
  }, [loadMealPresets]);

  // Filtrar presets com base nos critérios
  const filteredPresets = mealPresets.filter(preset => {
    const matchesMealType = !selectedMealType || preset.meal_type === selectedMealType;
    const matchesDietType = !selectedDietType || preset.diet_type === selectedDietType;
    const matchesSearch = !searchTerm ||
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesMealType && matchesDietType && matchesSearch;
  });

  const handleCreatePreset = () => {
    setIsCreating(true);
    setEditingPreset(null);
    setNewPreset({
      name: '',
      meal_type: selectedMealType || 'cafe_da_manha',
      diet_type: selectedDietType || 'normocalorica',
      description: '',
      foods: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0,
      is_active: true,
    });
  };

  const handleSavePreset = async () => {
    try {
      // Calcular totais nutricionais antes de salvar
      const calculateNutritionTotals = (preset: Omit<MealPreset, 'id' | 'created_at' | 'updated_at'> | MealPreset) => {
        const totals = preset.foods.reduce((acc, food) => {
          // Calcular valores baseados na quantidade (valores são por 100g, então ajustamos para a quantidade real)
          const multiplier = food.quantity / 100;
          return {
            calories: acc.calories + (food.calories * multiplier),
            protein: acc.protein + (food.protein * multiplier),
            carbs: acc.carbs + (food.carbs * multiplier),
            fats: acc.fats + (food.fats * multiplier),
          };
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        return {
          total_calories: Math.round(totals.calories),
          total_protein: Number(totals.protein.toFixed(1)),
          total_carbs: Number(totals.carbs.toFixed(1)),
          total_fats: Number(totals.fats.toFixed(1)),
        };
      };

      if (isCreating) {
        const totals = calculateNutritionTotals(newPreset);
        await createMealPreset({
          ...newPreset,
          ...totals
        });
      } else if (editingPreset) {
        const totals = calculateNutritionTotals(editingPreset);
        await updateMealPreset(editingPreset.id, {
          ...editingPreset,
          ...totals
        });
      }
      setIsCreating(false);
      setEditingPreset(null);
    } catch (error) {
      console.error('Erro ao salvar preset:', error);
    }
  };

  const handleEditPreset = (preset: MealPreset) => {
    setEditingPreset(preset);
    setIsCreating(false);
  };

  const handleDeletePreset = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este preset?')) {
      try {
        await deleteMealPreset(id);
      } catch (error) {
        console.error('Erro ao excluir preset:', error);
      }
    }
  };

  const handleApplyPresetClick = (preset: MealPreset) => {
    if (onApplyPreset) {
      onApplyPreset(preset);
    }
  };

  const getMealTypeLabel = (type: string) => {
    const meal = MEAL_TYPES.find(m => m.id === type);
    return meal ? meal.label : type;
  };

  const getDietTypeLabel = (type: string) => {
    const diet = DIET_TYPES.find(d => d.id === type);
    return diet ? diet.label : type;
  };

  const getMealTypeIcon = (type: string) => {
    const meal = MEAL_TYPES.find(m => m.id === type);
    return meal ? meal.icon : UtensilsCrossed;
  };

  // Funções para gerenciar alimentos no preset
  const addFoodToCurrentPreset = (food: any) => {
    const newFood = {
      id: Date.now() + Math.random(), // ID temporário
      food_name: food.nome,
      quantity: 100, // Quantidade padrão
      unit: 'g', // Unidade padrão
      calories: food.energia_kcal || 0,
      protein: food.proteina_g || 0,
      carbs: food.carboidrato_g || 0,
      fats: food.lipidios_g || 0,
      fiber: food.fibra_g || 0,
    };

    if (isCreating) {
      setNewPreset({
        ...newPreset,
        foods: [...newPreset.foods, newFood],
      });
    } else if (editingPreset) {
      setEditingPreset({
        ...editingPreset,
        foods: [...editingPreset.foods, newFood],
      });
    }
  };

  const removeFoodFromCurrentPreset = (foodId: number) => {
    if (isCreating) {
      setNewPreset({
        ...newPreset,
        foods: newPreset.foods.filter(f => f.id !== foodId),
      });
    } else if (editingPreset) {
      setEditingPreset({
        ...editingPreset,
        foods: editingPreset.foods.filter(f => f.id !== foodId),
      });
    }
  };

  const updateFoodInCurrentPreset = (foodId: number, updates: Partial<MealPresetFood>) => {
    if (isCreating) {
      setNewPreset({
        ...newPreset,
        foods: newPreset.foods.map(f => f.id === foodId ? { ...f, ...updates } : f),
      });
    } else if (editingPreset) {
      setEditingPreset({
        ...editingPreset,
        foods: editingPreset.foods.map(f => f.id === foodId ? { ...f, ...updates } : f),
      });
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Filtros e Busca */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            {/* Seletores por tipo de refeição e dieta */}
            <div className="mb-4">
              <div className="mb-3">
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
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleCreatePreset} className="gap-2 self-start">
              <Plus className="w-4 h-4" />
              Novo Preset
            </Button>
          </div>
        </div>

        {/* Filtro de busca */}
        <div className="mt-4">
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
      </div>

      {/* Formulário de criação/edição */}
      {(isCreating || editingPreset) && (
        <div className="mb-6">
          <Card className="max-w-4xl mx-auto shadow-lg border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-normal text-foreground">
                  {isCreating ? 'Criar Novo Preset' : 'Editar Preset'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingPreset(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-normal text-muted-foreground mb-2 block">Nome do Preset</label>
                    <Input
                      value={isCreating ? newPreset.name : editingPreset?.name || ''}
                      onChange={(e) =>
                        isCreating
                          ? setNewPreset({ ...newPreset, name: e.target.value })
                          : setEditingPreset({ ...editingPreset!, name: e.target.value })
                      }
                      placeholder="Ex: Café da Manhã Low Carb"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-normal text-muted-foreground mb-2 block">Tipo de Refeição</label>
                    <select
                      value={isCreating ? newPreset.meal_type : editingPreset?.meal_type || ''}
                      onChange={(e) =>
                        isCreating
                          ? setNewPreset({ ...newPreset, meal_type: e.target.value })
                          : setEditingPreset({ ...editingPreset!, meal_type: e.target.value })
                      }
                      className="w-full p-2 border border-input rounded-lg bg-background text-sm h-10"
                    >
                      {MEAL_TYPES.map(meal => (
                        <option key={meal.id} value={meal.id}>{meal.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-normal text-muted-foreground mb-2 block">Tipo de Dieta</label>
                    <select
                      value={isCreating ? newPreset.diet_type : editingPreset?.diet_type || ''}
                      onChange={(e) =>
                        isCreating
                          ? setNewPreset({ ...newPreset, diet_type: e.target.value })
                          : setEditingPreset({ ...editingPreset!, diet_type: e.target.value })
                      }
                      className="w-full p-2 border border-input rounded-lg bg-background text-sm h-10"
                    >
                      {DIET_TYPES.map(diet => (
                        <option key={diet.id} value={diet.id}>{diet.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="checkbox"
                        id="is-active"
                        checked={isCreating ? newPreset.is_active : editingPreset?.is_active || false}
                        onChange={(e) =>
                          isCreating
                            ? setNewPreset({ ...newPreset, is_active: e.target.checked })
                            : setEditingPreset({ ...editingPreset!, is_active: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                      />
                      <label htmlFor="is-active" className="text-sm font-normal text-foreground">
                        Ativo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Seção de seleção de alimentos */}
                <div className="pt-4 border-t border-border/20">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Alimentos do Preset</h4>

                  {/* Filtros por fonte de dados */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setSourceFilter(null)}
                      className={cn("text-[10px] px-3 py-1.5 rounded-lg border transition-all uppercase tracking-widest",
                        !sourceFilter ? "bg-yellow-500 text-white border-yellow-600 shadow-sm shadow-yellow-500/20" :
                          "text-yellow-600/70 border-yellow-500/20 hover:bg-yellow-500/5 hover:text-yellow-600")}
                    >
                      Todas
                    </button>
                    {['TACO', 'TBCA', 'USDA', 'IBGE'].map(src => {
                      const isActive = sourceFilter === src
                      let activeClass = "bg-primary text-primary-foreground border-primary"
                      let inactiveClass = "text-muted-foreground hover:text-foreground border-border/30 hover:border-primary/40 bg-muted/20"

                      switch (src) {
                        case 'TACO': activeClass = "bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20"; inactiveClass = "text-emerald-600/70 border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-600"; break;
                        case 'TBCA': activeClass = "bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/20"; inactiveClass = "text-orange-600/70 border-orange-500/20 hover:bg-orange-500/5 hover:text-orange-600"; break;
                        case 'USDA': activeClass = "bg-blue-500 text-white border-blue-600 shadow-sm shadow-blue-500/20"; inactiveClass = "text-blue-600/70 border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-600"; break;
                        case 'IBGE': activeClass = "bg-violet-500 text-white border-violet-600 shadow-sm shadow-violet-500/20"; inactiveClass = "text-violet-600/70 border-violet-500/5 hover:text-violet-600"; break;
                      }

                      return (
                        <button
                          key={src}
                          onClick={() => setSourceFilter(isActive ? null : src)}
                          className={cn("text-[10px] px-3 py-1.5 rounded-lg border transition-all uppercase tracking-widest", isActive ? activeClass : inactiveClass)}
                        >
                          {src}
                        </button>
                      )
                    })}
                  </div>

                  {/* Barra de busca de alimentos */}
                  <div className="relative mb-4" ref={searchContainerRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar alimentos por nome... (ex: frango, arroz, ovo)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      className="pl-10 h-10 text-sm bg-muted/30 border-border/20 focus:bg-background focus:border-primary/40 rounded-xl transition-all shadow-inner"
                    />

                    {/* Resultados da busca */}
                    {isSearchFocused && searchQuery.length > 1 && (
                      <Card className="absolute z-50 w-full mt-2 p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] max-h-[300px] overflow-y-auto">
                        {isSearching ? (
                          <div className="flex flex-col items-center justify-center p-6 gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Buscando...</span>
                          </div>
                        ) : searchResults?.results?.length ? (
                          <div className="space-y-1">
                            {searchResults?.results?.map((food: Food) => (
                              <div
                                key={`${food.source}-${food.id}`}
                                className="w-full px-3 py-2.5 text-left hover:bg-primary/10 flex items-center justify-between text-sm group transition-all rounded-lg border border-transparent hover:border-primary/20 hover:shadow-sm cursor-pointer"
                                onClick={() => {
                                  addFoodToCurrentPreset(food);
                                  setSearchQuery('');
                                  setIsSearchFocused(false);
                                }}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs border">
                                    {food.source}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-foreground truncate">{food.nome}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-tight flex items-center gap-2 mt-0.5">
                                      <span>{food.grupo}</span>
                                      <span className="w-1 h-1 rounded-full bg-border" />
                                      <span className="text-foreground/80">{Math.round(food.energia_kcal)} kcal/100g</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                                  <Plus className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center">
                              <Search className="w-5 h-5 text-muted-foreground/20" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-foreground">Nenhum alimento encontrado</p>
                              <p className="text-xs text-muted-foreground max-w-[200px] text-center">Tente buscar por termos mais genéricos ou verifique a ortografia.</p>
                            </div>
                          </div>
                        )}
                      </Card>
                    )}
                  </div>

                  {/* Lista de alimentos selecionados */}
                  <div className="mt-4">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Alimentos Adicionados</h5>
                    {((isCreating && newPreset.foods.length > 0) || (editingPreset && editingPreset!.foods.length > 0)) ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {(isCreating ? newPreset.foods : editingPreset!.foods).map((food, index) => (
                          <div key={food.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                                {food.food_name.toLowerCase().includes('ovo') || food.food_name.toLowerCase().includes('carne') ? '🍗' : '🍽️'}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{food.food_name}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFoodFromCurrentPreset(food.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground/60 text-sm">
                        Nenhum alimento adicionado ao preset
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingPreset(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePreset} className="gap-2">
                    <Save className="w-4 h-4" />
                    Salvar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de presets */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-normal text-foreground">
            Presets ({filteredPresets.length} {filteredPresets.length === 1 ? 'encontrado' : 'encontrados'})
          </h3>
        </div>

        {filteredPresets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-muted/30 rounded-full mb-4">
              <UtensilsCrossed className="w-10 h-10 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Nenhum preset encontrado</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Crie um novo preset usando o botão "Novo Preset" ou ajuste os filtros de busca
            </p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid'
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
              : "grid-cols-1"
          )}>
            {filteredPresets.map((preset) => {
              const IconComponent = getMealTypeIcon(preset.meal_type);
              return (
                <Card
                  key={preset.id}
                  className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col"
                >
                  <div className="flex flex-col h-full">
                    {/* Cabeçalho do preset */}
                    <div className="p-4 bg-muted/10 border-b border-border/10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center shadow-sm">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-foreground truncate">
                              {preset.name}
                              <span className="text-muted-foreground/40 mx-1.5 font-normal">-</span>
                              <span className={`font-medium ${preset.diet_type === 'low_carb' ? 'text-amber-500' :
                                preset.diet_type === 'cetogenica' ? 'text-purple-500' :
                                  preset.diet_type === 'hiperproteica' ? 'text-rose-500' :
                                    preset.diet_type === 'high_carb' ? 'text-blue-500' :
                                      (preset.diet_type === 'vegetariana' || preset.diet_type === 'vegana') ? 'text-emerald-500' :
                                        preset.diet_type === 'normocalorica' ? 'text-sky-500' :
                                          'text-primary'
                                }`}>
                                {getDietTypeLabel(preset.diet_type)}
                              </span>
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPreset(preset)}
                            title="Editar preset"
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePreset(preset.id)}
                            title="Excluir preset"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex-1 p-3 overflow-y-auto">
                      {/* Descrição do preset */}
                      {preset.description && (
                        <div className="mb-4 pb-3 border-b border-border/10">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {preset.description}
                          </p>
                        </div>
                      )}

                      {/* Informações nutricionais principais */}
                      <div className="mb-4 pb-3 border-b border-border/10">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          <div className="flex items-center justify-center p-1.5 bg-zinc-500/5 rounded-md border border-zinc-500/10">
                            <div className="text-sm font-bold text-zinc-600">
                              {preset.total_calories} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">kcal</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center p-1.5 bg-emerald-500/5 rounded-md border border-emerald-500/10">
                            <div className="text-sm font-bold text-emerald-600">
                              {preset.total_protein} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">g PTN</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center p-1.5 bg-blue-500/5 rounded-md border border-blue-500/10">
                            <div className="text-sm font-bold text-blue-600">
                              {preset.total_carbs} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">g CHO</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center p-1.5 bg-orange-500/5 rounded-md border border-orange-500/10">
                            <div className="text-sm font-bold text-orange-600">
                              {preset.total_fats} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">g FAT</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lista de alimentos do preset */}
                      {preset.foods && preset.foods.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Alimentos</h5>
                          <div className="space-y-1 pr-1">
                            {preset.foods.map((food, index) => (
                              <PresetFoodItem key={index} food={food} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rodapé com status e ações */}
                    <div className="p-3 border-t border-border/20 bg-muted/5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={preset.is_active ? "default" : "outline"}
                            className="text-xs px-2.5 py-1 font-medium"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${preset.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            {preset.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>

                        <div className="flex gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await useDietEditorStore.getState().setPresetAsDefault(preset.id, preset.meal_type, preset.diet_type);
                                await useDietEditorStore.getState().loadDefaultPresets();
                                alert(`Preset "${preset.name}" definido como padrão!`);
                              } catch (error) {
                                console.error('Erro ao definir padrão:', error);
                              }
                            }}
                            className="gap-1.5 px-2.5 py-1 text-xs h-8"
                          >
                            <Star className="w-3.5 h-3.5" />
                            Padrão
                          </Button>
                        </div>
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
  );
}