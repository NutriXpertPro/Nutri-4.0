'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Play, Bot } from 'lucide-react';
import api from '@/services/api';

interface AutomationTemplate {
  id?: string;
  name: string;
  trigger: 'appointment_confirmation' | 'appointment_reminder' | 'birthday' | 'follow_up';
  content: string;
  is_active: boolean;
  delay_hours?: number;
}

const AutomationSettings = () => {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<AutomationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar templates do backend
  useEffect(() => {
    let isMounted = true; // Flag para evitar atualizações em componentes desmontados

    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await api.get('/automation/templates/');

        if (isMounted) { // Verificar se o componente ainda está montado
          setTemplates(response.data);
        }
      } catch (error) {
        if (isMounted) { // Verificar se o componente ainda está montado
          console.error('Erro ao carregar templates de automação:', error);
          // Usar dados mockados em caso de erro
          setTemplates([
            {
              id: '1',
              name: 'Confirmação de Agendamento',
              trigger: 'appointment_confirmation',
              content: 'Olá {patient_name}, sua consulta com {nutritionist_name} foi confirmada para {appointment_date} às {appointment_time}.',
              is_active: true,
            }
          ]);
        }
      } finally {
        if (isMounted) { // Verificar se o componente ainda está montado
          setLoading(false);
        }
      }
    };

    fetchTemplates();

    // Cleanup function para definir isMounted como false quando o componente for desmontado
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddTemplate = () => {
    setCurrentTemplate({
      name: '',
      trigger: 'appointment_confirmation',
      content: '',
      is_active: true,
    });
    setIsEditing(true);
  };

  const handleEditTemplate = (template: AutomationTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!id) return;

    try {
      await api.delete(`/automation/templates/${id}/`);
      setTemplates(templates.filter(template => template.id !== id));
    } catch (error) {
      console.error('Erro ao deletar template:', error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate) return;

    try {
      if (currentTemplate.id) {
        // Atualizar template existente
        const response = await api.patch(`/automation/templates/${currentTemplate.id}/`, currentTemplate);
        setTemplates(templates.map(t => t.id === currentTemplate.id ? response.data : t));
      } else {
        // Criar novo template
        const response = await api.post('/automation/templates/', currentTemplate);
        setTemplates([...templates, response.data]);
      }
      setIsEditing(false);
      setCurrentTemplate(null);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  };

  const handleTriggerChange = (value: AutomationTemplate['trigger']) => {
    if (currentTemplate) {
      setCurrentTemplate({
        ...currentTemplate,
        trigger: value
      });
    }
  };

  const getTriggerLabel = (trigger: AutomationTemplate['trigger']) => {
    switch (trigger) {
      case 'appointment_confirmation':
        return 'Confirmação de Agendamento';
      case 'appointment_reminder':
        return 'Lembrete 24h';
      case 'birthday':
        return 'Aniversário';
      case 'follow_up':
        return 'Follow-up pós-consulta';
      default:
        return trigger;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Automação de Mensagens
        </CardTitle>
        <CardDescription>
          Configure mensagens automáticas que serão enviadas em eventos específicos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAddTemplate} className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Template
        </Button>

        {isEditing ? (
          <div className="space-y-4 p-4 border rounded-lg mb-4 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="template-name" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Nome do Template
                </label>
                <Input
                  id="template-name"
                  value={currentTemplate?.name || ''}
                  onChange={(e) => setCurrentTemplate(currentTemplate ? { ...currentTemplate, name: e.target.value } : null)}
                  placeholder="Ex: Confirmação de Consulta"
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="template-trigger" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Gatilho
                </label>
                <Select
                  value={currentTemplate?.trigger}
                  onValueChange={(value: AutomationTemplate['trigger']) => handleTriggerChange(value)}
                >
                  <SelectTrigger id="template-trigger" className="mt-1">
                    <SelectValue placeholder="Selecione um gatilho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment_confirmation">Confirmação de Agendamento</SelectItem>
                    <SelectItem value="appointment_reminder">Lembrete 24h</SelectItem>
                    <SelectItem value="birthday">Aniversário</SelectItem>
                    <SelectItem value="follow_up">Follow-up pós-consulta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="template-content" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Conteúdo da Mensagem
              </label>
              <Textarea
                id="template-content"
                value={currentTemplate?.content || ''}
                onChange={(e) => setCurrentTemplate(currentTemplate ? { ...currentTemplate, content: e.target.value } : null)}
                placeholder="Digite a mensagem automática (use variáveis como {patient_name}, {appointment_date}, etc.)"
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use variáveis como {'{patient_name}'}, {'{nutritionist_name}'}, {'{appointment_date}'}, {'{appointment_time}'} para personalizar a mensagem
              </p>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="template-active"
                checked={currentTemplate?.is_active}
                onCheckedChange={(checked) => setCurrentTemplate(currentTemplate ? { ...currentTemplate, is_active: checked } : null)}
              />
              <label htmlFor="template-active" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Ativo
              </label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentTemplate(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id || Math.random()} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-normal">{template.name}</h3>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gatilho: {getTriggerLabel(template.trigger)}
                  </p>
                  <p className="text-sm">{template.content.substring(0, 100)}{template.content.length > 100 ? '...' : ''}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => template.id ? handleDeleteTemplate(template.id) : null}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum template de automação configurado</p>
              <p className="text-sm">Adicione um template para começar a automatizar suas mensagens</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationSettings;