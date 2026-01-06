'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  UtensilsCrossed, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Settings,
  Bell,
  User,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PatientNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const PatientNavigationMenu = ({ isOpen, onClose }: PatientNavigationMenuProps) => {
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const menuItems = [
    { 
      id: '/patient-dashboard', 
      icon: Home, 
      label: 'Início',
      badge: null
    },
    { 
      id: '/patient-dashboard/diet', 
      icon: UtensilsCrossed, 
      label: 'Dieta',
      badge: null
    },
    { 
      id: '/patient-dashboard/evolution', 
      icon: TrendingUp, 
      label: 'Evolução',
      badge: null
    },
    { 
      id: '/patient-dashboard/appointments', 
      icon: Calendar, 
      label: 'Consultas',
      badge: null
    },
    { 
      id: '/patient-dashboard/messages', 
      icon: MessageSquare, 
      label: 'Mensagens',
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    { 
      id: '/patient-dashboard/content', 
      icon: BookOpen, 
      label: 'Conteúdo',
      badge: null
    },
    { 
      id: '/patient-dashboard/settings', 
      icon: Settings, 
      label: 'Ajustes',
      badge: null
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="absolute top-0 left-0 h-full w-64 bg-background p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation(item.id)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
                {item.badge && (
                  <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default PatientNavigationMenu;