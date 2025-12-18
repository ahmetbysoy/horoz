import { ROOSTER_NAMES, DISTRICTS, COMMENTARY } from '../constants';
import { Task, TaskType, GlobalEventType } from '../types';

export const ContentGenerator = {
  
  generateRoosterName: (): string => {
    const prefixes = [
      "Cyber", "Neo", "Siber", "Jilet", "Rüzgar", "Tekno", "Vortex", "Biyos", 
      "Krom", "Flaş", "Gölge", "Asit", "Metal", "Yıkıcı", "Turbo", "Lazer", "Meka", "Nitro"
    ];
    const suffix = ["X-1", "V2", "Prime", "Zero", "Alpha", "Slayer", "Ghost", "Titan", "Core", "9000", "Pro", "MK-II"];
    
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
      "Termal Görüş", "Şok Dalgası", "Pasif Soğutma", "Optik Kamuflaj", "Sismik Darbe"
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
        "HABER: {district} arenasında yeni bir şampiyon doğuyor!",
        "EKONOMİ: Kristal piyasası bu sabah %{percent} değer kazandı.",
        "SON DAKİKA: {name} isimli horoz, dün gece 5 dövüş üst üste kazandı!",
        "TEKNOLOJİ: Karaköy'de yeni nesil sibernetik kanatlar satışa sunuldu.",
        "SÖYLENTİ: Yeraltı arenalarında efsanevi bir 'Altın Horoz' görüldüğü konuşuluyor.",
        "UYARI: {district} bölgesinde siber devriyeler sıkılaştırıldı.",
        "İLAN: Kayıp horozunu bulana 1000G ödül vaat ediliyor."
      ],
      [GlobalEventType.CYBER_ATTACK]: [
        "SİBER SALDIRI! Şehir ağları kararsız, cüzdanlarınızı koruyun!",
        "KRİTİK HATA: Terminal bağlantıları %{percent} oranında kesildi.",
        "BASKIN: Hacker grupları {district} veri merkezine sızdı!",
        "DİKKAT: Enerji dalgalanmaları horozların çiplerini etkileyebilir."
      ],
      [GlobalEventType.MARKET_CRASH]: [
        "PİYASA ÇÖKTÜ! Altın rezervleri %{percent} eridi.",
        "KAOS: Esnaf kristal yerine takas sistemine geçmeyi düşünüyor.",
        "EKONOMİ: {district} bölgesinde kristal madenciliği durduruldu.",
        "ENFLASYON: Yem fiyatlarına gece yarısı büyük zam geldi!"
      ],
      [GlobalEventType.POLICE_RAID]: [
        "BASKIN! {district} arenası mühürlendi, horoz sahipleri sorgulanıyor.",
        "OPERASYON: Siber-polis illegal implantların peşinde.",
        "SIKI DENETİM: Şehir giriş-çıkışlarında kalkan protokolü aktif edildi.",
        "İHBAR: {name} isimli horozun illegal modifiye edildiği tespit edildi!"
      ],
      [GlobalEventType.BOUNTY_HUNT]: [
        "AV MEVSİMİ: {district} arenasında her zafer için 2x Altın ödülü!",
        "ÖDÜL: {name} horozunu yenene 500G nakit ödül verilecek.",
        "BONUS: Bu gece kazanılan tüm XP miktarları %50 artırıldı!",
        "İLAN: Ödül avcıları yeraltı arenalarında cirit atıyor."
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
    if (!list) return "Tribünler heyecanla bekliyor!";
    return list[Math.floor(Math.random() * list.length)];
  },

  generateDailyTasks: (playerLevel: number): Task[] => {
    return [
      {
        id: `daily_${Date.now()}_1`,
        title: 'Sabah Sporu',
        description: 'Horozunu bugün 2 kez antrenman yaptır.',
        type: TaskType.DAILY,
        requirement: { type: 'train', target: 2, current: 0 },
        reward: { gold: 100 * playerLevel, crystals: 2, xp: 50 },
        completed: false,
        claimed: false
      },
      {
        id: `daily_${Date.now()}_2`,
        title: 'Gladyatör',
        description: 'Herhangi bir arenada 1 dövüş kazan.',
        type: TaskType.DAILY,
        requirement: { type: 'fight', target: 1, current: 0 },
        reward: { gold: 200 * playerLevel, crystals: 5, xp: 100 },
        completed: false,
        claimed: false
      },
       {
        id: `daily_${Date.now()}_3`,
        title: 'Veri Madencisi',
        description: 'Sistem koruması için 2 reklam izle.',
        type: TaskType.DAILY,
        requirement: { type: 'earn', target: 2, current: 0 },
        reward: { gold: 50, crystals: 10, xp: 20 },
        completed: false,
        claimed: false
      }
    ];
  }
};