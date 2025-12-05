import type { Asset } from '../types';

// Documentação:
// - https://docs.moralis.io/web3-data-api/evm/reference/get-wallet-token-balances
// - https://docs.moralis.io/web3-data-api/evm/reference/get-native-balance
// - https://docs.moralis.io/web3-data-api/evm/reference/get-token-price
const MORALIS_API_URL = 'https://deep-index.moralis.io/api/v2.2';
const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY;
const BSC_CHAIN_ID = '0x38'; // 56 em decimal

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
                id: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', // Placeholder para BNB
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
        const tokenAddresses = assets.map(asset => ({ address: asset.id }));

        // A API de preço da Moralis pode buscar múltiplos endereços de uma vez
        const response = await fetch(
            `${MORALIS_API_URL}/erc20/prices?chain=${BSC_CHAIN_ID}`,
            {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'X-API-Key': MORALIS_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tokens: tokenAddresses })
            }
        );

        const data = await response.json();

        // Mapeia os preços retornados para os nossos assets
        // Adiciona uma verificação para garantir que 'data' é um array antes de mapear
        if (!Array.isArray(data)) {
            console.error('Error fetching asset prices, Moralis API did not return an array:', data);
            return assets; // Retorna os ativos sem preços para evitar que a aplicação quebre
        }

        const priceMap = new Map(data.map((item: any) => [item.tokenAddress.toLowerCase(), item]));

        return assets.map((asset) => {
            const priceData: any = priceMap.get(asset.id.toLowerCase());
            return {
                ...asset,
                priceUsd: priceData?.usdPrice || 0,
                // A API de preço da Moralis não retorna a variação de 24h/7d.
                change24h: 0,
                change7d: 0,
            };
        });
    } catch (error) {
        console.error('Error fetching asset prices:', error);
        return assets;
    }
};