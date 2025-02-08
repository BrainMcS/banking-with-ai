const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

export async function getStockData() {
    try {
      // Top market indices and stocks
      const symbols = ['SPY', 'QQQ', 'DIA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'BRK.B'];
      const promises = symbols.map(symbol =>
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
          .then(res => res.json())
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return [];
    }
  }
  
  export async function getCryptoData() {
    try {
      // Top 10 cryptocurrencies by market cap
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,xrp,cardano,avalanche-2,polkadot,dogecoin,tron&vs_currencies=usd&include_24hr_change=true'
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      return {};
    }
  }