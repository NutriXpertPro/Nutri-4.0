'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';

export default function PatientLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fazer login do paciente
      const response = await fetch('http://localhost:8000/api/v1/auth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      login(data, false); // Não redirecionar automaticamente

      // Redirecionar para o dashboard do paciente V2 (oficial)
      router.push('/patient-dashboard-v2');
    } catch (err) {
      setError('Email ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col justify-between p-6 pb-12">
      {/* Indicador de atualização para debug */}
      <div className="text-center mb-4">
        <p className="text-xs text-emerald-600 font-medium bg-white/50 rounded-full px-3 py-1 inline-block">
          Login Mobile Atualizado ✓
        </p>
      </div>
      {/* Top section with logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center pt-12"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
          <div className="bg-white p-3 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded" />
          </div>
        </div>

        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold tracking-tighter flex items-center justify-center">
            <span className="mr-1 text-foreground">
              <span className="text-[1.4em]">N</span>utri
            </span>
            <span className="text-emerald-500">
              <span className="text-[1.4em]">X</span>pert
            </span>
            <span className="ml-1 text-foreground">
              <span className="text-[1.4em]">P</span>ro
            </span>
          </h1>
        </div>

        <p className="text-lg text-muted-foreground">Acesso do Paciente</p>
      </motion.div>

      {/* Form section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-sm mx-auto"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-14 text-lg px-4 py-3 rounded-xl border border-input bg-background"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <button
                  type="button"
                  className="text-sm text-emerald-600 hover:underline"
                  onClick={() => router.push('/forgot-password')}
                >
                  Esqueceu?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="h-14 text-lg px-4 py-3 rounded-xl border border-input bg-background"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </motion.div>

      {/* Bottom info section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center py-4"
      >
        <p className="text-sm text-muted-foreground">
          Não tem acesso? Fale com seu nutricionista
        </p>
      </motion.div>
    </div>
  );
}