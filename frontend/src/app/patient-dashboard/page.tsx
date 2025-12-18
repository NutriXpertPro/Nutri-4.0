'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, TrendingUp, TrendingDown, Scale, Heart, Activity, Award, Flame, Zap, Leaf } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';

// Importa componentes do MVP blocks
import { DashboardCard } from '@/components/mvpblocks/dashboard-card';
import { MetricCard } from '@/components/mvpblocks/metric-card';
import { ProgressChart } from '@/components/mvpblocks/progress-chart';

interface PatientProfile {
  id: number;
  name: string;
  goal: string;
  photo?: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  nutritionist_name: string;
}

interface Diet {
  id: number;
  name: string;
  start_date: string;
}

interface EvolutionData {
  date: string;
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
  bmi?: number;
}

interface ProgressMetrics {
  weight_change: number;
  body_fat_change: number;
  adherence_rate: number;
}

interface PatientDashboardData {
  patient_profile: PatientProfile;
  next_appointment?: Appointment;
  current_diet?: Diet;
  evolution_data: EvolutionData[];
  progress_metrics: ProgressMetrics;
}

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Em uma implementação real, chamaríamos a API
        // const response = await api.get('/dashboard/patient/');
        
        // Dados mock para demonstração
        setDashboardData({
          patient_profile: {
            id: 1,
            name: 'Maria Silva',
            goal: 'Perda de peso saudável',
            photo: undefined
          },
          next_appointment: {
            id: 1,
            date: '15/12/2025',
            time: '10:30',
            nutritionist_name: 'Dr. João Costa'
          },
          current_diet: {
            id: 1,
            name: 'Plano Low Carb 1800kcal',
            start_date: '01/11/2025'
          },
          evolution_data: [
            { date: '01/11', weight: 75.2, body_fat: 28.4, muscle_mass: 35.6, bmi: 26.8 },
            { date: '08/11', weight: 74.1, body_fat: 27.9, muscle_mass: 35.8, bmi: 26.4 },
            { date: '15/11', weight: 73.5, body_fat: 27.2, muscle_mass: 36.1, bmi: 26.2 },
            { date: '22/11', weight: 72.8, body_fat: 26.8, muscle_mass: 36.3, bmi: 25.9 },
            { date: '29/11', weight: 72.1, body_fat: 26.3, muscle_mass: 36.5, bmi: 25.7 },
            { date: '06/12', weight: 71.5, body_fat: 25.9, muscle_mass: 36.7, bmi: 25.5 },
          ],
          progress_metrics: {
            weight_change: -3.7,
            body_fat_change: -2.5,
            adherence_rate: 87
          }
        });
      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu progresso...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-destructive text-xl mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const { patient_profile, next_appointment, current_diet, evolution_data, progress_metrics } = dashboardData;

  // Formatar dados para o gráfico de evolução
  const chartData = evolution_data.map(item => ({
    ...item,
    date: item.date
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header animado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Dashboard de Progresso
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sua jornada de transformação e bem-estar em um só lugar
          </p>
        </motion.div>

        {/* Cards principais com animação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Perfil do paciente com badge de conquista */}
          <DashboardCard 
            title="Seu Progresso" 
            description={`Olá, ${patient_profile.name}`}
            icon={<Target className="h-6 w-6" />}
            gradient="from-teal-500 to-blue-600"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{patient_profile.goal}</span>
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-amber-700">
                <Award className="h-3 w-3 mr-1" />
                Meta
              </Badge>
            </div>
          </DashboardCard>

          {/* Próxima consulta com animação */}
          <DashboardCard 
            title="Próxima Consulta" 
            description="Seu próximo encontro"
            icon={<Calendar className="h-6 w-6" />}
            gradient="from-purple-500 to-pink-600"
          >
            {next_appointment ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{next_appointment.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{next_appointment.time}</span>
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {next_appointment.nutritionist_name}
                </Badge>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Nenhuma consulta agendada</p>
            )}
          </DashboardCard>

          {/* Plano alimentar com adesão */}
          <DashboardCard 
            title="Plano Atual" 
            description="Seu plano alimentar"
            icon={<Leaf className="h-6 w-6" />}
            gradient="from-green-500 to-emerald-600"
          >
            {current_diet ? (
              <>
                <h3 className="font-semibold truncate">{current_diet.name}</h3>
                <p className="text-xs text-gray-500">Desde {current_diet.start_date}</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Adesão</span>
                    <span>{progress_metrics.adherence_rate}%</span>
                  </div>
                  <Progress value={progress_metrics.adherence_rate} className="h-2" />
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum plano ativo</p>
            )}
          </DashboardCard>

          {/* Progresso geral com animação */}
          <DashboardCard 
            title="Seu Progresso" 
            description="Métricas principais"
            icon={<Activity className="h-6 w-6" />}
            gradient="from-amber-500 to-orange-600"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Peso</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {progress_metrics.weight_change > 0 ? '+' : ''}{progress_metrics.weight_change}kg
                  </span>
                  {progress_metrics.weight_change < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Gordura</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {progress_metrics.body_fat_change > 0 ? '+' : ''}{progress_metrics.body_fat_change}%
                  </span>
                  {progress_metrics.body_fat_change < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Energia</span>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Alta</span>
                </div>
              </div>
            </div>
          </DashboardCard>
        </motion.div>

        {/* Gráfico de evolução com animação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Evolução ao Longo do Tempo</h2>
            <Badge className="bg-gradient-to-r from-teal-500 to-blue-500">Histórico</Badge>
          </div>
          
          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBodyFat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px',
                      border: '1px solid #eee'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                    name="Peso (kg)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="body_fat" 
                    stroke="#00C49F" 
                    fillOpacity={1} 
                    fill="url(#colorBodyFat)" 
                    name="Gordura (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhum dado de evolução disponível
            </div>
          )}
        </motion.div>

        {/* Cards métricas adicionais com animação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <MetricCard 
            title="Índice de Adesão"
            value={`${progress_metrics.adherence_rate}%`}
            description="Consistência com sua dieta"
            icon={<Flame className="h-8 w-8" />}
            color="text-orange-500"
            trend={progress_metrics.adherence_rate > 80 ? 'up' : 'down'}
          />
          
          <MetricCard 
            title="Meta de Peso"
            value={progress_metrics.weight_change < 0 ? `${Math.abs(progress_metrics.weight_change)}kg` : `+${progress_metrics.weight_change}kg`}
            description="Diferença desde o início"
            icon={<Scale className="h-8 w-8" />}
            color="text-teal-500"
            trend={progress_metrics.weight_change < 0 ? 'down' : 'up'}
          />
          
          <MetricCard 
            title="Frequência Cardíaca"
            value="68 bpm"
            description="Média durante atividades"
            icon={<Heart className="h-8 w-8" />}
            color="text-red-500"
            trend="up"
          />
        </motion.div>

        {/* Motivação final com animação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-2">Parabéns por seu progresso!</h2>
          <p className="mb-4 max-w-2xl mx-auto">
            Cada pequeno passo conta na sua jornada de transformação. Continue assim!
          </p>
          <Button className="bg-white text-teal-600 hover:bg-gray-100">
            Registrar Diário
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDashboard;