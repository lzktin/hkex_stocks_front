import { supabase } from '@/lib/supabaseClient';

export default async function Dashboard() {
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