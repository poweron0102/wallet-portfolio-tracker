import { type LucideIcon } from 'lucide-react';
import React from 'react';

export type FiatCurrency = 'USD' | 'BRL' | 'EUR';

export interface FiatInfo {
  symbol: string;
  rate: number;
}

export interface Asset {
  id: string;
  name:string;
  ticker: string;
  network: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  change7d: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface SubItem {
  key: string;
  label: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export interface WalletOptionProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  isPositive: boolean;
  fiatSymbol: string;
}
export interface AssetRowProps {
  asset: Asset;
  fiatRate: number;
  fiatSymbol: string;
}

export interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasSubmenu?: boolean;
  subItems?: SubItem[];
  currentSub?: string;
  onSubClick?: (key: string) => void;
}