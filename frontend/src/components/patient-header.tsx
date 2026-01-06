'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Menu,
  X,
  Palette,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { usePatient } from '@/contexts/patient-context';
import { useTheme } from 'next-themes';
import { useColorTheme } from '@/contexts/color-theme-context';

interface PatientHeaderProps {
  title?: string;
  showMenu?: boolean;
  onMenuToggle?: () => void;
}

const PatientHeader = ({ title = 'Nutri Xpert Pro', showMenu = true, onMenuToggle }: PatientHeaderProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { patient } = usePatient();
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="h-8 w-8"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div>
            <h1 className="text-lg font-bold tracking-tighter flex items-center">
              <span className="mr-1 text-foreground">
                <span className="text-[1.3em]">N</span>utri
              </span>
              <span className="text-emerald-500">
                <span className="text-[1.3em]">X</span>pert
              </span>
              <span className="ml-1 text-foreground">
                <span className="text-[1.3em]">P</span>ro
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">{patient?.name || 'Paciente'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push('/patient-dashboard/notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* Botão para alternar modo claro/escuro */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Botão para alternar tema de cores */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // Ciclar entre os temas de cores disponíveis
              const themes: ('teal' | 'blue' | 'violet' | 'pink' | 'amber' | 'emerald')[] = ['teal', 'blue', 'violet', 'pink', 'amber', 'emerald'];
              const currentIndex = themes.indexOf(colorTheme as any);
              const nextIndex = (currentIndex + 1) % themes.length;
              setColorTheme(themes[nextIndex]);
            }}
          >
            <Palette className="h-5 w-5" />
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage src={patient?.avatar || user?.avatar} alt={patient?.name || user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {patient?.name?.charAt(0) || user?.name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;