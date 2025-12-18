import { ROOSTER_NAMES, DISTRICTS, COMMENTARY } from '../constants';
import { Task, TaskType, GlobalEventType } from '../types';

export const ContentGenerator = {
  
  generateRoosterName: (): string => {
    const prefixes = [
      "Cyber", "Neo", "Siber", "Jilet", "Rüzgar", "Tekno", "Vortex", "Biyos", 
      "Krom", "Flaş", "Gölge", "Asit", "Metal", "Yıkıcı", "Turbo", "Lazer", "Meka"
    ];
    const suffix = ["X-1", "V2", "Prime", "Zero", "Alpha", "Slayer", "Ghost", "Titan", "Core", "9000", "Pro"];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const roosterName = ROOSTER_NAMES[Math.floor(Math.random() * ROOSTER_NAMES.length)];
    const useSuffix = Math.random() > 0.6;

    return `${prefix} ${roosterName}${useSuffix ? ' ' + suffix[Math.floor(Math.random() * suffix.length)] : ''}`;
  },

  generateTraits: (count: number = 1): string[] => {
    const traitList = [
      "Sinyal Bozucu", "Aşırı Voltaj", "Sokak Bilgesi", "Metalik Zırh", 
      "Gözü Kara", "Hızlı Pençe", "Gece Görüşü", "Veri Hırsızı",
      "Kablolu Bağlantı", "Siber Öfke", "Nanobot Onarımı", "Turbo Motor",
      "Termal Görüş", "Şok Dalgası", "Pasif Soğutma", "Optik Kamuflaj"
    ];
    const result: string[] = [];
    while(result.length < count) {
        const t = traitList[Math.floor(Math.random() * traitList.length)];
        if(!result.includes(t)) result.push(t);
    }
    return result;
  },

  generateNewsHeadline: (currentEvent: GlobalEventType = GlobalEventType.NONE): string => {
    const eventTemplates: Record<GlobalEventType, string[]> = {
      [GlobalEventType.NONE]: [
        "SON DAKİKA: {district} bölgesinde siber devriyeler artırıldı.",
        "EKONOMİ: Kristal piyasası bugün durgun, yatırımcılar beklemede.",
        "TURNUVA: {district} arenasında büyük bahis gecesi başlıyor!",
        "İLAN: {name} adlı horozun sahibi her düelloyu kazanıyor!",
        "SÖYLENTİ: Yeraltı metrosunda efsanevi bir yumurta görüldü.",
        "TEKNOLOJİ: Yeni nesil çelik mahmuzlar Karaköy'e ulaştı.",
        "METEOROLOJİ: Şehir üzerinde asit yağmuru bekleniyor, horozları içeride tutun."
      ],
      [GlobalEventType.CYBER_ATTACK]: [
        "SİBER SALDIRI! Terminal bağlantıları kararsız, cüzdanlar risk altında.",
        "KRİTİK HATA: Sistem stabilitesi %{percent} düştü!",
        "GÜVENLİK İHLALİ: {district} veri merkezine sızıldı!",
        "DİKKAT: Enerji dalgalanmaları horozların çiplerini etkiliyor."
      ],
      [GlobalEventType.MARKET_CRASH]: [
        "PİYASA ÇÖKTÜ! Altın rezervleri eriyor, esnaf barter sistemine döndü.",
        "ENFLASYON ŞOKU: Yem fiyatları %{percent} zamlandı!",
        "EKONOMİ: {district} pazarında kristal kıtlığı yaşanıyor.",
        "KAOS: Banka önlerinde uzun kuyruklar oluştu, sistem çöktü."
      ],
      [GlobalEventType.POLICE_RAID]: [
        "BASKIN! {district} arenası mühürlendi, horoz sahipleri kaçıyor.",
        "OPERASYON: Emniyet güçleri illegal çiplerin peşinde.",
        "SIKI DENETİM: Şehir genelinde kalkan protokolü devreye alındı.",
        "İHBAR: {name} adlı horozun illegal implantları tespit edildi."
      ],
      [GlobalEventType.BOUNTY_HUNT]: [
        "AV BAŞLADI! {district} arenasında her kafa için ekstra altın.",
        "ÖDÜL: {name} horozunu yenene 500G nakit para!",
        "BONUS: Bu gece kazanılan XP miktarı %50 artırıldı.",
        "BAHİS: Şehirdeki tüm yeraltı arenaları ödül havuzunu birleştirdi."
      ]
    };

    const templates = eventTemplates[currentEvent] || eventTemplates[GlobalEventType.NONE];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)].name;
    const name = ROOSTER_NAMES[Math.floor(Math.random() * ROOSTER_NAMES.length)];
    const percent = Math.floor(Math.random() * 40) + 10;

    return template
      .replace('{district}', district)
      .replace('{name}', name)
      .replace('{percent}', percent.toString());
  },

  getCommentary: (type: 'START' | 'HIT' | 'CRITICAL' | 'MISS' | 'SPECIAL' | 'WIN'): string => {
    const list = COMMENTARY[type];
    if (!list) return "Tribünler ayağa kalktı!";
    return list[Math.floor(Math.random() * list.length)];
  },

  generateDailyTasks: (playerLevel: number): Task[] => {
    return [
      {
        id: `daily_${Date.now()}_1`,
        title: 'Sabah İdmanı',
        description: 'Horozunu 2 kez antrenman yaptır.',
        type: TaskType.DAILY,
        requirement: { type: 'train', target: 2, current: 0 },
        reward: { gold: 80 * playerLevel, crystals: 1, xp: 40 },
        completed: false,
        claimed: false
      },
      {
        id: `daily_${Date.now()}_2`,
        title: 'Sokak Dövüşçüsü',
        description: 'Herhangi bir arenada 1 dövüş kazan.',
        type: TaskType.DAILY,
        requirement: { type: 'fight', target: 1, current: 0 },
        reward: { gold: 150 * playerLevel, crystals: 3, xp: 80 },
        completed: false,
        claimed: false
      },
       {
        id: `daily_${Date.now()}_3`,
        title: 'Veri Madenciliği',
        description: '2 reklam izleyerek sistemi destekle.',
        type: TaskType.DAILY,
        requirement: { type: 'earn', target: 2, current: 0 },
        reward: { gold: 50, crystals: 8, xp: 10 },
        completed: false,
        claimed: false
      }
    ];
  }
};