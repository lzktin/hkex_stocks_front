// function FetchTable(correlations: StockCorrelation[]) {
//   return (
//     <div className = "overflow-y-auto">
//         <table className="text-left border border-t-0 w-full">
//           <tbody className = "text-[12px]">
//             {correlations?.map((row, idx) => (
//               <tr key={idx} className="border-b">
//                 <td className="pl-2">{row.code}</td>
//                 <td className="pl-2">{row.name}</td>
//                 <td className="pl-2">{Number(row.pearson_corr).toFixed(3)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//     </div>
//   );
// }

// async function FetchTopCorrelated() {
//   const { data: correlations, error } = await supabase
//     .from('stock_correlations')
//     .select('code, name, pearson_corr')
//     .order('pearson_corr', { ascending: false })
//     .limit(20);

//   if (error) return <div>Error loading stock data: {error.message}</div>;

//   return FetchTable(correlations)
// }

// async function FetchBottomCorrelated() {
//   const { data: correlations, error } = await supabase
//     .from('stock_correlations')
//     .select('code, name, pearson_corr')
//     .order('pearson_corr', { ascending: true })
//     .limit(10);

//   if (error) return <div>Error loading stock data: {error.message}</div>;

//   return FetchTable(correlations)
// }

// // 2. Loading UI fallback displayed while waiting for the database fetch
// function LoadTable() {
//   return (
//     <div className="h-full p-8 text-center text-gray-500 font-medium animate-pulse bg-gray-50 border">
//       Loading HKEX stock correlation data...
//     </div>
//   );
// }

// // 3. Main Page Component wrapped with Suspense
// export default function HomePage() {
//   return (
//     <>
//       <header className = "pt-4 px-4">
//         <div className = "border">
//           <input type="search" placeholder="Search stock ticker..." className="bg-transparent outline-none w-full" />
//         </div>
//       </header>
//       <main className="grid grid-cols-1 md:grid-cols-[7fr_3fr] h-auto md:h-[90vh] py-2 px-4">
//         <div className="h-full bg-blue-200">
//           Graph
//         </div>
//         <div className="h-full pl-2 grid grid-rows-2 gap-2">
//             <div className = "h-full flex flex-col">
//               <h2 className="border px-2 bg-blue-200">Top Correlated Stocks</h2>
//               <div className = "h-full">
//                 <Suspense fallback={<LoadTable />}>
//                   <FetchTopCorrelated />
//                 </Suspense>
//               </div>
//             </div>
//             <div className = "h-full flex flex-col">
//               <h2 className="border px-2 bg-blue-200">Bottom Correlated Stocks</h2>
//               <div className = "h-full">
//                 <Suspense fallback={<LoadTable />}>
//                   <FetchBottomCorrelated />
//                 </Suspense>
//               </div>  
//             </div>
//         </div>
//       </main>
//     </>
//   );
// }

import { Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient';

interface StockReturn {
  date: string;
  daily_return: number;
}

interface StockCorrelation {
  code: string;
  name: string;
  pearson_corr: number; 
}

function GetReturns({ r }: {r: StockReturn[] }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-white border border-t-0 rounded-b-lg">
        <table className="text-left w-full border-collapse table-auto">
          <tbody className="text-[12px] divide-y divide-slate-100">
            {r?.map((row, idx) => (
              <tr key={row.date} className="hover:bg-slate-50 transition-colors">
                <td className="p-2 font-mono font-medium text-blue-600">{row.date}</td>
                <td className="p-2 font-mono">{(row.daily_return * 100).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

function GetCorrelations({ c }: { c: StockCorrelation[] }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-white border border-t-0 rounded-b-lg">
        <table className="text-left w-full border-collapse table-auto">
          <tbody className="text-[12px] divide-y divide-slate-100">
            {c?.map((row, idx) => (
              <tr key={row.code} className="hover:bg-slate-50 transition-colors">
                <td className="p-2 font-mono font-medium text-blue-600">{row.code}</td>
                <td className="p-2 text-slate-600">{row.name}</td>
                <td className="p-2 font-mono">{row.pearson_corr.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

async function FetchDailyReturns() {
  const { data: returns, error } = await supabase
    .from('daily_returns')
    .select('date, daily_return')
    .eq('ticker', '0700.HK')
    .order('date', { ascending: true })

  if (error) return <div className="text-xs text-red-500 p-2">Error loading stock data: {error.message}</div>;

  return <GetReturns r={returns} />;
}

async function FetchTopCorrelated() {
  const { data: correlations, error } = await supabase
    .from('stock_correlations')
    .select('code, name, pearson_corr')
    .eq('key_stock', '0700.HK')
    .order('pearson_corr', { ascending: false })
    .limit(10);

  if (error) return <div className="text-xs text-red-500 p-2">Error loading stock data: {error.message}</div>;

  return <GetCorrelations c={correlations} />;
}

async function FetchBottomCorrelated() {
  const { data: correlations, error } = await supabase
    .from('stock_correlations')
    .select('code, name, pearson_corr')
    .eq('key_stock', '0700.HK')
    .order('pearson_corr', { ascending: true })
    .limit(10);

  if (error) return <div className="text-xs text-red-500 p-2">Error loading stock data: {error.message}</div>;

  return <GetCorrelations c={correlations} />;
}

function LoadingScreen() {
  return (
    <div className="h-full p-8 text-center text-gray-500 font-medium animate-pulse bg-gray-50 border border-t-0">
      Loading HKEX stock correlation data...
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <header className="pt-4 px-4 h-16 flex-none">
        <div className="border rounded p-2">
          <input type="search" placeholder="Search stock ticker..." className="bg-transparent outline-none w-full" />
        </div>
      </header>
      
      <main className="grid grid-cols-1 md:grid-cols-[7fr_3fr] h-auto md:h-[calc(100vh-80px)] py-2 px-4 gap-4">
        <div className = "h-full min-h-0 flex flex-col">
          <h2 className="border px-2 bg-blue-200 text-sm font-semibold py-1 rounded-t-lg">Daily Returns for Tencent Holdings (Past 365 Days)</h2>
          <div className = "flex-1 min-h-0 w-full">
            <Suspense fallback={<LoadingScreen />}>
              <FetchDailyReturns />
            </Suspense>
          </div>
        </div>

        <div className="h-full min-h-0 pl-2 grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
            
            <div className="h-full min-h-0 flex flex-col">
              <h2 className="border px-2 bg-blue-200 text-sm font-semibold py-1 rounded-t-lg">Top Correlated Stocks</h2>
              <div className="flex-1 min-h-0 w-full">
                <Suspense fallback={<LoadingScreen />}>
                  <FetchTopCorrelated />
                </Suspense>
              </div>
            </div>

            <div className="h-full min-h-0 flex flex-col">
              <h2 className="border px-2 bg-blue-200 text-sm font-semibold py-1 rounded-t-lg">Bottom Correlated Stocks</h2>
              <div className="flex-1 min-h-0 w-full">
                <Suspense fallback={<LoadingScreen />}>
                  <FetchBottomCorrelated />
                </Suspense>
              </div>  
            </div>

        </div>
      </main>
    </>
  );
}
