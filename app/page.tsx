import { Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient';

async function FetchStockData() {
  const { data: correlations, error } = await supabase
    .from('stock_correlations')
    .select('code, name, pearson_corr')
    .order('pearson_corr', { ascending: false })
    .limit(10);

  if (error) return <div>Error loading stock data: {error.message}</div>;

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">HKEX Top Correlated Stocks</h1>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="text-black bg-white">
            <tr>
              <th className="p-3">code</th>
              <th className="p-3">name</th>
              <th className="p-3">pearson correlation</th>
            </tr>
          </thead>
          <tbody>
            {correlations?.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3 font-mono">{row.code}</td>
                <td className="p-3 font-mono">{row.name}</td>
                <td className="p-3 font-bold">{Number(row.pearson_corr).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// 2. Loading UI fallback displayed while waiting for the database fetch
function TableSkeleton() {
  return (
    <div className="p-8 text-center text-gray-500 font-medium animate-pulse bg-gray-50 rounded-lg border">
      Loading HKEX stock correlation data...
    </div>
  );
}

// 3. Main Page Component wrapped with Suspense
export default function HomePage() {
  return (
    <>
      <header className = "pt-4 px-4">
        <div className = "searchBar border">
          <input type="search" placeholder="Search stock ticker..." className="bg-transparent outline-none w-full" />
        </div>
      </header>
      <main className="max-w-4xl font-sans">
        
        {/* The Suspense boundary catches the uncached fetch call */}
        <Suspense fallback={<TableSkeleton />}>
          <FetchStockData />
        </Suspense>
      </main>
    </>
  );
}