'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  User,
  Users,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommunityEntry {
  id: number;
  patient_name: string;
  patient_photo?: string;
  entry_type: 'photo' | 'text' | 'meal' | 'exercise' | 'weight' | 'note';
  title: string;
  content: string;
  photo?: string;
  timestamp: string;
  likes_count: number;
  comments_count: number;
  liked: boolean;
  privacy: 'public' | 'network' | 'private';
}

const CommunityFeed = () => {
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [feedType, setFeedType] = useState<'all' | 'network' | 'friends'>('network');
  const [loading, setLoading] = useState(true);

  // Carregar entradas do feed
  useEffect(() => {
    // Simular carregamento de entradas
    setTimeout(() => {
      setEntries([
        {
          id: 1,
          patient_name: 'Ana Silva',
          entry_type: 'photo',
          title: 'Primeira semana!',
          content: 'Resultado da primeira semana seguindo o plano. Muito feliz com o início da jornada!',
          photo: 'https://placehold.co/400x300/4f46e5/white?text=Ana+Silva',
          timestamp: '2025-12-06T09:15:00Z',
          likes_count: 24,
          comments_count: 7,
          liked: false,
          privacy: 'network'
        },
        {
          id: 2,
          patient_name: 'Carlos Mendes',
          entry_type: 'meal',
          title: 'Almoço funcional',
          content: 'Preparação semanal com ingredientes frescos e nutritivos. Obrigado pelas dicas!',
          timestamp: '2025-12-05T12:45:00Z',
          likes_count: 18,
          comments_count: 5,
          liked: true,
          privacy: 'public'
        },
        {
          id: 3,
          patient_name: 'Juliana Costa',
          entry_type: 'text',
          title: 'Energia renovada',
          content: 'Após 3 semanas no plano, me sinto mais leve e com mais disposição para as atividades diárias.',
          timestamp: '2025-12-04T18:30:00Z',
          likes_count: 32,
          comments_count: 9,
          liked: false,
          privacy: 'network'
        },
        {
          id: 4,
          patient_name: 'Roberto Almeida',
          entry_type: 'exercise',
          title: 'Primeira aula de funcional',
          content: 'Superando meus limites físicos e mentais. Cada repetição é uma vitória!',
          timestamp: '2025-12-03T17:20:00Z',
          likes_count: 15,
          comments_count: 3,
          liked: false,
          privacy: 'public'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public': return <Users className="h-4 w-4 text-blue-500" />;
      case 'network': return <User className="h-4 w-4 text-green-500" />;
      case 'private': return <Lock className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case 'public': return 'bg-blue-100 text-blue-800';
      case 'network': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando a comunidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Comunidade
          </h1>
          <p className="text-gray-600 mt-2">
            Inspire-se com a jornada dos outros membros
          </p>
        </motion.div>

        {/* Filtros de feed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex rounded-lg border p-1 bg-white/80 backdrop-blur-sm">
            <Button
              variant={feedType === 'all' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-md ${feedType === 'all' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}`}
              onClick={() => setFeedType('all')}
            >
              Todos
            </Button>
            <Button
              variant={feedType === 'network' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-md ${feedType === 'network' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}`}
              onClick={() => setFeedType('network')}
            >
              Minha Rede
            </Button>
            <Button
              variant={feedType === 'friends' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-md ${feedType === 'friends' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}`}
              onClick={() => setFeedType('friends')}
            >
              Amigos
            </Button>
          </div>
        </motion.div>

        {/* Lista de entradas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                            {entry.patient_name.charAt(0)}
                          </div>
                          <div className="absolute bottom-0 right-0">
                            {getPrivacyIcon(entry.privacy)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold">{entry.patient_name}</h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{new Date(entry.timestamp).toLocaleDateString('pt-BR')}</span>
                            <span className="mx-1">•</span>
                            <span>{new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={getPrivacyColor(entry.privacy)}>
                        {entry.privacy === 'public' && 'Público'}
                        {entry.privacy === 'network' && 'Rede'}
                        {entry.privacy === 'private' && 'Privado'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {entry.title && (
                      <h4 className="font-semibold text-lg mb-2">{entry.title}</h4>
                    )}
                    
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {entries.length === 0 && (
            <div className="text-center py-12 bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg">
              <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma atividade na comunidade</h3>
              <p className="text-gray-500">Sua rede ainda está se conectando. Volte mais tarde!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityFeed;