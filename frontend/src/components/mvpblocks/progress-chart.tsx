// components/mvpblocks/progress-chart.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ProgressChartProps {
  title: string;
  description: string;
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
}

export function ProgressChart({ title, description, data, dataKeys }: ProgressChartProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      <CardHeader className="pb-3">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                {dataKeys.map((dataKey, index) => (
                  <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dataKey.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={dataKey.color} stopOpacity={0}/>
                  </linearGradient>
                ))}
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
              <Legend />
              {dataKeys.map((dataKey, index) => (
                <Area 
                  key={index}
                  type="monotone" 
                  dataKey={dataKey.key} 
                  stroke={dataKey.color} 
                  fillOpacity={1} 
                  fill={`url(#color${index})`} 
                  name={dataKey.name}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}