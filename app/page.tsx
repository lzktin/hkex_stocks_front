// import { Suspense } from 'react'
// import { supabase } from '@/lib/supabaseClient';

// interface StockCorrelation {
//   code: string;
//   name: string;
//   pearson_corr: number | string; // Use string if it comes as a string from the API
// }

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

interface StockCorrelation {
  code: string;
  name: string;
  pearson_corr: number | string; 
}

// 🚀 FIX #1: Swapped 'async' out since it's a pure UI element, added props object formatting, 
// and applied 'h-full overflow-y-auto w-full min-w-0' to trap the table layout dimensions.
function FetchTable({ correlations }: { correlations: StockCorrelation[] }) {
  return (
    <div className="h-full w-full min-w-0 overflow-y-auto bg-white border border-t-0 rounded-b-lg">
        <table className="text-left w-full border-collapse table-auto">
          <tbody className="text-[12px] divide-y divide-slate-100">
            {correlations?.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="pl-2 py-1.5 font-mono font-medium text-blue-600">{row.code}</td>
                <td className="pl-2 py-1.5 text-slate-600">{row.name}</td>
                <td className="pl-2 py-1.5 font-mono">{Number(row.pearson_corr).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

async function FetchTopCorrelated() {
  const { data: correlations, error } = await supabase
    .from('stock_correlations')
    .select('code, name, pearson_corr')
    .order('pearson_corr', { ascending: false })
    .limit(10);

  if (error) return <div className="text-xs text-red-500 p-2">Error loading stock data: {error.message}</div>;

  // 🚀 FIX #2: Call FetchTable as a proper React component wrapper passing props explicitly
  return <FetchTable correlations={correlations} />;
}

async function FetchBottomCorrelated() {
  const { data: correlations, error } = await supabase
    .from('stock_correlations')
    .select('code, name, pearson_corr')
    .order('pearson_corr', { ascending: true })
    .limit(10);

  if (error) return <div className="text-xs text-red-500 p-2">Error loading stock data: {error.message}</div>;

  // 🚀 FIX #3: Call FetchTable as a proper React component wrapper passing props explicitly
  return <FetchTable correlations={correlations} />;
}

function LoadTable() {
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
      
      {/* 🚀 FIX #4: Changed 'h-auto' to 'md:h-[calc(100vh-80px)]' and added 'min-h-0' so the main area respects the screen limits */}
      <main className="grid grid-cols-1 md:grid-cols-[7fr_3fr] h-auto md:h-[calc(100vh-80px)] min-h-0 py-2 px-4 gap-4">
        <div className="h-full bg-blue-200 rounded-lg p-4">
          Graph
        </div>

        {/* 🚀 FIX #5: Crucial! Changed grid-rows-2 to explicit minmax tracks, and added min-h-0 so the sidebar is allowed to shrink */}
        <div className="h-full pl-2 grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 min-h-0">
            
            {/* Top Table Card Stack */}
            <div className="h-full flex flex-col min-h-0">
              <h2 className="border px-2 bg-blue-200 text-sm font-semibold py-1 rounded-t-lg flex-none">Top Correlated Stocks</h2>
              {/* 🚀 FIX #6: This wrapper box surrounding the Suspense boundary must have flex-1 and min-h-0 */}
              <div className="flex-1 min-h-0 w-full">
                <Suspense fallback={<LoadTable />}>
                  <FetchTopCorrelated />
                </Suspense>
              </div>
            </div>

            {/* Bottom Table Card Stack */}
            <div className="h-full flex flex-col min-h-0">
              <h2 className="border px-2 bg-blue-200 text-sm font-semibold py-1 rounded-t-lg flex-none">Bottom Correlated Stocks</h2>
              <div className="flex-1 min-h-0 w-full">
                <Suspense fallback={<LoadTable />}>
                  <FetchBottomCorrelated />
                </Suspense>
              </div>  
            </div>

        </div>
      </main>
    </>
  );
}
