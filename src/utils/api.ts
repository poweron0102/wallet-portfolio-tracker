import type { Asset } from '../types';

const BSC_API_URL = 'https://api.bscscan.com/api';
const API_KEY = import.meta.env.VITE_BSCSCAN_API_KEY;
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export const getBscWalletBalance = async (walletAddress: string): Promise<Asset[]> => {
  try {
      console.log("API_KEY: " + API_KEY)
    const response = await fetch(
      `${BSC_API_URL}?module=account&action=tokenbalance&address=${walletAddress}&tag=latest&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.status === '1') {
      const assets: Asset[] = data.result.map((token: any) => ({
        id: token.contractAddress,
        name: token.tokenSymbol,
        ticker: token.tokenSymbol,
        network: 'BSC',
        balance: parseFloat(token.balance) / 10 ** parseInt(token.tokenDecimal, 10),
        priceUsd: 0,
        change24h: 0,
        change7d: 0,
      }));
      return assets;
    } else {
      console.error('Error fetching BSC balance:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching BSC balance:', error);
    return [];
  }
};

export const getAssetPrices = async (assets: Asset[]): Promise<Asset[]> => {
  try {
    const assetIds = assets.map((asset) => asset.id).join(',');
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/token_price/binance-smart-chain?contract_addresses=${assetIds}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true`
    );
    const data = await response.json();

    return assets.map((asset) => {
      const priceData = data[asset.id.toLowerCase()];
      return {
        ...asset,
        priceUsd: priceData?.usd || 0,
        change24h: priceData?.usd_24h_change || 0,
        change7d: priceData?.usd_7d_change || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching asset prices:', error);
    return assets;
  }
};
