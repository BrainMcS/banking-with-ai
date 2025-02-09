'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface FinancialChartProps {
  type?: 'line' | 'bar' | 'candlestick';
  dataPoints?: string;
  timeframe?: string;
}

export default function FinancialChart({ 
  type = 'line',
  dataPoints = 'AAPL',
  timeframe = '1W'
}: FinancialChartProps) {
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate mock data
    const generateMockData = () => {
      const data = []
      const basePrice = 150 // Starting price
      let currentPrice = basePrice
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        // Random price movement
        const change = (Math.random() - 0.5) * 5
        currentPrice = Number((currentPrice + change).toFixed(2))
        
        data.push({
          date: date.toLocaleDateString(),
          value: currentPrice,
          volume: Math.floor(Math.random() * 1000000)
        })
      }
      
      return data
    }

    setChartData(generateMockData())
    setIsLoading(false)
  }, [dataPoints])

  if (isLoading) {
    return (
      <Card className="col-span-4 dark:bg-gray-900">
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-gray-400">Loading market data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-4 dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-200">
          {dataPoints} Stock Price
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          {timeframe} Chart
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#adfa1d"
                fill="url(#gradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#adfa1d" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#adfa1d" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}