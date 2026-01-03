import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Ruler,
  Droplets,
  Target,
  FileText,
  User,
  Upload,
  TrendingUp,
  HeartPulse,
  Scale,
  ArrowLeft
} from "lucide-react"
import { Patient } from "@/services/evaluation-service"
import { AnthropometricTemplateSelector } from "@/components/evaluations/AnthropometricTemplateSelector"

interface AnthropometricTemplate {
  id: string
  name: string
  description: string
  type: 'skinfold' | 'anthropometry' | 'bioimpedance' | 'comprehensive'
  fields: string[]
  isDefault: boolean
  createdAt: string
}

interface EvaluationTypeSelectorProps {
  patient: Patient
  onTypeSelect: (type: 'evaluation' | 'skinfold' | 'anthropometry' | 'bioimpedance' | 'external' | 'template') => void
  onBack?: () => void
  onTemplateSelect?: (template: AnthropometricTemplate) => void
}

export function EvaluationTypeSelector({ patient, onTypeSelect, onBack, onTemplateSelect }: EvaluationTypeSelectorProps) {
  const [showTemplateSelector, setShowTemplateSelector] = React.useState(false)

  const evaluationTypes = [
    {
      id: 'evaluation',
      title: 'Avaliação Completa',
      description: 'Registro de medidas antropométricas e bioimpedância',
      icon: Ruler,
      color: 'text-violet-500',
      badge: 'Padrão'
    },
    {
      id: 'skinfold',
      title: 'Dobra Cutânea',
      description: 'Medidas com adipômetro nos principais pontos',
      icon: Target,
      color: 'text-emerald-500',
      badge: 'Especializado'
    },
    {
      id: 'anthropometry',
      title: 'Antropometria',
      description: 'Medidas corporais com fita métrica',
      icon: Scale,
      color: 'text-amber-500',
      badge: 'Completo'
    },
    {
      id: 'bioimpedance',
      title: 'Bioimpedância',
      description: 'Análise de composição corporal',
      icon: HeartPulse,
      color: 'text-rose-500',
      badge: 'Técnico'
    },
    {
      id: 'external',
      title: 'Upload Externo',
      description: 'Exames de terceiros ou laboratórios',
      icon: Upload,
      color: 'text-blue-500',
      badge: 'Integração'
    },
    {
      id: 'template',
      title: 'Ficha Personalizada',
      description: 'Modelos pré-definidos ou personalizados',
      icon: FileText,
      color: 'text-violet-500',
      badge: 'Modelo'
    }
  ]

  if (showTemplateSelector) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setShowTemplateSelector(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Modelos de Ficha para {patient.name}</h1>
            <p className="text-muted-foreground">{patient.email}</p>
          </div>
        </div>

        <AnthropometricTemplateSelector
          templates={[]}
          onSelect={(template) => {
            if (onTemplateSelect) {
              onTemplateSelect(template)
            }
          }}
          onCustomForm={() => onTypeSelect('evaluation')}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">Nova Avaliação para {patient.name}</h1>
          <p className="text-muted-foreground">{patient.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evaluationTypes.map((type) => {
          const IconComponent = type.icon
          return (
            <Card
              key={type.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                if (type.id === 'template') {
                  setShowTemplateSelector(true)
                } else {
                  onTypeSelect(type.id as any)
                }
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconComponent className={`h-5 w-5 ${type.color}`} />
                    {type.title}
                  </CardTitle>
                  <Badge variant="outline">{type.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{type.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}