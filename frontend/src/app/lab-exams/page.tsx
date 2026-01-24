'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Upload,
  Download,
  Search,
  Plus,
  FileText,
  Calendar,
  User,
  Trash2,
  HeartPulse,
  TestTube
} from 'lucide-react';
import api from '@/services/api';

interface LabExam {
  id: string;
  patient_id: string;
  patient_name: string;
  exam_type: string;
  exam_name: string;
  date: string; // ISO date string
  file_url?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'overdue';
}

const LabExamsPage: React.FC = () => {
  const [exams, setExams] = useState<LabExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExam, setNewExam] = useState({
    patient_id: '',
    exam_name: '',
    exam_type: '',
    date: '',
    notes: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();

  // Carregar exames do backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await api.get('lab_exams/');

        // Formatar os dados para o modelo local
        const formattedExams = response.data.map((exam: any) => ({
          id: exam.id.toString(),
          patient_id: exam.patient?.id?.toString() || exam.patient_id?.toString(),
          patient_name: exam.patient?.user?.name || exam.patient_name || 'Paciente Desconhecido',
          exam_type: exam.exam_type || 'Exame',
          exam_name: exam.name || exam.exam_name || 'Exame Laboratorial',
          date: exam.date || exam.exam_date,
          file_url: exam.file || exam.file_url,
          notes: exam.notes,
          status: exam.status as LabExam['status'] || 'pending',
        }));

        setExams(formattedExams);
      } catch (error) {
        console.error('Erro ao carregar exames laboratoriais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();

    // Configurar polling para atualizações (a cada 60 segundos)
    const interval = setInterval(fetchExams, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fazer upload de novo exame
  const handleUploadExam = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('patient', newExam.patient_id);
      formData.append('name', newExam.exam_name);
      formData.append('exam_type', newExam.exam_type);
      formData.append('date', newExam.date);
      formData.append('notes', newExam.notes);

      if (file) {
        formData.append('file', file);
      }

      const response = await api.post('lab_exams/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Adicionar o novo exame à lista
      const formattedExam: LabExam = {
        id: response.data.id.toString(),
        patient_id: response.data.patient?.id?.toString() || newExam.patient_id,
        patient_name: response.data.patient?.user?.name || 'Paciente Desconhecido',
        exam_type: response.data.exam_type || newExam.exam_type,
        exam_name: response.data.name || newExam.exam_name,
        date: response.data.date || newExam.date,
        file_url: response.data.file,
        notes: response.data.notes || newExam.notes,
        status: response.data.status as LabExam['status'] || 'pending',
      };

      setExams([formattedExam, ...exams]);

      // Resetar o formulário
      setNewExam({
        patient_id: '',
        exam_name: '',
        exam_type: '',
        date: '',
        notes: ''
      });
      setFile(null);
    } catch (error) {
      console.error('Erro ao fazer upload do exame:', error);
    }
  };

  // Excluir um exame
  const handleDeleteExam = async (id: string) => {
    try {
      await api.delete(`lab_exams/${id}/`);
      setExams(exams.filter(exam => exam.id !== id));
    } catch (error) {
      console.error('Erro ao excluir exame:', error);
    }
  };

  // Filtrar exames com base na busca
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.patient_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Obter status badge
  const getStatusBadge = (status: LabExam['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Concluído</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  // Download de exame
  const handleDownloadExam = (exam: LabExam) => {
    if (exam.file_url) {
      window.open(exam.file_url, '_blank');
    } else {
      alert('Nenhum arquivo disponível para download');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando exames laboratoriais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h1 capitalize font-normal text-foreground">Exames Laboratoriais</h1>
            <p className="text-subtitle mt-1 flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-purple-500" />
              {exams.length} {exams.length === 1 ? 'exame' : 'exames'} registrados
            </p>
          </div>
        </div>

        {/* Filtros e busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Buscar exames ou pacientes
                </label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por nome do exame ou paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de exames */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Exames Registrados
            </CardTitle>
            <CardDescription>
              Lista de exames laboratoriais dos seus pacientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exame e Paciente</TableHead>
                  <TableHead>Data e Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum exame laboratorial encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">{exam.exam_name}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <User className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-muted-foreground">{exam.patient_name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">{new Date(exam.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <TestTube className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-muted-foreground">{exam.exam_type}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(exam.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadExam(exam)}
                            disabled={!exam.file_url}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Adicionar novo exame */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-500" />
              Adicionar Novo Exame
            </CardTitle>
            <CardDescription>
              Registre um novo exame laboratorial para um paciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadExam} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="patient-id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    ID do Paciente
                  </label>
                  <Input
                    id="patient-id"
                    value={newExam.patient_id}
                    onChange={(e) => setNewExam({ ...newExam, patient_id: e.target.value })}
                    placeholder="Digite o ID do paciente"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="exam-type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Tipo de Exame
                  </label>
                  <Input
                    id="exam-type"
                    value={newExam.exam_type}
                    onChange={(e) => setNewExam({ ...newExam, exam_type: e.target.value })}
                    placeholder="Ex: Sangue, Urina, Fezes"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="exam-file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Arquivo do Exame (opcional)
                  </label>
                  <Input
                    id="exam-file"
                    type="file"
                    className="mt-1"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos suportados: PDF, JPG, PNG (máx. 10MB)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="exam-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Nome do Exame
                  </label>
                  <Input
                    id="exam-name"
                    value={newExam.exam_name}
                    onChange={(e) => setNewExam({ ...newExam, exam_name: e.target.value })}
                    placeholder="Ex: Hemograma completo, Glicemia, Colesterol"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="exam-date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Data do Exame
                  </label>
                  <Input
                    id="exam-date"
                    type="date"
                    value={newExam.date}
                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="exam-notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Notas/Comentários
                  </label>
                  <Input
                    id="exam-notes"
                    value={newExam.notes}
                    onChange={(e) => setNewExam({ ...newExam, notes: e.target.value })}
                    placeholder="Observações sobre o exame"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit">
                  <Upload className="h-4 w-4 mr-2 text-green-500" />
                  Registrar Exame
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabExamsPage;