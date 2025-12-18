'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, 
  MessageCircle, 
  Heart, 
  Share2, 
  Plus, 
  Image as ImageIcon, 
  FileText, 
  Utensils, 
  Dumbbell,
  Weight,
  Notebook 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiaryEntry {
  id: number;
  patient_name: string;
  entry_type: 'photo' | 'text' | 'meal' | 'exercise' | 'weight' | 'note';
  title: string;
  content: string;
  photo?: string;
  timestamp: string;
  likes_count: number;
  comments_count: number;
  liked: boolean;
}

const PatientDiary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    entry_type: 'text',
    title: '',
    content: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Carregar entradas do diário
  useEffect(() => {
    // Simular carregamento de entradas
    setTimeout(() => {
      setEntries([
        {
          id: 1,
          patient_name: 'Você',
          entry_type: 'photo',
          title: 'Progresso Semanal',
          content: 'Fiz as medidas de composição corporal esta semana e estou muito feliz com o resultado!',
          photo: imagePreview || 'https://placehold.co/400x300/4f46e5/white?text=Foto+de+Progresso',
          timestamp: '2025-12-06T10:30:00Z',
          likes_count: 12,
          comments_count: 3,
          liked: false
        },
        {
          id: 2,
          patient_name: 'Você',
          entry_type: 'meal',
          title: 'Almoço Saudável',
          content: 'Hoje preparei uma refeição deliciosa com frango grelhado, quinoa e legumes no vapor. Totalmente dentro do plano!',
          timestamp: '2025-12-05T13:15:00Z',
          likes_count: 8,
          comments_count: 1,
          liked: true
        },
        {
          id: 3,
          patient_name: 'Você',
          entry_type: 'text',
          title: 'Sentimentos',
          content: 'Estou me sentindo mais leve e com mais energia. A mudança na alimentação está fazendo uma grande diferença!',
          timestamp: '2025-12-04T20:45:00Z',
          likes_count: 15,
          comments_count: 5,
          liked: false
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [imagePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleCreateEntry = () => {
    // Simular criação de nova entrada
    const newDiaryEntry: DiaryEntry = {
      id: entries.length + 1,
      patient_name: 'Você',
      entry_type: newEntry.entry_type as any,
      title: newEntry.title,
      content: newEntry.content,
      timestamp: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      liked: false
    };

    setEntries([newDiaryEntry, ...entries]);
    setNewEntry({ entry_type: 'text', title: '', content: '' });
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleLike = (id: number) => {
    setEntries(entries.map(entry => 
      entry.id === id 
        ? { 
            ...entry, 
            liked: !entry.liked, 
            likes_count: entry.liked ? entry.likes_count - 1 : entry.likes_count + 1 
          }
        : entry
    ));
  };

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return <ImageIcon className="h-5 w-5" />;
      case 'meal': return <Utensils className="h-5 w-5" />;
      case 'exercise': return <Dumbbell className="h-5 w-5" />;
      case 'weight': return <Weight className="h-5 w-5" />;
      case 'note': return <Notebook className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'photo': return 'bg-blue-100 text-blue-800';
      case 'meal': return 'bg-green-100 text-green-800';
      case 'exercise': return 'bg-purple-100 text-purple-800';
      case 'weight': return 'bg-amber-100 text-amber-800';
      case 'note': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu diário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Diário de Progresso
          </h1>
          <p className="text-gray-600 mt-2">
            Compartilhe sua jornada e acompanhe seu progresso
          </p>
        </motion.div>

        {/* Formulário para nova entrada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>Nova Entrada</CardTitle>
              <CardDescription>Registre um momento importante na sua jornada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Entrada</label>
                  <Select 
                    value={newEntry.entry_type} 
                    onValueChange={(value) => setNewEntry({...newEntry, entry_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="photo">Foto</SelectItem>
                      <SelectItem value="meal">Refeição</SelectItem>
                      <SelectItem value="exercise">Exercício</SelectItem>
                      <SelectItem value="weight">Peso</SelectItem>
                      <SelectItem value="note">Observação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Título (opcional)</label>
                  <Input
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                    placeholder="Dê um título à sua entrada..."
                  />
                </div>
              </div>

              {newEntry.entry_type === 'photo' && (
                <div>
                  <label className="text-sm font-medium">Foto</label>
                  <div className="mt-2 flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Prévia" 
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedFile(null);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Selecionar Foto
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Conteúdo</label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                  placeholder="Descreva sua experiência, sentimentos ou observações..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleCreateEntry}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                disabled={!newEntry.content.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Entrada
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de entradas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Suas Entradas</h2>
          
          <AnimatePresence>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getEntryTypeColor(entry.entry_type)}`}>
                          {getEntryTypeIcon(entry.entry_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{entry.title || 'Entrada sem título'}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.timestamp).toLocaleDateString('pt-BR')} • {entry.patient_name}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant="secondary">
                        {entry.entry_type === 'photo' && '📷 Foto'}
                        {entry.entry_type === 'meal' && '🥗 Refeição'}
                        {entry.entry_type === 'exercise' && '💪 Exercício'}
                        {entry.entry_type === 'weight' && '⚖️ Peso'}
                        {entry.entry_type === 'note' && '📝 Observação'}
                        {entry.entry_type === 'text' && '📄 Texto'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 mb-4">{entry.content}</p>
                    
                    {entry.photo && (
                      <div className="mb-4">
                        <img 
                          src={entry.photo} 
                          alt="Entrada do diário" 
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant={entry.liked ? "secondary" : "ghost"} 
                          size="sm"
                          onClick={() => handleLike(entry.id)}
                          className={entry.liked ? "text-red-500" : ""}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${entry.liked ? "fill-current" : ""}`} />
                          {entry.likes_count}
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {entry.comments_count}
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Badge variant="outline">
                        {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {entries.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                <Notebook className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma entrada ainda</h3>
              <p className="text-gray-500">Comece registrando sua primeira experiência!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDiary;