'use client';

import { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const PIXELS_PER_FRAME = 16;
const GRAPH_PADDING = 16;

interface StockReturn {
  date: string;
  daily_return: number;
}

export function DrawChart({ data }: {data: StockReturn[] }) {
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(data.length-1);

  const graphScrolling = useRef(false);
  const mouseX = useRef(0);
  const windowOnClick = useRef({ startX: 0, endX: 0 });

  const currentDomain = useRef({startX: 0, endX: data.length-1});
  currentDomain.current = { startX, endX };

  const maxY = Math.max(...data.map(dataPoint => Math.abs(dataPoint.daily_return)), 0.01);
  const currentRange = [-maxY, maxY];
  const yTicks = [-maxY, 2/3 * -maxY, 1/3 * -maxY, 0, 1/3 * maxY, 2/3 * maxY, maxY];

  const mouseSpeed = useRef(0);
  const prevMouseX = useRef(0);
  const prevTime = useRef(0);
  const animId = useRef<number | null>(null);

  const graphContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = graphContainer.current;
    if (currentContainer == null)
      return;

    if (animId.current !== null) {
      cancelAnimationFrame(animId.current);
      animId.current = null;
    }
    // Graph-only listener
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
    // Graph-only listener
    const detectMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) 
        return;

      if (animId.current != null) {
        cancelAnimationFrame(animId.current);
        animId.current = null;
      }
      prevTime.current = performance.now();

      graphScrolling.current = true;
      mouseX.current = e.clientX;
      prevMouseX.current = e.clientX;
      mouseSpeed.current = 0;
      windowOnClick.current = { ...currentDomain.current };
    };
    
    // Entire window listener
    const detectMouseUp = () => {
      // Prevent false trigger outside graph
      if (graphScrolling.current == false)
        return;
      graphScrolling.current = false;

      const friction = 0.92;
      let currentSpeed = mouseSpeed.current * PIXELS_PER_FRAME;
      if (Math.abs(currentSpeed) < 0.5) 
        return;

      const step = () => {
        currentSpeed *= friction;

        if (Math.abs(currentSpeed) < 0.1) {
          animId.current = null;
          return;
        }

        const { startX, endX } = currentDomain.current;
        const range = endX - startX;
        const chartWidth = currentContainer.getBoundingClientRect().width - (GRAPH_PADDING * 2);

        const sliding_offset = -(currentSpeed / (chartWidth / range));

        let newStart = startX + sliding_offset;
        let newEnd = endX + sliding_offset;

        if (newStart < 0) {
          newStart = 0;
          newEnd = range;
          currentSpeed = 0;
        } else if (newEnd >= data.length - 1) {
          newEnd = data.length - 1;
          newStart = Math.max(0, (data.length - 1) - range);
          currentSpeed = 0;
        }

        setStartX(newStart);
        setEndX(newEnd);

        animId.current = requestAnimationFrame(step);
      };

      animId.current = requestAnimationFrame(step);

    }
    // This is a window listener
    const dragToScroll = (e: MouseEvent) => {
      if (graphScrolling.current == false)
        return;

      const now = performance.now();
      const dx = e.clientX - prevMouseX.current;
      const dt = now - prevTime.current;

      if (dt > 0) {
        mouseSpeed.current = dx / dt; // 
      }

      prevMouseX.current = e.clientX;
      prevTime.current = now;
      
      const { startX, endX } = windowOnClick.current;
      const range = endX - startX;
      const mouseMove = e.clientX - mouseX.current;

      const currentDimension = currentContainer.getBoundingClientRect();
      const chartWidth = currentDimension.width - (GRAPH_PADDING * 2);

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
      if (animId.current !== null) {
        cancelAnimationFrame(animId.current);
      }

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
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}