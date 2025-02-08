'use client'
import MarketMovers from '@/components/MarketMovers'
import HeaderBox from '@/components/HeaderBox'

const MarketPage = () => {
  return (
    <div className="markets dark:bg-dark-background min-h-screen w-full">
      <div className="market-header">
        <HeaderBox 
          title="Market overview"
          subtext="See the market activity."
          darkMode={true}
        />
      </div>
      <section className="market-tables">
        <MarketMovers />
      </section>
    </div>
  )
}

export default MarketPage