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
  Star
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDietEditorStore, MealPreset, MealPresetFood } from '@/stores/diet-editor-store';
import { Food, foodService } from '@/services/food-service';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { PresetQuantitySelector } from './PresetQuantitySelector';
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
  { id: 'pre_treino', label: 'Pré-treino', icon: Flame },
  { id: 'pos_treino', label: 'Pós-treino', icon: Pill },
  { id: 'suplemento', label: 'Suplemento', icon: Pill },
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

interface MealPresetsManagerProps {
  onApplyPreset?: (preset: MealPreset) => void;
  onBack?: () => void;
  showDefaultsTab?: boolean; // Nova prop para mostrar aba de presets padrão
}

export function MealPresetsManager({ onApplyPreset, onBack, showDefaultsTab = true }: MealPresetsManagerProps) {
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [selectedDietType, setSelectedDietType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingPreset, setEditingPreset] = useState<MealPreset | null>(null);
  const [newPreset, setNewPreset] = useState<Omit<MealPreset, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    meal_type: 'cafe_da_manha',
    diet_type: 'balanced',
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
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

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
      diet_type: selectedDietType || 'balanced',
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
    } catch (error: any) {
      console.error('Erro ao salvar preset:', error);
      const { toast } = await import('sonner');

      let errorMessage = "Verifique os dados e tente novamente.";
      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (typeof error.response.data === 'object') {
          const fieldErrors = Object.entries(error.response.data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join(' | ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error("Erro ao salvar preset", {
        description: errorMessage
      });
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

  const handlePresetSelect = (preset: MealPreset) => {
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
            <h2 className="text-base font-normal text-foreground tracking-tight">Gerenciador de Presets</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Configure seus modelos de refeição</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showDefaultsTab && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9"
              onClick={() => {
                // Aqui você pode implementar a navegação para a aba de presets padrão
                // Por enquanto, vamos apenas exibir um alerta ou mudar o estado
                alert('A funcionalidade de presets padrão será implementada aqui');
              }}
            >
              <Star className="w-4 h-4" />
              Presets Padrão
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
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
          <Button onClick={handleCreatePreset} className="gap-2 h-9">
            <Plus className="w-4 h-4" />
            Novo Preset
          </Button>
        </div>
      </div>

      {/* Conteúdo com Scroll Global */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Filtros e Busca */}
        <div className="p-4 border-b border-border/50 bg-muted/20">
          {/* Seletores por tipo de refeição e dieta */}
          <div className="mb-4">
            <div className="mb-3">
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
          <div className="p-4 sm:p-6 border-b border-border/50 bg-muted/10">
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
                    <h4 className="text-sm font-normal text-foreground mb-3">Alimentos do Preset</h4>

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
                            <div className="p-6 text-center flex flex-col items-center gap-4">
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
                      <h5 className="text-xs font-normal text-muted-foreground uppercase tracking-widest mb-2">Alimentos Adicionados</h5>
                      {((isCreating && newPreset.foods.length > 0) || (editingPreset && editingPreset.foods.length > 0)) ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {(isCreating ? newPreset.foods : editingPreset!.foods).map((food, index) => (
                            <div key={food.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                                  🥗
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">{food.food_name}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                                    <span>{food.quantity}{food.unit}</span>
                                    <span>•</span>
                                    <span>{Math.round(food.calories)} kcal</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <PresetQuantitySelector
                                  food={food}
                                  onChange={(quantity, unit) => updateFoodInCurrentPreset(food.id, { quantity, unit })}
                                />
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
        <div className="p-4 sm:p-6 min-h-0">
          <div className="max-w-7xl mx-auto">
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
                <h4 className="text-lg font-normal text-foreground mb-2">Nenhum preset encontrado</h4>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Crie um novo preset usando o botão "Novo Preset" ou ajuste os filtros de busca
                </p>
                <Button onClick={handleCreatePreset} className="gap-2">
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
                      className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col max-h-[600px]"
                    >
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center shadow-sm">
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-normal text-sm text-foreground truncate">{preset.name}</h4>
                              <div className="flex items-center gap-2 mt-1.5">                                <span className="inline-flex items-center gap-1 text-xs font-normal px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                {getMealTypeLabel(preset.meal_type)}
                              </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                  {getDietTypeLabel(preset.diet_type)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPreset(preset)}
                                title="Editar preset"
                                className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePreset(preset.id)}
                                title="Excluir preset"
                                className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {preset.description && (
                            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                              {preset.description}
                            </p>
                          )}

                          {/* Lista de alimentos do preset */}
                          {preset.foods && preset.foods.length > 0 && (
                            <div className="mt-4 border-t border-border/20 pt-3">
                              <h5 className="text-xs font-normal text-foreground uppercase tracking-widest mb-2">Alimentos</h5>
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

                          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/20">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Flame className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-normal text-foreground">{preset.total_calories}</div>
                                <div className="text-xs text-muted-foreground">kcal</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Apple className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-normal text-foreground">{preset.total_protein}g</div>
                                <div className="text-xs text-muted-foreground">prot</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Wheat className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-normal text-foreground">{preset.total_carbs}g</div>
                                <div className="text-xs text-muted-foreground">carb</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Droplets className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-normal text-foreground">{preset.total_fats}g</div>
                                <div className="text-xs text-muted-foreground">gord</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={preset.is_active ? "default" : "outline"}
                                className="text-xs px-3 py-1.5 font-normal"
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
      </div>
    </div >
  );
}