import {Asset, ConnectedWallet, FiatCurrency, FiatInfo} from "../types";
import { getBscWalletBalance, getAssetPrices } from '../utils/api';

export const FIAT_RATES: Record<FiatCurrency, FiatInfo> = {
  USD: { symbol: '$', rate: 1 },
  BRL: { symbol: 'R$', rate: 5.10 },
  EUR: { symbol: '€', rate: 0.92 },
};

export const TIME_RANGES = ['1D', '1S', '1M', '3M', '6M', '1A'];

export const getAssets = async (wallets: ConnectedWallet[]): Promise<Asset[]> => {
    // For now, we'll just fetch BSC assets.
    // We'll need to add support for other networks later.
    let bscAssets: Asset[];
    //let ethAssets: Asset[];
    for (const wallet of wallets) {
        if (wallet.name === 'MetaMask') {
            bscAssets = await getBscWalletBalance(wallet.address);
        }
        else if (wallet.name === 'Phantom') {
            console.log("Phantom not supported yet")
        }
        else if (wallet.name === 'Yoroi') {
            console.log("Yoroi not supported yet")
        }
    }
    const allAssets = [...bscAssets];
    const assetsWithPrices = await getAssetPrices(allAssets);
    return assetsWithPrices;
};
