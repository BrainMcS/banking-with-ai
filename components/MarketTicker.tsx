'use client'

import { useEffect, useState } from 'react'

interface MarketData {
  symbol: string
  price: string
  change: string
  type: 'crypto' | 'stock'
}

const MarketTicker = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSet, setCurrentSet] = useState(0)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch crypto data only
        const cryptoResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,xrp,cardano,avalanche-2,polkadot,dogecoin,tron&vs_currencies=usd&include_24hr_change=true'
        )
        const cryptoData = await cryptoResponse.json()

        const cryptoSymbols = {
          bitcoin: 'BTC', ethereum: 'ETH', binancecoin: 'BNB',
          solana: 'SOL', xrp: 'XRP', cardano: 'ADA',
          'avalanche-2': 'AVAX', polkadot: 'DOT',
          dogecoin: 'DOGE', tron: 'TRX'
        }

        const formattedData: MarketData[] = [
          ...Object.entries(cryptoData).map(([key, value]: [string, any]) => ({
            symbol: `${cryptoSymbols[key]}/USD`,
            price: `$${value.usd?.toLocaleString() || 'N/A'}`,
            change: `${value.usd_24h_change?.toFixed(2) || 0}%`,
            type: 'crypto'
          }))
        ]

        setMarketData(formattedData)
        setError(null)
      } catch (err) {
        console.error('Error fetching market data:', err)
        setError('Failed to load market data')
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
    const dataInterval = setInterval(fetchMarketData, 60000)

    // Adjust rotation interval for crypto only (10 items)
    const rotationInterval = setInterval(() => {
      setCurrentSet(prev => (prev + 1) % 2) // Show 5 items at a time (10/5 = 2 sets)
    }, 5000)

    return () => {
      clearInterval(dataInterval)
      clearInterval(rotationInterval)
    }
  }, [])

  const getCurrentItems = () => {
    const itemsPerSet = 5
    const start = currentSet * itemsPerSet
    return marketData.slice(start, start + itemsPerSet)
  }

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 dark:from-[#1a1f2e] dark:to-[#2d3748] py-3">
        <div className="flex justify-center">
          <span className="text-sm text-gray-300">Loading market data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 dark:from-[#1a1f2e] dark:to-[#2d3748] py-3">
        <div className="flex justify-center">
          <span className="text-sm text-red-400">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-r from-gray-900 to-gray-800 dark:from-[#1a1f2e] dark:to-[#2d3748] py-3 z-40">
      <div className="ticker-wrapper">
        <div className="ticker">
          <div className="ticker-track">
            {marketData.map((item, index) => (
              <div key={index} className="ticker-item">
                <span className="text-sm font-semibold text-yellow-400">
                  {item.symbol}
                </span>
                <span className="text-sm text-gray-300 ml-2">{item.price}</span>
                <span className={`text-sm ml-2 ${
                  item.change.startsWith('-') ? 'text-red-400' : 'text-green-400'
                }`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
          <div className="ticker-track">
            {marketData.map((item, index) => (
              <div key={`clone-${index}`} className="ticker-item">
                <span className="text-sm font-semibold text-yellow-400">
                  {item.symbol}
                </span>
                <span className="text-sm text-gray-300 ml-2">{item.price}</span>
                <span className={`text-sm ml-2 ${
                  item.change.startsWith('-') ? 'text-red-400' : 'text-green-400'
                }`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketTicker;