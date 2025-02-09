'use client'
import MarketMovers from '@/components/MarketMovers'
import HeaderBox from '@/components/HeaderBox'
import FinancialAdvisor from '@/components/FinancialAdvisor'

const MarketPage = () => {
  return (
    <div className="markets dark:bg-dark-background min-h-screen w-full pb-20"> {/* increased padding-bottom */}
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
            <FinancialAdvisor />
      </div>
    </div>
  )
}

export default MarketPage
