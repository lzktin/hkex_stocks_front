'use client';

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient';

interface Stock {
  code: string;
  short_name: string;
  long_name: string;
}

export function SearchBar() {
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setLoadingState] = useState(false);
  const [inSearch, setSearchState] = useState(false);

  const defaultStocks: Stock[] = [
    { code: '0700.HK', short_name: 'TENCENT', long_name: 'Tencent Holdings Limited' },
    { code: '0005.HK', short_name: 'HSBC HOLDINGS', long_name: 'HSBC Holdings plc' },
    { code: '9988.HK', short_name: 'BABA-W', long_name: 'Alibaba Group Holding Limited' },
    { code: '0388.HK', short_name: 'HKEX', long_name: 'Hong Kong Exchanges and Clearing Limited' },
    { code: '1299.HK', short_name: 'AIA', long_name: 'AIA Group Limited' },
    { code: '0941.HK', short_name: 'CHINA MOBILE', long_name: 'China Mobile Limited' },
    { code: '3690.HK', short_name: 'MEITUAN-W', long_name: 'Meituan' },
    { code: '2318.HK', short_name: 'PING AN', long_name: 'Ping An Insurance (Group) Company of China, Ltd.' },
    { code: '0939.HK', short_name: 'CCB', long_name: 'China Construction Bank Corporation' },
    { code: '1024.HK', short_name: 'KUAISHOU-W', long_name: 'Kuaishou Technology' },
  ];

  async function FetchStock(searchTerm : string) {
    setUserInput(searchTerm);
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    setLoadingState(true);

    const {data : stocks, error} = await supabase
      .from('stock_lookup')
      .select('*')
      .or(`code.ilike.%${searchTerm}%,short_name.ilike.%${searchTerm}%,long_name.ilike.%${searchTerm}%`)
      .limit(10)
      
    setLoadingState(false);

    if (error) {
      console.error("Error loading data:", error.message);
      setResults([]);
      return;
    }
    
    setResults(stocks || []);

    return;
  }

  function RenderDropDown(stock: Stock) {
    return (
      <li
        key = {stock.code}
        className="p-2 hover:bg-blue-50 cursor-pointer grid grid-cols-[1fr_2fr] md:grid-cols-[1fr_1fr_1fr] items-center text-sm"
        onClick={() => {window.location.href = `/?ticker=${stock.code}`}}
      >
        <code>{stock.code}</code>
        <small className="hidden md:block text-slate-700">{stock.short_name}</small>
        <small className="text-slate-400 text-right">{stock.long_name}</small>
      </li>
    )
  }

  function CloseDropDown(event: MouseEvent) {
    const dropDown = searchRef.current;
    if (dropDown && !dropDown.contains(event.target as Node)) {
      setSearchState(false);
      setResults([]);
    }
  }

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('mousedown', CloseDropDown);

    // cleanup. Failsafe in case new pages are added.
    return () => {
      document.removeEventListener('mousedown', CloseDropDown);
    };
  }, []);

  return (
    <div ref={searchRef} className="bg-white relative border border-slate-200 rounded-lg shadow-sm px-4 py-2">
      <input
      type="text"
      value={userInput}
      onChange={(e) => FetchStock(e.target.value)}
      onFocus={() => {
        setSearchState(true);
        if (userInput.trim() !== "")
          FetchStock(userInput);
      }}
      placeholder="Search by stock code or company name (e.g. 0005.HK, Tencent, CKH)..."
      className="bg-transparent outline-none w-full md:text-sm text-slate-700 truncate"
      />
    
      {inSearch && (
        <ul className = "z-20 absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {userInput.trim() === "" ? (
            defaultStocks.map((stock) => RenderDropDown(stock))
          ) : loading ? (
            <li className="p-2 text-xs text-slate-400">
              Searching stocks...
            </li>
          ) : results.length === 0 ? (
            <li className="p-2 text-xs text-slate-400">
              No results
            </li>
          ) : (
            results.map((stock) => RenderDropDown(stock))
          )}
        </ul>
      )}
    </div>
  );
  
}