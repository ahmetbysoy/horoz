import React, { useEffect, useMemo, useState } from 'react';
import { GlobalEconomy, GlobalEventType } from '../types';
import { Modal } from './Modal';
import { useToast } from '../context/ToastContext';

interface MarketIntelPanelProps {
  economy: GlobalEconomy | null;
}

interface MarketStrategy {
  id: string;
  name: string;
  description: string;
  color: string;
  enabled: boolean;
  impact: string;
  winRate: number;
}

interface MarketAlert {
  id: string;
  title: string;
  summary: string;
  type: 'risk' | 'bonus' | 'info';
  strength: number;
  createdAt: number;
  expiresAt: number;
  strategyId: string;
}

const STRATEGIES: MarketStrategy[] = [
  {
    id: 'contraband-watch',
    name: 'Kaçak Takip',
    description: 'Karaborsa hareketlerini izler ve fırsat pencereleri yakalar.',
    color: 'text-red-400',
    enabled: true,
    impact: 'Yüksek',
    winRate: 72,
  },
  {
    id: 'supply-shift',
    name: 'Arz Kayması',
    description: 'Stabilite dalgalanmalarında stok fırsatları üretir.',
    color: 'text-blue-400',
    enabled: true,
    impact: 'Orta',
    winRate: 64,
  },
  {
    id: 'tax-pressure',
    name: 'Vergi Baskısı',
    description: 'Pazar vergisini izler, kârlı alım saatlerini önerir.',
    color: 'text-yellow-400',
    enabled: true,
    impact: 'Orta',
    winRate: 61,
  },
  {
    id: 'event-radar',
    name: 'Olay Radarı',
    description: 'Küresel olayları analiz eder ve riskli anları işaretler.',
    color: 'text-purple-400',
    enabled: true,
    impact: 'Yüksek',
    winRate: 70,
  },
  {
    id: 'bounty-surge',
    name: 'Ödül Dalgası',
    description: 'Savaş ödüllerini artıran dönemleri işaretler.',
    color: 'text-green-400',
    enabled: true,
    impact: 'Düşük',
    winRate: 58,
  },
];

const formatPercent = (value: number) => `%${Math.round(value)}`;

const createAlertId = () => `alert-${Math.random().toString(36).slice(2, 9)}`;

export const MarketIntelPanel: React.FC<MarketIntelPanelProps> = ({ economy }) => {
  const { addToast } = useToast();
  const [strategies, setStrategies] = useState<MarketStrategy[]>(STRATEGIES);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [history, setHistory] = useState<MarketAlert[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [config, setConfig] = useState({
    minStrength: 60,
    maxActive: 6,
    highImpactOnly: false,
    autoArchive: true,
  });

  const marketMood = useMemo(() => {
    const stability = economy?.stabilityIndex ?? 100;
    const volatilityScore = Math.max(0, 100 - stability);
    const volatility = volatilityScore > 70 ? 'KRİTİK' : volatilityScore > 45 ? 'YÜKSEK' : volatilityScore > 25 ? 'ORTA' : 'DÜŞÜK';
    const sentiment = stability > 75 ? 'BULLISH' : stability > 55 ? 'DENGEDE' : stability > 35 ? 'TEMKİNLİ' : 'RİSKLİ';
    const taxPressure = Math.min(100, Math.round((economy?.marketTaxRate ?? 0) * 200));
    return {
      stability,
      volatility,
      volatilityScore,
      sentiment,
      taxPressure,
    };
  }, [economy]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!economy) return;
    const interval = setInterval(() => {
      const enabledStrategies = strategies.filter((strategy) => strategy.enabled);
      if (enabledStrategies.length === 0) return;

      const strategy = enabledStrategies[Math.floor(Math.random() * enabledStrategies.length)];
      const riskScore = Math.max(0, 100 - economy.stabilityIndex);
      const baseStrength = Math.round(55 + riskScore * 0.4 + (economy.status === 'CRITICAL' ? 15 : 0));
      const strength = Math.min(95, baseStrength + Math.round(Math.random() * 10));
      const shouldEmit = strength >= config.minStrength && (!config.highImpactOnly || strength >= 80);
      if (!shouldEmit) return;

      const type: MarketAlert['type'] = riskScore > 60 ? 'risk' : economy.marketTaxRate > 0.2 ? 'bonus' : 'info';
      const durationMs = 1000 * (60 + Math.round(Math.random() * 120));

      const alert: MarketAlert = {
        id: createAlertId(),
        title: `${strategy.name} sinyali`,
        summary: `${economy.status} piyasada ${strategy.description.toLowerCase()}`,
        type,
        strength,
        createdAt: Date.now(),
        expiresAt: Date.now() + durationMs,
        strategyId: strategy.id,
      };

      setAlerts((prev) => [alert, ...prev].slice(0, config.maxActive));
      if (strength >= 80) {
        addToast(`🔔 ${alert.title} (${strength}%)`, 'info');
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [economy, strategies, config, addToast]);

  useEffect(() => {
    if (!config.autoArchive) return;
    if (alerts.length === 0) return;

    const expired = alerts.filter((alert) => now >= alert.expiresAt);
    if (expired.length === 0) return;

    setAlerts((prev) => prev.filter((alert) => now < alert.expiresAt));
    setHistory((prev) => [...expired, ...prev].slice(0, 50));
  }, [alerts, now, config.autoArchive]);

  const toggleStrategy = (id: string) => {
    setStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === id ? { ...strategy, enabled: !strategy.enabled } : strategy
      )
    );
  };

  const archiveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    const found = alerts.find((alert) => alert.id === id);
    if (found) {
      setHistory((prev) => [found, ...prev].slice(0, 50));
    }
  };

  const copyAlert = async (id: string) => {
    const alert = alerts.find((item) => item.id === id);
    if (!alert) return;
    const payload = `📡 ${alert.title}\n${alert.summary}\nGüç: ${alert.strength}%`;
    try {
      await navigator.clipboard.writeText(payload);
      addToast('Sinyal panoya kopyalandı.', 'success');
    } catch (error) {
      addToast('Kopyalama başarısız oldu.', 'warning');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    addToast('Arşiv temizlendi.', 'info');
  };

  const statusLabel = economy?.status ?? 'STABLE';
  const stabilityScore = marketMood.stability;
  const stabilityLabel =
    stabilityScore > 80 ? 'SAĞLAM' : stabilityScore > 60 ? 'DENGELİ' : stabilityScore > 40 ? 'DALGALI' : 'KIRILGAN';

  return (
    <section className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div>
            <div className="text-xs text-gray-400">Pazar Nabzı</div>
            <div className="text-lg font-bold text-white">{statusLabel}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">Canlı İstihbarat</span>
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-xs px-2 py-1 rounded bg-neutral-800 text-gray-300 hover:text-white"
            >
              Ayarlar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
          <div className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 uppercase">Stabilite</div>
            <div className="text-2xl font-bold text-green-400">{formatPercent(stabilityScore)}</div>
            <div className="text-[10px] text-gray-500">{stabilityLabel}</div>
          </div>
          <div className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 uppercase">Vergi Baskısı</div>
            <div className="text-2xl font-bold text-yellow-400">{formatPercent(marketMood.taxPressure)}</div>
            <div className="text-[10px] text-gray-500">Oran: {(economy?.marketTaxRate ?? 0).toFixed(2)}</div>
          </div>
          <div className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 uppercase">Aktif Oyuncu</div>
            <div className="text-2xl font-bold text-purple-400">{economy?.activePlayers ?? 0}</div>
            <div className="text-[10px] text-gray-500">Bugün reklam: {economy?.totalAdViewsToday ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase">Duygu</div>
          <div className="text-sm font-bold text-cyan-400">{marketMood.sentiment}</div>
          <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500" style={{ width: `${marketMood.stability}%` }}></div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase">Volatilite</div>
          <div className="text-sm font-bold text-orange-400">{marketMood.volatility}</div>
          <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500" style={{ width: `${marketMood.volatilityScore}%` }}></div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase">Etkinlik</div>
          <div className="text-sm font-bold text-purple-400">{economy?.currentEvent ?? GlobalEventType.NONE}</div>
          <div className="text-[10px] text-gray-500">Takip modu</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase">Sinyal Yoğunluğu</div>
          <div className="text-sm font-bold text-green-400">{alerts.length}</div>
          <div className="text-[10px] text-gray-500">Arşiv: {history.length}</div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold text-white">Strateji Ağları</div>
            <div className="text-[10px] text-gray-500">Sinyal üretim kanallarını yönet.</div>
          </div>
          <div className="flex gap-2 text-[10px]">
            <button
              onClick={() => setStrategies((prev) => prev.map((item) => ({ ...item, enabled: true })))}
              className="px-2 py-1 rounded bg-green-900/40 text-green-300"
            >
              Hepsini Aç
            </button>
            <button
              onClick={() => setStrategies((prev) => prev.map((item) => ({ ...item, enabled: false })))}
              className="px-2 py-1 rounded bg-red-900/40 text-red-300"
            >
              Hepsini Kapat
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => toggleStrategy(strategy.id)}
              className={`text-left border rounded-lg p-3 transition-colors ${
                strategy.enabled
                  ? 'border-blue-500/50 bg-blue-900/20'
                  : 'border-neutral-800 bg-neutral-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white">{strategy.name}</div>
                <span className={`text-[9px] font-bold ${strategy.color}`}>{strategy.impact}</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">{strategy.description}</div>
              <div className="mt-2 flex justify-between text-[9px] text-gray-400">
                <span>Başarı: {strategy.winRate}%</span>
                <span className={strategy.enabled ? 'text-green-400' : 'text-gray-600'}>
                  {strategy.enabled ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-white">Aktif Sinyaller</div>
              <div className="text-[10px] text-gray-500">{alerts.length} açık sinyal</div>
            </div>
            <span className="text-[10px] text-gray-500">Oto-arşiv: {config.autoArchive ? 'Açık' : 'Kapalı'}</span>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center text-[11px] text-gray-500 py-10">Yeni sinyal bekleniyor...</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const remainingMs = Math.max(alert.expiresAt - now, 0);
                const remainingSec = Math.floor(remainingMs / 1000);
                const strengthOffset = Math.min(100, alert.strength);
                return (
                  <div
                    key={alert.id}
                    className="border border-neutral-800 rounded-lg p-3 bg-neutral-950/60"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{alert.title}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{alert.summary}</div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          alert.type === 'risk'
                            ? 'bg-red-900/40 text-red-300'
                            : alert.type === 'bonus'
                            ? 'bg-green-900/40 text-green-300'
                            : 'bg-blue-900/40 text-blue-300'
                        }`}
                      >
                        {alert.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-[9px] text-gray-500 flex justify-between">
                        <span>Güç</span>
                        <span>{alert.strength}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 relative">
                        <div
                          className="absolute -top-1 w-1.5 h-4 bg-white rounded-full shadow"
                          style={{ left: `calc(${strengthOffset}% - 2px)` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500">
                      <span>Kalan: {remainingSec}s</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyAlert(alert.id)}
                          className="px-2 py-1 rounded bg-neutral-800 text-gray-300 hover:text-white"
                        >
                          Kopyala
                        </button>
                        <button
                          onClick={() => archiveAlert(alert.id)}
                          className="px-2 py-1 rounded bg-neutral-800 text-gray-300 hover:text-white"
                        >
                          Arşivle
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-white">Sinyal Arşivi</div>
              <div className="text-[10px] text-gray-500">Son {history.length} kayıt</div>
            </div>
            <button
              onClick={clearHistory}
              className="text-[10px] px-2 py-1 rounded bg-neutral-800 text-gray-300 hover:text-white"
            >
              Temizle
            </button>
          </div>
          {history.length === 0 ? (
            <div className="text-center text-[11px] text-gray-500 py-10">Henüz kayıt yok.</div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {history.slice(0, 10).map((alert) => (
                <div key={alert.id} className="border border-neutral-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-white">{alert.title}</div>
                      <div className="text-[10px] text-gray-500">{alert.summary}</div>
                    </div>
                    <span className="text-[10px] text-gray-400">{alert.strength}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
        <div className="text-sm font-bold text-yellow-400 mb-2">Risk Uyarısı</div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Bu istihbarat ekranı oyun içi ekonomi simülasyonuna dayanır. Sinyaller bilgilendirme
          amaçlıdır; her zaman kendi stratejini gözden geçirerek hareket et.
        </p>
      </div>

      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="İstihbarat Ayarları">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400">Minimum Sinyal Gücü</label>
            <input
              type="range"
              min={50}
              max={90}
              value={config.minStrength}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, minStrength: Number(event.target.value) }))
              }
              className="w-full mt-2"
            />
            <div className="text-[10px] text-gray-500 mt-1">{config.minStrength}%</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Aktif Sinyal Limiti</label>
            <input
              type="number"
              min={3}
              max={10}
              value={config.maxActive}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, maxActive: Number(event.target.value) }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <label className="flex items-center justify-between text-xs text-gray-300">
            Yalnızca yüksek etkili sinyaller
            <input
              type="checkbox"
              checked={config.highImpactOnly}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, highImpactOnly: event.target.checked }))
              }
            />
          </label>
          <label className="flex items-center justify-between text-xs text-gray-300">
            Süresi dolanları otomatik arşivle
            <input
              type="checkbox"
              checked={config.autoArchive}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, autoArchive: event.target.checked }))
              }
            />
          </label>
        </div>
      </Modal>
    </section>
  );
};
