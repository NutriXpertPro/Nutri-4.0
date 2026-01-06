'use client';

import { motion, AnimatePresence } from 'framer-motion';
import PatientHeader from '@/components/patient-header';
import { useState } from 'react';
import PatientNavigationMenu from '@/components/patient-navigation-menu';

interface PatientPageLayoutProps {
  children: React.ReactNode;
  title: string;
}

const PatientPageLayout = ({ children, title }: PatientPageLayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      {/* Menu de Navegação */}
      <PatientNavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Cabeçalho */}
      <PatientHeader
        title={title}
        showMenu={true}
        onMenuToggle={() => setIsMenuOpen(true)}
      />

      {/* Main Content */}
      <div className="pt-16 pb-24 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientPageLayout;