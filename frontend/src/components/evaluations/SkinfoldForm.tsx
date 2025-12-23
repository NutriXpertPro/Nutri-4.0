import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Ruler, 
  Droplets, 
  Flame, 
  User, 
  Target,
  Eye,
  Edit3,
  Check,
  XCircle,
  Plus,
  Trash2,
  Loader2
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { evaluationService, CreateEvaluationDTO } from "@/services/evaluation-service"
import { useQueryClient } from "@tanstack/react-query"

interface SkinfoldFormProps {
  patientId: number
  onBack?: () => void
}

// Tipos para as dobras cutâneas
interface SkinfoldMeasurements {
  tricipital: number | null
  subscapular: number | null
  bicipital: number | null
  suprailiac: number | null
  abdominal: number | null
  axilarMedia: number | null
  toracica: number | null
  peitoral: number | null
  midaxilar: number | null
  suprasselar: number | null
}

export function SkinfoldForm({ patientId, onBack }: SkinfoldFormProps) {
  const [measurements, setMeasurements] = React.useState<SkinfoldMeasurements>({
    tricipital: null,
    subscapular: null,
    bicipital: null,
    suprailiac: null,
    abdominal: null,
    axilarMedia: null,
    toracica: null,
    peitoral: null,
    midaxilar: null,
    suprasselar: null
  })
  
  const [isLoading, setIsLoading] = React.useState(false)
  const queryClient = useQueryClient()

  const handleInputChange = (field: keyof SkinfoldMeasurements, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    setMeasurements(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Preparar os dados para envio
      const evaluationData: CreateEvaluationDTO = {
        patient: patientId,
        date: new Date().toISOString().split('T')[0],
        method: 'ADIPOMETRO',
        body_measurements: {
          tricipital: measurements.tricipital,
          subscapular: measurements.subscapular,
          bicipital: measurements.bicipital,
          suprailiac: measurements.suprailiac,
          abdominal: measurements.abdominal,
          axilarMedia: measurements.axilarMedia,
          toracica: measurements.toracica,
          peitoral: measurements.peitoral,
          midaxilar: measurements.midaxilar,
          suprasselar: measurements.suprasselar
        }
      }

      // Calcular massa gorda e magra se todas as medidas estiverem preenchidas
      const allMeasurements = Object.values(measurements).filter(v => v !== null)
      if (allMeasurements.length === Object.keys(measurements).length) {
        // Fórmula de Jackson-Pollock para homens (exemplo)
        // Em um sistema real, você usaria fórmulas específicas com base no sexo e idade
        const sum7Points = (
          (measurements.tricipital || 0) +
          (measurements.subscapular || 0) +
          (measurements.bicipital || 0) +
          (measurements.suprailiac || 0) +
          (measurements.abdominal || 0) +
          (measurements.axilarMedia || 0) +
          (measurements.toracica || 0)
        )
        
        // Fórmula de densidade corporal (exemplo)
        const density = 1.112 - (0.00043499 * sum7Points) + (0.00000055 * sum7Points * sum7Points) - (0.00028826 * 30) // 30 = idade fictícia
        const bodyFatPercentage = (495 / density) - 450
        
        if (!isNaN(bodyFatPercentage) && isFinite(bodyFatPercentage)) {
          evaluationData.body_fat = parseFloat(bodyFatPercentage.toFixed(1))
        }
      }

      await evaluationService.create(evaluationData)
      
      toast({
        title: "Avaliação registrada",
        description: "Medidas de dobras cutâneas registradas com sucesso.",
      })

      // Atualizar as consultas
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
      
      if (onBack) onBack()
      
    } catch (error) {
      console.error("Erro ao registrar avaliação:", error)
      toast({
        title: "Erro",
        description: "Falha ao registrar a avaliação.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ficha de Dobra Cutânea</h1>
          <p className="text-muted-foreground">Medidas com adipômetro</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Medidas de Dobra Cutânea (mm)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dobras principais */}
            <div className="space-y-4">
              <h3 className="font-medium text-center bg-muted p-2 rounded-md">Dobras Principais</h3>
              
              <div className="space-y-2">
                <Label htmlFor="tricipital">Tricipital</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tricipital"
                    type="number"
                    step="0.1"
                    value={measurements.tricipital ?? ''}
                    onChange={(e) => handleInputChange('tricipital', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscapular">Subescapular</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subscapular"
                    type="number"
                    step="0.1"
                    value={measurements.subscapular ?? ''}
                    onChange={(e) => handleInputChange('subscapular', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bicipital">Bicipital</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bicipital"
                    type="number"
                    step="0.1"
                    value={measurements.bicipital ?? ''}
                    onChange={(e) => handleInputChange('bicipital', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
            </div>

            {/* Dobras centrais */}
            <div className="space-y-4">
              <h3 className="font-medium text-center bg-muted p-2 rounded-md">Dobras Centrais</h3>
              
              <div className="space-y-2">
                <Label htmlFor="suprailiac">Suprailíaca</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="suprailiac"
                    type="number"
                    step="0.1"
                    value={measurements.suprailiac ?? ''}
                    onChange={(e) => handleInputChange('suprailiac', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="abdominal">Abdominal</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="abdominal"
                    type="number"
                    step="0.1"
                    value={measurements.abdominal ?? ''}
                    onChange={(e) => handleInputChange('abdominal', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="axilarMedia">Axilar Média</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="axilarMedia"
                    type="number"
                    step="0.1"
                    value={measurements.axilarMedia ?? ''}
                    onChange={(e) => handleInputChange('axilarMedia', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
            </div>

            {/* Dobras secundárias */}
            <div className="space-y-4">
              <h3 className="font-medium text-center bg-muted p-2 rounded-md">Dobras Secundárias</h3>
              
              <div className="space-y-2">
                <Label htmlFor="toracica">Torácica</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="toracica"
                    type="number"
                    step="0.1"
                    value={measurements.toracica ?? ''}
                    onChange={(e) => handleInputChange('toracica', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="peitoral">Peitoral</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="peitoral"
                    type="number"
                    step="0.1"
                    value={measurements.peitoral ?? ''}
                    onChange={(e) => handleInputChange('peitoral', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="midaxilar">Midaxilar</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="midaxilar"
                    type="number"
                    step="0.1"
                    value={measurements.midaxilar ?? ''}
                    onChange={(e) => handleInputChange('midaxilar', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="suprasselar">Suprasselar</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="suprasselar"
                    type="number"
                    step="0.1"
                    value={measurements.suprasselar ?? ''}
                    onChange={(e) => handleInputChange('suprasselar', e.target.value)}
                    placeholder="0.0"
                  />
                  <Badge variant="outline">mm</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Avaliação
          </Button>
        </div>
      </form>
    </div>
  )
}