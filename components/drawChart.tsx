'use client';

import { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface StockReturn {
  date: string;
  daily_return: number;
}

export function DrawChart({ data }: {data: StockReturn[] }) {
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(data.length-1);

  const currentRange = useRef({startX: 0, endX: data.length-1});
  currentRange.current = { startX, endX };

  const graphContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = graphContainer.current;
    if (currentContainer == null)
      return;

    const pinchToZoom = (e: WheelEvent) => {
      e.preventDefault();

      const { startX, endX } = currentRange.current;
      const range = endX-startX;
      const center = startX + Math.round(range/2);

      let newRange: number;
      if (e.deltaY < 0) {
        newRange = Math.max(10, Math.floor(range*0.9));
      }
      else {
        newRange = Math.min(data.length-1, Math.floor(range * 1.1));
      }
      const newStart = Math.max(0, Math.floor(center - newRange/2));
      const newEnd = Math.min(data.length-1, Math.floor(center+newRange/2));
      setStartX(newStart);
      setEndX(newEnd);
    }

    currentContainer.addEventListener('wheel', pinchToZoom, {passive: false});

    return () => {
      currentContainer.removeEventListener('wheel', pinchToZoom);
    };

  }, [data.length])
    
  
  const slicedData = data.slice(startX, endX + 1);

  return (
    <div ref = {graphContainer} className="h-full w-full bg-white border border-t-0 rounded-b-lg p-4 flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2 text-xs text-slate-500">
        <span>Zoomed view: {slicedData.length} of {data.length} days</span>
        <button 
          onClick={() => { setStartX(0); setEndX(data.length - 1); }}
          className="hover:text-slate-800 underline cursor-pointer"
        >
          Reset Zoom
        </button>
      </div>
      
      <div className="w-full h-full min-h-75">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={slicedData}>
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