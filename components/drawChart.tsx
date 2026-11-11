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

  const mouseDrag = useRef(false);
  const mouseX = useRef(0);
  const mouseWindow = useRef({ startX: 0, endX: 0 });

  const currentDomain = useRef({startX: 0, endX: data.length-1});
  currentDomain.current = { startX, endX };

  const maxY = Math.max(...data.map(dataPoint => Math.abs(dataPoint.daily_return)), 0.01);
  const currentRange = [-maxY, maxY];
  const yTicks = [-maxY, 2/3 * -maxY, 1/3 * -maxY, 0, 1/3 * maxY, 2/3 * maxY, maxY];

  const graphContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = graphContainer.current;
    if (currentContainer == null)
      return;

    const pinchToZoom = (e: WheelEvent) => {
      e.preventDefault();

      const { startX, endX } = currentDomain.current;
      const range = endX-startX;

      const center = startX + Math.round(range/2);

      let newRange: number;
      if (e.deltaY < 0) {
        newRange = Math.max(10, Math.floor(range*0.9));
      }
      else {
        newRange = Math.min(data.length-1, Math.floor(range * 1.1));
      }
      const newStart = Math.max(0, Math.floor(center-newRange/2));
      const newEnd = Math.min(data.length-1, Math.floor(center+newRange/2));
      setStartX(newStart);
      setEndX(newEnd);
    }

    const detectMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) 
        return;

      mouseDrag.current = true;
      mouseX.current = e.clientX;
      mouseWindow.current = { ...currentDomain.current };
    };

    const detectMouseUp = () => {
      mouseDrag.current = false;
    }

    const dragToScroll = (e: MouseEvent) => {
      if (mouseDrag.current == false)
        return;
      
      const { startX, endX } = mouseWindow.current;
      const range = endX - startX;
      const mouseMove = e.clientX - mouseX.current;

      const currentDimension = currentContainer.getBoundingClientRect();
      const padding = 16;
      const chartWidth = currentDimension.width - (padding * 2);

      const offset = -Math.round(mouseMove / (chartWidth / range));

      let newStart = startX + offset;
      let newEnd = endX + offset;

      if (newStart < 0) {
        newStart = 0;
        newEnd = range;
      } else if (newEnd >= data.length) {
        newEnd = data.length - 1;
        newStart = Math.max(0, data.length - 1 - range);
      }

      setStartX(newStart);
      setEndX(newEnd);
    };

    currentContainer.addEventListener('wheel', pinchToZoom, {passive: false});
    currentContainer.addEventListener('mousedown', detectMouseDown);
    window.addEventListener('mouseup', detectMouseUp);
    window.addEventListener('mousemove', dragToScroll);

    return () => {
      currentContainer.removeEventListener('wheel', pinchToZoom);
      currentContainer.removeEventListener('mousedown', detectMouseDown);
      window.removeEventListener('mouseup', detectMouseUp);
      window.removeEventListener('mousemove', dragToScroll);
    };

  }, [data.length])
    

  
  const slicedData = data.slice(startX, endX + 1);

  return (
    <div ref = {graphContainer} className="h-full w-full p-4 bg-white border border-t-0 rounded-b-lg flex flex-col **:cursor-grab **:active:cursor-grabbing">
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
              tick={{ fontSize: 10, className: "select-none"}} 
              stroke="#94a3b8" 
              tickFormatter={(val) => val.split('T')[0]}
            />
            
            <YAxis 
              domain = {currentRange}
              ticks = {yTicks}
              tick={{ fontSize: 10, className: "select-none"}} 
              stroke="#94a3b8" 
              tickFormatter={(val) => `${Number(val.toFixed(5))}`}
              unit="%" 
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              formatter={(val: any) => [`${Number(val).toFixed(5)}%`, 'Return']}
            />
            
            <Line 
              type="linear" 
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