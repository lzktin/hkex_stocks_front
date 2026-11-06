import { Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DrawChart } from '@/components/drawChart';
import { SearchBar } from '@/components/searchBar';

export const instant = false;

interface Stock {
  code: string;
  short_name: string;
  long_name: string;
}

interface StockReturn {
  date: string;
  daily_return: number;
}

interface StockCorrelation {
  code: string;
  name: string;
  pearson_corr: number; 
}

async function FetchDailyReturns() {
  const { data: returns, error } = await supabase
    .from('daily_returns')
    .select('date, daily_return')
    .eq('ticker', '0700.HK')
    .order('date', { ascending: true })

  if (error) return <div className="text-xs text-red-500 p-2">Error loading stock data: {error.message}</div>;

  return <DrawChart data={returns || []} />;
}

async function FetchTopCorrelated() {
  const { data: correlations, error } = await supabase
    .from('stock_correlations')
    .select('code, name, pearson_corr')
    .eq('key_stock', '0700.HK')
    .order('pearson_corr', { ascending: false })
    .limit(10);

  if (error) return <div className="text-xs text-red-500 p-2">Error loading stock data: {error.message}</div>;

  return <GetCorrelations data={correlations} />;
}

async function FetchBottomCorrelated() {
  const { data: correlations, error } = await supabase
    .from('stock_correlations')
    .select('code, name, pearson_corr')
    .eq('key_stock', '0700.HK')
    .order('pearson_corr', { ascending: true })
    .limit(10);

  if (error) return <div className="text-xs text-red-500 p-2">Error loading stock data: {error.message}</div>;

  return <GetCorrelations data={correlations} />;
}

function GetCorrelations({ data }: { data: StockCorrelation[] }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-white border border-t-0 rounded-b-lg">
        <table className="text-left w-full border-collapse table-fixed">
          <tbody className="text-[12px] divide-y divide-slate-100">
            {data?.map((row) => (
              <tr key={row.code} className="hover:bg-slate-50 transition-colors">
                <td className="p-2 w-[30%] font-mono font-medium text-blue-600">{row.code}</td>
                <td className="p-2 w-[40%] text-slate-600">{row.name}</td>
                <td className="p-2 2-[30%] font-mono">{row.pearson_corr.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-full p-8 text-center text-gray-500 font-medium animate-pulse bg-gray-50 border border-t-0">
      Loading HKEX stock correlation data...
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {

  const params = await searchParams;
  const ticker = params.ticker || '0700.HK';

  return (
    <>
      <header className="pt-5 px-4 h-20 flex-none">
        <SearchBar search={ticker} />
      </header>
      
      <main className="grid grid-cols-1 min-h-90 px-4 md:px-0 md:grid-cols-[7fr_3fr] md:h-[85vh] gap-4">
        <div className="h-full flex flex-col py-4 md:pl-4">
          <h2 className="border px-2 bg-blue-200 text-sm font-semibold py-1 rounded-t-lg">
            Daily Returns for {ticker} (Past 365 Days)
          </h2>
          <div className="flex-1 w-full">
            <Suspense fallback={<LoadingScreen />}>
              <DynamicDailyReturns ticker={ticker} />
            </Suspense>
          </div>
        </div>

        <div className="h-full min-h-75 grid grid-rows-[1fr_1fr] py-4 md:pr-4 gap-4">
            <div className="h-full min-h-0 flex flex-col">
              <h2 className="border px-2 bg-blue-200 text-sm font-semibold py-1 rounded-t-lg">Top Correlated Stocks</h2>
              <div className="flex-1 min-h-0 w-full">
                <Suspense fallback={<LoadingScreen />}>
                  <DynamicCorrelations ticker={ticker} ascending={false} />
                </Suspense>
              </div>
            </div>

            <div className="h-full min-h-0 flex flex-col">
              <h2 className="border px-2 bg-blue-200 text-sm font-semibold py-1 rounded-t-lg">Bottom Correlated Stocks</h2>
              <div className="flex-1 min-h-0 w-full">
                <Suspense fallback={<LoadingScreen />}>
                  <DynamicCorrelations ticker={ticker} ascending={true} />
                </Suspense>
              </div>  
            </div>
        </div>
      </main>
    </>
  );
}

// Data fetchers updated to accept the dynamic ticker prop
async function DynamicDailyReturns({ ticker }: { ticker: string }) {
  const { data: returns, error } = await supabase
    .from('daily_returns')
    .select('date, daily_return')
    .eq('ticker', ticker)
    .order('date', { ascending: true });

  if (error) return <div className="text-xs text-red-500 p-2">Error loading data: {error.message}</div>;

  return <DrawChart data={returns || []} />;
}

async function DynamicCorrelations({ ticker, ascending }: { ticker: string; ascending: boolean }) {
  const { data: correlations, error } = await supabase
    .from('stock_correlations')
    .select('code, name, pearson_corr')
    .eq('key_stock', ticker)
    .order('pearson_corr', { ascending })
    .limit(10);

  if (error) return <div className="text-xs text-red-500 p-2">Error loading data: {error.message}</div>;

  return (
    <div className="h-full w-full overflow-y-auto bg-white border border-t-0 rounded-b-lg">
      <table className="text-left w-full border-collapse table-fixed">
        <tbody className="text-[12px] divide-y divide-slate-100">
          {correlations?.map((row) => (
            <tr key={row.code} className="hover:bg-slate-300 align-top text-left">
              <td className="py-2 pl-2 font-mono font-medium text-blue-600 w-[28%]">
                {row.code}
              </td>
              <td className="py-2 px-2 text-slate-600 w-[47%]">
                {row.name}
              </td>
              <td className="py-2 pr-2 font-mono text-right w-[25%]">
                {row.pearson_corr.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
