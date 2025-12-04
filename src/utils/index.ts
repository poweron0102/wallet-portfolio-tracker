import type { ChartDataPoint } from "../types";

export const generateChartData = (network: string, range: string): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const points = range === '1D' ? 24 : range === '1A' ? 12 : 30;
  let baseValue = 10000;
  
  if (network === 'ETH') baseValue = 5000;
  if (network === 'BSC') baseValue = 3000;
  if (network === 'SOLANA') baseValue = 4000;
  if (network === 'CARDANO') baseValue = 1500;

  for (let i = 0; i < points; i++) {
    const randomChange = (Math.random() - 0.45) * 500; 
    baseValue += randomChange;
    if (baseValue < 0) baseValue = 100;
    
    data.push({
      name: `P${i}`,
      value: Math.floor(baseValue),
    });
  }
  return data;
};