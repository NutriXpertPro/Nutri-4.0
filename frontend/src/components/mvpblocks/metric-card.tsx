// components/mvpblocks/metric-card.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down';
}

export function MetricCard({ title, value, description, icon, color, trend }: MetricCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="h-2 bg-gradient-to-r from-teal-500 to-blue-500"></div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className={cn(
            "p-3 rounded-full bg-gradient-to-r from-teal-100 to-blue-100",
            color
          )}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className={`flex items-center text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}