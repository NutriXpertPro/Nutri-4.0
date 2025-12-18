'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BorderBeamProps {
  /** Tamanho/espessura do feixe (em px) */
  size?: number;
  /** Duração da animação completa (em segundos) */
  duration?: number;
  /** Delay antes de começar a animação */
  delay?: number;
  /** Cor inicial do gradient */
  colorFrom?: string;
  /** Cor final do gradient */
  colorTo?: string;
  /** Direção reversa da animação */
  reverse?: boolean;
  /** Classe adicional */
  className?: string;
  /** Estilo inline adicional */
  style?: React.CSSProperties;
}

export default function BorderBeam({
  size = 200,
  duration = 15,
  delay = 0,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  reverse = false,
  className,
  style,
}: BorderBeamProps) {
  return (
    <motion.div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [mask:linear-gradient(white,transparent_50%)_center/100%_100%_no-repeat,linear-gradient(white)_center/100%_100%_no-repeat]',
        className
      )}
      style={{
        ...style,
        maskSize: `${size}px ${size}px`,
        maskPosition: '0% 0%',
      }}
      animate={{
        maskPosition: reverse
          ? ['0% 0%', '100% 100%', '0% 0%']
          : ['0% 0%', '-100% -100%', '0% 0%'],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `conic-gradient(from 0deg, ${colorFrom}, ${colorTo}, ${colorFrom})`,
        }}
      />
    </motion.div>
  );
}