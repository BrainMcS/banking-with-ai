'use client'

import { useEffect, useState } from 'react'

interface StockMovement {
  ticker: string
  price: string
  change_amount: string
  change_percentage: string
  volume: string
}

interface TopMovers {
  top_gainers: StockMovement[]
  top_losers: StockMovement[]
  most_actively_traded: StockMovement[]
}

interface RecommendationTrend {
  buy: number
  hold: number
  period: string
  sell: number
  strongBuy: number
  strongSell: number
  symbol: string
}

const MarketMovers = () => {
  const [recommendations, setRecommendations] = useState<RecommendationTrend[]>([])
  const [topMovers, setTopMovers] = useState<TopMovers>({
    top_gainers: [],
    top_losers: [],
    most_actively_traded: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA'];
        const recommendationsPromises = symbols.map(async (symbol) => {
          const response = await fetch(
            `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
          );
          const data = await response.json();
          return data[0]; // Get the most recent recommendation
        });

        const results = await Promise.all(recommendationsPromises);
        setRecommendations(results.filter(Boolean));
        setError(null);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendation data');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMarketMovers = async () => {
      try {
        const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'BAC', 'WMT'];
        const quotes = [];

        for (const symbol of symbols) {
          try {
            const response = await fetch(
              `/api/stock?symbol=${symbol}`
            );
            const data = await response.json();

            if (!data.chart?.result?.[0]?.meta) {
              console.error(`No data for ${symbol}`);
              continue;
            }

            const meta = data.chart.result[0].meta;
            const price = Number(meta.regularMarketPrice);
            const previousClose = Number(meta.chartPreviousClose);

            if (isNaN(price) || isNaN(previousClose) || previousClose === 0) {
              console.error(`Invalid price data for ${symbol}:`, { price, previousClose });
              continue;
            }

            const changePercentage = ((price - previousClose) / previousClose * 100);
            
            quotes.push({
              ticker: symbol,
              price: price.toFixed(2),
              change_amount: (price - previousClose).toFixed(2),
              change_percentage: changePercentage.toFixed(2),
              volume: meta.regularMarketVolume?.toString() || '0'
            });
          } catch (err) {
            console.error(`Error fetching quote for ${symbol}:`, err);
          }
        }

        // Sort and categorize
        const sorted = quotes.filter(q => !isNaN(parseFloat(q.change_percentage))).sort((a, b) => 
          parseFloat(b.change_percentage) - parseFloat(a.change_percentage)
        );

        setTopMovers({
          top_gainers: sorted.slice(0, 5),
          top_losers: sorted.reverse().slice(0, 5),
          most_actively_traded: quotes.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume)).slice(0, 5)
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching market movers:', err);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketMovers();
    const interval = setInterval(fetchMarketMovers, 60000);
    return () => clearInterval(interval);
  }, []);

  // Remove these duplicate declarations that appear later in the code:
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-gray-500 dark:text-gray-400">Loading market data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-red-500">{error}</span>
      </div>
    )
  }

  return (
    
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top Gainers</h3> {/* Increased text size */}
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="text-base text-gray-500 dark:text-gray-400 border-b"> {/* Increased header text size */}
                <th className="text-left pb-3">Symbol</th>
                <th className="text-right pb-3">Price</th>
                <th className="text-right pb-3">Change</th>
                <th className="text-right pb-3">Volume</th>
              </tr>
            </thead>
            <tbody>
              {topMovers.top_gainers.slice(0, 5).map((stock, index) => (
                <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 text-base font-medium text-gray-900 dark:text-white">{stock.ticker}</td>
                  <td className="py-3 text-base text-right text-gray-600 dark:text-gray-300">${Number(stock.price).toFixed(2)}</td>
                  <td className="py-3 text-base text-right text-green-500">+{stock.change_percentage}</td>
                  <td className="py-3 text-base text-right text-gray-600 dark:text-gray-300">{Number(stock.volume).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top Losers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="text-base text-gray-500 dark:text-gray-400 border-b">
                <th className="text-left pb-3">Symbol</th>
                <th className="text-right pb-3">Price</th>
                <th className="text-right pb-3">Change</th>
                <th className="text-right pb-3">Volume</th>
              </tr>
            </thead>
            <tbody>
              {topMovers?.top_losers.slice(0, 5).map((stock, index) => (
                <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 text-base font-medium text-gray-900 dark:text-white">{stock.ticker}</td>
                  <td className="py-3 text-base text-right text-gray-600 dark:text-gray-300">${Number(stock.price).toFixed(2)}</td>
                  <td className="py-3 text-base text-right text-red-500">{stock.change_percentage}</td>
                  <td className="py-3 text-base text-right text-gray-600 dark:text-gray-300">{Number(stock.volume).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MarketMovers