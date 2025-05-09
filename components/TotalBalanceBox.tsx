import AnimatedCounter from './AnimatedCounter';
import DoughnutChart from './DoughnutChart';

const TotalBalanceBox = ({
  accounts = [], totalBanks, totalCurrentBalance
}: TotalBalanceBoxProps) => {
  return (
    <section className="total-balance dark:bg-dark-card">
      <div className="total-balance-chart">
        <DoughnutChart accounts={accounts} />
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="header-2 dark:text-white">
          Bank Accounts: {totalBanks}
        </h2>
        <div className="flex flex-col gap-2">
          <p className="total-balance-label dark:text-gray-400">
            Total Current Balance
          </p>

          <div className="total-balance-amount flex-center gap-2 dark:text-white">
            <AnimatedCounter amount={totalCurrentBalance} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TotalBalanceBox