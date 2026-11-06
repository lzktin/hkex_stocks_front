'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface StockReturn {
  date: string;
  daily_return: number;
}

export function DrawChart({ data }: {data: StockReturn[] }) {
  return (
    <div className="h-full w-full bg-white border border-t-0 rounded-b-lg p-4 flex flex-col">
      <div className="w-full h-full min-h-75">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }} 
              stroke="#94a3b8" 
              tickFormatter={(val) => val.split('T')[0]} // Clean up date format
            />
            
            <YAxis 
              tick={{ fontSize: 10 }} 
              stroke="#94a3b8" 
              unit="%" 
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Return']}
            />
            
            <Line 
              type="monotone" 
              dataKey="daily_return" 
              stroke="#2563eb" 
              strokeWidth={2} 
              dot={true} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}