import { Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient';

async function FetchStockData() {
  
  // Fetch top correlated pairs sorted by score
  const { data: correlations, error } = await supabase
    .from('stock_correlations')
    .select('ticker1, ticker2, pearson_corr, updated_at')
    .order('pearson_corr', { ascending: false })
    .limit(20);

  if (error) return <div>Error loading stock data: {error.message}</div>;

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">HKEX Top Correlated Stocks</h1>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Stock A</th>
              <th className="p-3">Stock B</th>
              <th className="p-3">Pearson Correlation</th>
            </tr>
          </thead>
          <tbody>
            {correlations?.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3 font-mono">{row.ticker1}</td>
                <td className="p-3 font-mono">{row.ticker2}</td>
                <td className="p-3 font-bold">{Number(row.pearson_corr).toFixed(4)}</td>
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
    <main className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-2">HKEX Equity Correlations</h1>
      <p className="text-gray-600 mb-6">
        Top correlated stock pairs fetched live from Supabase.
      </p>

      {/* The Suspense boundary catches the uncached fetch call */}
      <Suspense fallback={<TableSkeleton />}>
        <FetchStockData />
      </Suspense>
    </main>
  );
}