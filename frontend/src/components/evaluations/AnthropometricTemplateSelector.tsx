import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Ruler, 
  Droplets, 
  Target, 
  HeartPulse,
  Scale,
  Plus,
  Edit3,
  Eye
} from "lucide-react"

interface AnthropometricTemplate {
  id: string
  name: string
  description: string
  type: 'skinfold' | 'anthropometry' | 'bioimpedance' | 'comprehensive'
  fields: string[]
  isDefault: boolean
  createdAt: string
}

interface AnthropometricTemplateSelectorProps {
  templates: AnthropometricTemplate[]
  onSelect: (template: AnthropometricTemplate) => void
  onCustomForm?: () => void
}

export function AnthropometricTemplateSelector({ 
  templates, 
  onSelect,
  onCustomForm
}: AnthropometricTemplateSelectorProps) {
  const defaultTemplates: AnthropometricTemplate[] = [
    {
      id: 'skinfold-standard',
      name: 'Dobras Cutâneas Padrão',
      description: 'Medidas nos 7 principais pontos com adipômetro',
      type: 'skinfold',
      fields: ['tricipital', 'subscapular', 'bicipital', 'suprailiac', 'abdominal', 'axilarMedia', 'toracica'],
      isDefault: true,
      createdAt: '2024-01-01'
    },
    {
      id: 'anthropometry-basic',
      name: 'Antropometria Básica',
      description: 'Medidas corporais essenciais com fita métrica',
      type: 'anthropometry',
      fields: ['peso', 'altura', 'cintura', 'quadril', 'braco', 'pescoco'],
      isDefault: true,
      createdAt: '2024-01-01'
    },
    {
      id: 'bioimpedance-composition',
      name: 'Bioimpedância Composição',
      description: 'Análise completa de composição corporal',
      type: 'bioimpedance',
      fields: ['peso', 'gordura', 'musculo', 'agua', 'osseo', 'imc'],
      isDefault: true,
      createdAt: '2024-01-01'
    },
    {
      id: 'comprehensive-evaluation',
      name: 'Avaliação Completa',
      description: 'Todas as medidas antropométricas e de composição',
      type: 'comprehensive',
      fields: ['peso', 'altura', 'imc', 'tricipital', 'subscapular', 'cintura', 'quadril', 'gordura', 'musculo'],
      isDefault: true,
      createdAt: '2024-01-01'
    }
  ]

  const allTemplates = [...defaultTemplates, ...templates]

  const getIconForType = (type: string) => {
    switch (type) {
      case 'skinfold': return Target
      case 'anthropometry': return Scale
      case 'bioimpedance': return HeartPulse
      case 'comprehensive': return Ruler
      default: return FileText
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Modelos de Fichas</h2>
        {onCustomForm && (
          <Button variant="outline" onClick={onCustomForm}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Modelo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTemplates.map((template) => {
          const IconComponent = getIconForType(template.type)
          return (
            <Card 
              key={template.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelect(template)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconComponent className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  {template.isDefault && (
                    <Badge variant="secondary">Padrão</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span>{template.fields.length} campos</span>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="capitalize">
                      {template.type.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {allTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum modelo de ficha encontrado.</p>
          <p className="text-sm mt-2">Crie seu primeiro modelo usando o botão acima.</p>
        </div>
      )}
    </div>
  )
}