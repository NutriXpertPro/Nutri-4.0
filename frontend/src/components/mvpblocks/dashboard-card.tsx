// components/mvpblocks/dashboard-card.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  gradient: string;
}

export function DashboardCard({ title, description, children, icon, gradient }: DashboardCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className={cn(
            "p-3 rounded-full bg-gradient-to-r",
            gradient,
            "text-white group-hover:scale-110 transition-transform duration-300"
          )}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {children}
      </CardContent>
    </Card>
  );
}