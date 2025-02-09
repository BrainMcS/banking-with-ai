'use client'
import MarketMovers from '@/components/MarketMovers'
import HeaderBox from '@/components/HeaderBox'
import FinancialAdvisor from '@/components/FinancialAdvisor'

const MarketPage = () => {
  return (
    <div className="markets dark:bg-dark-background min-h-screen w-full pb-16">
      <div className="market-header">
        <HeaderBox 
          title="Market overview"
          subtext="See the market activity."
          darkMode={true}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <section className="lg:col-span-2 market-tables">
          <MarketMovers />
        </section>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full"> {/* Remove fixed height */}
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Financial Advisor</h3>
          <div className="h-[calc(100%-3rem)]">
            <FinancialAdvisor />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketPage
