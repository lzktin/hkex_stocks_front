'use client';

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface StockResult {
  code: string;
  short_name: string;
  long_name: string;
}

export function SearchBar({ search }: { search: string }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<StockResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
    const fetchStocks = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        setIsOpen(false);
        return;
      }


      const { data, error } = await supabase
        .from('stock_lookup') 
        .select('code, short_name, long_name')
        .or(`code.ilike.%${query}%,short_name.ilike.%${query}%,long_name.ilike.%${query}%`)
        .limit(8);

      if (!error && data) {
        setResults(data);
        setIsOpen(true);
      }
    };

    const timer = setTimeout(fetchStocks, 300);
    return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (code: string) => {
        setQuery('');
        setIsOpen(false);
        router.push(`/?ticker=${code}`);
        router.refresh();
     };

    return (
        <div className="relative w-full" ref={searchRef}>
        <div className="border rounded-lg p-2 bg-white flex items-center shadow-sm">
            <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by stock code, short name, or long name (e.g. 0005.HK, Tencent, CKH)..."
            className="bg-transparent outline-none w-full text-sm text-slate-700"
            />
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && results.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
            {results.map((stock) => (
                <li
                key={stock.code}
                onClick={() => handleSelect(stock.code)}
                className="p-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-xs transition-colors"
                >
                <div>
                    <span className="font-mono font-bold text-blue-600 mr-2">{stock.code}</span>
                    <span className="font-medium text-slate-800">{stock.short_name}</span>
                </div>
                <span className="text-slate-400 truncate max-w-50">{stock.long_name}</span>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}