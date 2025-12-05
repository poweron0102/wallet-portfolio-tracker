import { useState, useMemo, useEffect } from 'react';
import {
  Wallet,
  Menu,
  ChevronDown,
  TrendingUp,
  LayoutDashboard,
  History,
  CreditCard,
  Ghost,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FIAT_RATES, getAssets, TIME_RANGES } from './data';
import { generateChartData } from './utils';
import { AssetRow, Modal, SidebarItem, WalletOption } from './components';
import type { Asset, ConnectedWallet, FiatCurrency, SubItem } from './types';
import {hexToBech32} from "./crypto";


export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedFiat, setSelectedFiat] = useState<FiatCurrency>('BRL');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [activeTab, setActiveTab] = useState<'balance' | 'history'>('balance');
  const [selectedNetwork, setSelectedNetwork] = useState('ALL');
  const [chartRange, setChartRange] = useState('1M');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      if (connectedWallets.length > 0) {
        const fetchedAssets = await getAssets(connectedWallets);
        setAssets(fetchedAssets);
      } else {
        setAssets([]);
      }
    };

    fetchAssets();
  }, [connectedWallets]);

  const handleConnect = async (walletName: 'MetaMask' | 'Phantom' | 'Yoroi') => {
    try {
      let address: string | null = null;

      if (walletName === 'MetaMask') {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address = accounts[0];
        } else {
          throw new Error('MetaMask não está instalado. Por favor, instale a extensão.');
        }
      } else if (walletName === 'Phantom') {
        if (window.solana && window.solana.isPhantom) {
          const response = await window.solana.connect();
          address = response.publicKey.toString();
        } else {
          throw new Error('Phantom não está instalado. Por favor, instale a extensão.');
        }
      } else if (walletName === 'Yoroi') {
        // A API da Yoroi pode ser mais complexa e este é um exemplo simplificado.
        if (window.cardano && window.cardano.yoroi) {
          const api = await window.cardano.yoroi.enable();
          let hexAddresses = await api.getUsedAddresses();

          // Se não houver endereços usados, pega um endereço não utilizado
          if (hexAddresses.length === 0) {
            hexAddresses = await api.getUnusedAddresses();
          }

          if (hexAddresses.length > 0) {
            // // Decodifica o endereço de Hex (CBOR) para bech32.
            // // É necessário converter a string hexadecimal para um buffer de bytes primeiro.
            // const addressBytes = Buffer.from(hexAddresses[0], 'hex');
            const cardanoAddress = hexToBech32(hexAddresses[0]);
            address = cardanoAddress;
          } else {
            throw new Error('Nenhum endereço encontrado na carteira Yoroi.');
          }
        } else {
          throw new Error('Yoroi não está instalado. Por favor, instale a extensão.');
        }
      }

      if (address && !connectedWallets.some(w => w.name === walletName)) {
        setConnectedWallets(prev => [...prev, { name: walletName, address: address as string }]);
      }
      setIsWalletModalOpen(false);
    } catch (error) {
      console.error(`Falha ao conectar com ${walletName}:`, error);
      alert(`Não foi possível conectar com ${walletName}. Verifique o console para mais detalhes.`);
    }
  };

  const handleDisconnect = (walletName: 'MetaMask' | 'Phantom' | 'Yoroi') => {
    if (window.confirm(`Tem certeza que deseja desconectar a carteira ${walletName}?`)) {
      setConnectedWallets(prev => prev.filter(w => w.name !== walletName));
      if (selectedNetwork === walletToNetworkMap[walletName]) {
        setSelectedNetwork('ALL');
      }
    }
  };

  const filteredAssets = useMemo(() => {
    if (selectedNetwork === 'ALL') return assets;
    return assets.filter(a => a.network === selectedNetwork);
  }, [selectedNetwork, assets]);

  const totalValue = filteredAssets.reduce((acc, curr) => {
    return acc + (curr.balance * curr.priceUsd * FIAT_RATES[selectedFiat].rate);
  }, 0);

  // Dados do gráfico reativos
  const chartData = useMemo(() => generateChartData(selectedNetwork, chartRange), [selectedNetwork, chartRange]);

  const walletToNetworkMap: Record<string, string> = {
    MetaMask: 'ETH', // MetaMask pode controlar ETH e BSC
    Phantom: 'SOLANA',
    Yoroi: 'CARDANO',
  };

  const availableNetworks = useMemo(() : SubItem[] => {
    const networks: SubItem[] = [{ key: 'ALL', label: 'Total (Todas)' }];
    const connectedWalletNames = connectedWallets.map(w => w.name);

    if (connectedWalletNames.includes('MetaMask')) {
      networks.push({ key: 'ETH', label: 'Ethereum' });
      networks.push({ key: 'BSC', label: 'BSC' });
    }
    if (connectedWalletNames.includes('Phantom')) {
      networks.push({ key: 'SOLANA', label: 'Solana' });
    }
    if (connectedWalletNames.includes('Yoroi')) {
      networks.push({ key: 'CARDANO', label: 'Cardano' });
    }
    return networks;
  }, [connectedWallets]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
              <Menu />
            </button>
          </div>
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Wallet className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
            Wallet Portfolio Tracker
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Fiat Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium py-2 px-4 rounded-full border border-slate-700 transition-all">
              <span>{selectedFiat}</span>
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-24 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block animate-in fade-in zoom-in duration-150">
              {(Object.keys(FIAT_RATES) as FiatCurrency[]).map(fiat => (
                <button
                  key={fiat}
                  onClick={() => setSelectedFiat(fiat)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 ${selectedFiat === fiat ? 'text-indigo-400' : 'text-slate-300'}`}
                >
                  {fiat}
                </button>
              ))}
            </div>
          </div>

          {/* Connect Button */}
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-6 rounded-full text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <CreditCard size={16} /> Carteiras
          </button>
        </div>
      </header>

      <div className="flex pt-20 h-screen overflow-hidden">

        {/* --- SIDEBAR --- */}
        <aside className={`fixed md:relative z-30 w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col p-4 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="mb-6 px-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Principal</p>
            </div>

            <SidebarItem
              icon={LayoutDashboard}
              label="Saldo Atual"
              isActive={activeTab === 'balance'}
              onClick={() => setActiveTab('balance')}
              hasSubmenu={availableNetworks.length > 1}
              subItems={availableNetworks}
              currentSub={selectedNetwork}
              onSubClick={setSelectedNetwork}
            />

            <SidebarItem
              icon={History}
              label="Histórico"
              isActive={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              hasSubmenu={availableNetworks.length > 1}
              subItems={availableNetworks}
              currentSub={selectedNetwork}
              onSubClick={setSelectedNetwork}
            />
          </div>

          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Status da Rede</p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Operacional
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 custom-scrollbar">

          <div className="max-w-7xl mx-auto">
            {/* Header Content */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {activeTab === 'balance' ? 'Visão Geral do Portfólio' : 'Análise Histórica'}
              </h2>
              <div className="text-slate-400 flex items-center gap-4">
                <span>
                  Visualizando dados da rede: <span className="text-indigo-400 font-semibold">{selectedNetwork === 'ALL' ? 'Todas as Redes' : selectedNetwork}</span>
                </span>
                {selectedNetwork !== 'ALL' && connectedWallets.find(w => walletToNetworkMap[w.name] === selectedNetwork || (selectedNetwork === 'BSC' && w.name === 'MetaMask')) && (
                  <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/50 px-2 py-1 rounded">
                    <span className="text-slate-500">Conectado com:</span>
                    <span className="text-indigo-400">{connectedWallets.find(w => walletToNetworkMap[w.name] === selectedNetwork || (selectedNetwork === 'BSC' && w.name === 'MetaMask'))?.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Total Balance Card (Shown in both views) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 border border-indigo-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet size={120} />
                </div>
                <p className="text-indigo-300 font-medium mb-1 relative z-10">Saldo Estimado Total</p>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 relative z-10">
                  {FIAT_RATES[selectedFiat].symbol} {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <div className="flex items-center gap-2 relative z-10">
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
                    <TrendingUp size={14} /> +4.2%
                  </span>
                  <span className="text-slate-400 text-sm">nas últimas 24h</span>
                </div>
              </div>

              {/* Mini Stats */}
              <div className="space-y-6">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Lucro 7D</p>
                    <p className="text-lg font-bold text-emerald-400">+{FIAT_RATES[selectedFiat].symbol} 1,240.00</p>
                  </div>
                  <TrendingUp className="text-emerald-500/50" />
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Ativos Totais</p>
                    <p className="text-lg font-bold text-white">{filteredAssets.length}</p>
                  </div>
                  <CreditCard className="text-indigo-500/50" />
                </div>
              </div>
            </div>

            {/* --- BALANCE VIEW --- */}
            {activeTab === 'balance' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white">Seus Ativos</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-950/50 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-4 pl-4 text-left">Ativo / Rede</th>
                          <th className="py-4 text-right">Quantidade</th>
                          <th className="py-4 text-right">Preço ({selectedFiat})</th>
                          <th className="py-4 pr-4 text-right">Valor / Variação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssets.map(asset => (
                          <AssetRow
                            key={asset.id}
                            asset={asset}
                            fiatRate={FIAT_RATES[selectedFiat].rate}
                            fiatSymbol={FIAT_RATES[selectedFiat].symbol}
                          />
                        ))}
                        {filteredAssets.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-500">
                              Nenhum ativo encontrado nesta rede.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* --- HISTORY VIEW --- */}
            {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h3 className="text-lg font-bold text-white">Performance do Portfólio</h3>

                    {/* Time Range Selector */}
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {TIME_RANGES.map(range => (
                        <button
                          key={range}
                          onClick={() => setChartRange(range)}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${chartRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#475569"
                          tick={{fill: '#475569'}}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#475569"
                          tick={{fill: '#475569'}}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${FIAT_RATES[selectedFiat].symbol}${value/1000}k`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                          formatter={(value: number) => [`${FIAT_RATES[selectedFiat].symbol} ${value.toLocaleString()}`, 'Valor']}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Wallet Modal */}
      <Modal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} title="Gerenciar Carteiras">
        <p className="text-slate-400 mb-6">Selecione uma carteira para conectar ao Wallet Portfolio Tracker.</p>

        <WalletOption
          name="MetaMask"
          icon={<Globe className="text-orange-500" />}
          color="bg-orange-500"
          onClick={() => handleConnect('MetaMask')}
          onDisconnect={() => handleDisconnect('MetaMask')}
          isConnected={!!connectedWallets.find(w => w.name === 'MetaMask')}
          address={connectedWallets.find(w => w.name === 'MetaMask')?.address}
        />
        <WalletOption
          name="Phantom"
          icon={<Ghost className="text-purple-500" />}
          color="bg-purple-500"
          onClick={() => handleConnect('Phantom')}
          onDisconnect={() => handleDisconnect('Phantom')}
          isConnected={!!connectedWallets.find(w => w.name === 'Phantom')}
          address={connectedWallets.find(w => w.name === 'Phantom')?.address}
        />
        <WalletOption
          name="Yoroi"
          icon={<ShieldCheck className="text-red-500" />}
          color="bg-red-500"
          onClick={() => handleConnect('Yoroi')}
          onDisconnect={() => handleDisconnect('Yoroi')}
          isConnected={!!connectedWallets.find(w => w.name === 'Yoroi')}
          address={connectedWallets.find(w => w.name === 'Yoroi')?.address}
        />

        <p className="text-xs text-center text-slate-500 mt-4">
          Ao conectar, você aceita nossos Termos de Serviço e Política de Privacidade.
        </p>
      </Modal>

    </div>
  );
}

// Adiciona as definições de tipo para as APIs das carteiras no objeto window
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    cardano?: any;
  }
}
