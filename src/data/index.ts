import type { Asset, FiatCurrency, FiatInfo } from "../types";

export const FIAT_RATES: Record<FiatCurrency, FiatInfo> = {
  USD: { symbol: '$', rate: 1 },
  BRL: { symbol: 'R$', rate: 5.10 },
  EUR: { symbol: '€', rate: 0.92 },
};

export const TIME_RANGES = ['1D', '1S', '1M', '3M', '6M', '1A'];

export const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'Ethereum', ticker: 'ETH', network: 'ETH', balance: 1.5, priceUsd: 3200, change24h: 2.5, change7d: 5.1 },
  { id: '2', name: 'USDC', ticker: 'USDC', network: 'ETH', balance: 500, priceUsd: 1, change24h: 0.01, change7d: 0.02 },
  { id: '3', name: 'BNB', ticker: 'BNB', network: 'BSC', balance: 10, priceUsd: 580, change24h: -1.2, change7d: 3.5 },
  { id: '4', name: 'Cake', ticker: 'CAKE', network: 'BSC', balance: 150, priceUsd: 2.8, change24h: -4.5, change7d: -10.2 },
  { id: '5', name: 'Solana', ticker: 'SOL', network: 'SOLANA', balance: 45, priceUsd: 145, change24h: 8.4, change7d: 15.2 },
  { id: '6', name: 'Jupiter', ticker: 'JUP', network: 'SOLANA', balance: 2000, priceUsd: 1.1, change24h: 5.2, change7d: 12.0 },
  { id: '7', name: 'Cardano', ticker: 'ADA', network: 'CARDANO', balance: 5000, priceUsd: 0.45, change24h: -0.5, change7d: -2.1 },
];