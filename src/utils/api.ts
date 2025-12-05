import type { Asset } from '../types';

// Documentação:
// - https://docs.moralis.io/web3-data-api/evm/reference/get-wallet-token-balances
// - https://docs.moralis.io/web3-data-api/evm/reference/get-native-balance
// - https://docs.moralis.io/web3-data-api/evm/reference/get-token-price
const MORALIS_API_URL = 'https://deep-index.moralis.io/api/v2.2';
const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY;
const COINGECKO_API_URL = '/api/coingecko'; // Alterado para usar o proxy do Vite
const BSC_CHAIN_ID = '0x38'; // 56 em decimal


const BNB_PLACEHOLDER_ID = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

export const getBscWalletBalance = async (walletAddress: string): Promise<Asset[]> => {
    try {
        const headers = {
            'accept': 'application/json',
            'X-API-Key': MORALIS_API_KEY
        };

        // Executa as chamadas para saldos de tokens e nativo em paralelo
        const [tokensResponse, nativeBalanceResponse] = await Promise.all([
            fetch(
                `${MORALIS_API_URL}/${walletAddress}/erc20?chain=${BSC_CHAIN_ID}`,
                { method: 'GET', headers }
            ),
            fetch(
                `${MORALIS_API_URL}/${walletAddress}/balance?chain=${BSC_CHAIN_ID}`,
                { method: 'GET', headers }
            )
        ]);

        const [tokensData, nativeBalanceData] = await Promise.all([tokensResponse.json(), nativeBalanceResponse.json()]);

        const assets: Asset[] = [];

        // Adiciona o BNB à lista de assets
        if (nativeBalanceData.balance) {
            assets.push({
                id: BNB_PLACEHOLDER_ID,
                name: 'BNB',
                ticker: 'BNB',
                network: 'BSC',
                balance: parseFloat(nativeBalanceData.balance) / 10 ** 18, // BNB tem 18 decimais
                priceUsd: 0,
                change24h: 0,
                change7d: 0,
            });
        }

        // Processa os tokens ERC20
        if (Array.isArray(tokensData)) {
            const tokenAssets: Asset[] = tokensData.map((token: any) => ({
                id: token.token_address,
                name: token.name,
                ticker: token.symbol,
                network: 'BSC',
                balance: parseFloat(token.balance) / 10 ** parseInt(token.decimals, 10),
                priceUsd: 0,
                change24h: 0,
                change7d: 0,
            }));

            // Filtra tokens scam/spam que costumam não ter símbolo ou nome e adiciona à lista principal
            assets.push(...tokenAssets.filter(asset => asset.ticker && asset.name));
        } else {
            console.error('Error fetching Moralis token balance:', tokensData);
        }

        return assets;

    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return [];
    }
};

export const getAssetsPricesAndMetadata = async (assets: Asset[]): Promise<Asset[]> => {
    if (assets.length === 0) return [];

    try {
        const bnbAsset = assets.find(asset => asset.id === BNB_PLACEHOLDER_ID);
        const erc20Assets = assets.filter(asset => asset.id !== BNB_PLACEHOLDER_ID);

        const priceMap = new Map<string, { priceUsd: number; change24h: number; change7d: number }>();

        if (erc20Assets.length > 0) {
            for (const asset of erc20Assets) {
                try {
                    const params = new URLSearchParams({ contract_addresses: asset.id, vs_currencies: 'usd', include_24hr_change: 'true' });
                    const url = `${COINGECKO_API_URL}/simple/token_price/binance-smart-chain?${params.toString()}`;
                    const response = await fetch(url);
                    const data = await response.json();

                    const assetAddress = asset.id.toLowerCase();
                    const priceData = data[assetAddress];

                    if (priceData) {
                        priceMap.set(assetAddress, {
                            priceUsd: priceData.usd || 0,
                            change24h: priceData.usd_24h_change || 0,
                            change7d: 0, // A API /simple/token_price não fornece a variação de 7 dias.
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching price for asset ${asset.ticker} (${asset.id}):`, error);
                    // Continua para o próximo ativo em caso de erro
                }
            }
        }

        // Busca de preço para o BNB
        if (bnbAsset) {
            const params = new URLSearchParams({
                ids: 'binancecoin',
                vs_currencies: 'usd',
                include_24hr_change: 'true',
                include_7d_change: 'true'
            });

            const bnbPriceUrl = `${COINGECKO_API_URL}/simple/price?${params.toString()}`;
            const response = await fetch(bnbPriceUrl);
            const data = await response.json();
            const bnbData = data.binancecoin;

            if (bnbData) {
                priceMap.set(BNB_PLACEHOLDER_ID, {
                    priceUsd: bnbData.usd || 0,
                    change24h: bnbData.usd_24h_change || 0,
                    change7d: bnbData.usd_7d_change || 0,
                });
            }
        }

        // Mapeia os preços de volta para os ativos
        return assets.map((asset) => {
            const priceData = priceMap.get(asset.id.toLowerCase());
            return {
                ...asset,
                priceUsd: priceData?.priceUsd || asset.priceUsd,
                change24h: priceData?.change24h || asset.change24h,
                change7d: priceData?.change7d || asset.change7d,
            };
        });

    } catch (error) {
        console.error('Error fetching asset prices:', error);
        return assets;
    }
};