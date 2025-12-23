'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import logo from "@/assets/logo.png";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: 'Recursos', href: '#features' },
  { name: 'Depoimentos', href: '#testimonials' },
  { name: 'Planos', href: '#pricing' },
  { name: 'Dúvidas', href: '#faq' },
];

export default function Header1() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    scrolled: {
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(13, 17, 23, 0.8)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      borderBottom: '1px solid #30363d',
    },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: 'auto' },
  };

  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
      variants={headerVariants}
      initial="initial"
      animate={isScrolled ? 'scrolled' : 'animate'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        backgroundColor: isScrolled
          ? 'rgba(13, 17, 23, 0.8)'
          : 'rgba(13, 17, 23, 0)',
        boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none',
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-8">
            <motion.div
              className="flex items-center space-x-2 pt-1"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Link
                prefetch={false}
                href="/"
                className="flex items-center gap-0.5"
              >
                <Image
                  src={logo}
                  alt="Nutri Xpert Pro"
                  width={80}
                  height={40}
                  className="rounded-xl bg-transparent object-contain"
                  style={{
                    background: 'transparent',
                    imageRendering: 'crisp-edges',
                    filter: 'contrast(110%) brightness(105%)'
                  }}
                  priority
                />
              </Link>
            </motion.div>

            <nav className="hidden items-center gap-6 lg:flex">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                >
                  <Link
                    prefetch={false}
                    href={item.href}
                    className="text-white font-bold text-base transition-colors duration-200 hover:text-[#3fb950]"
                  >
                    <span>{item.name}</span>
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          <div className="hidden items-center space-x-4 lg:flex">
            <div className="hidden lg:flex items-center relative mr-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="bg-transparent border border-[#30363d] text-white text-sm rounded-md block w-64 pl-10 p-1.5 placeholder-gray-400 focus:ring-2 focus:ring-[#0969da] focus:border-[#0969da] focus:outline-none focus:bg-[#161b22] focus:w-80 transition-all duration-300 ease-in-out shadow-inner"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <kbd className="inline-flex items-center border border-[#30363d] rounded px-2 text-[10px] font-sans font-medium text-gray-400">
                    /
                  </kbd>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="text-white font-bold hover:bg-white/10" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold" asChild>
                <Link href="/register">Criar Conta</Link>
              </Button>
            </motion.div>
          </div>



          <motion.button
            className="hover:bg-muted rounded-lg p-2 transition-colors duration-200 lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="overflow-hidden lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="bg-[#161b22] border-[#30363d] mt-4 space-y-2 rounded-xl border py-4 shadow-xl backdrop-blur-lg">
                {navItems.map((item) => (
                  <Link
                    prefetch={false}
                    key={item.name}
                    href={item.href}
                    className="text-white hover:bg-[#21262d] block px-4 py-3 font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="space-y-2 px-4 py-2">
                  <Button variant="ghost" className="w-full text-white font-bold hover:bg-white/10" asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href="/login">Entrar</Link>
                  </Button>
                  <Button className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-bold" asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href="/register">Criar Conta</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
