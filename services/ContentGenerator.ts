import { ROOSTER_NAMES, DISTRICTS, COMMENTARY } from '../constants';
import { Task, TaskType, GlobalEventType } from '../types';

export const ContentGenerator = {
  
  generateRoosterName: (): string => {
    const prefixes = ["Neo", "Siber", "Jilet", "Rüzgar", "Hızlı", "Zalim", "Tekno", "Asit", "Metal", "Yıkıcı", "Vortex", "Biyos", "Krom", "Flaş"];
    const suffix = ["X-1", "V2", "Prime", "Zero", "Alpha", "Slayer", "Ghost", "Titan"];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const roosterName = ROOSTER_NAMES[Math.floor(Math.random() * ROOSTER_NAMES.length)];
    const useSuffix = Math.random() > 0.8;

    return `${prefix} ${roosterName}${useSuffix ? ' ' + suffix[Math.floor(Math.random() * suffix.length)] : ''}`;
  },

  generateTraits: (count: number = 1): string[] => {
    const traitList = [
      "Sinyal Bozucu", "Aşırı Voltaj", "Sokak Bilgesi", "Metalik Zırh", 
      "Gözü Kara", "Hızlı Pençe", "Gece Görüşü", "Veri Hırsızı",
      "Kablolu Bağlantı", "Siber Öfke", "Nanobot Onarımı", "Turbo Motor"
    ];
    const result: string[] = [];
    for(let i=0; i<count; i++) {
        const t = traitList[Math.floor(Math.random() * traitList.length)];
        if(!result.includes(t)) result.push(t);
    }
    return result;
  },

  generateNewsHeadline: (currentEvent: GlobalEventType = GlobalEventType.NONE): string => {
    const eventTemplates: Record<GlobalEventType, string[]> = {
      [GlobalEventType.NONE]: [
        "SON DAKİKA: {district} bölgesinde polis baskını! 50 horoz gözaltında.",
        "EKONOMİ: Kristal borsası bugün %{percent} değer kazandı.",
        "YER ALTI: {district} arenasında efsanevi bir maç gerçekleşti.",
        "TEKNOLOJİ: Maslak Cyberpark'ta yeni bir sibernetik kanat geliştirildi.",
        "SÖYLENTİ: {name} adlı horozun yenilmezliği konuşuluyor!",
        "İLAN: {district} arenasındaki turnuva için bahisler açıldı.",
        "UYARI: Enerji dalgalanmaları bekleniyor, kalkanlarınızı aktif tutun."
      ],
      [GlobalEventType.CYBER_ATTACK]: [
        "SİBER SALDIRI! Banka sistemleri kilitlendi, kristal çekimleri askıda.",
        "BÜYÜK GLITCH: Pazar fiyatları kontrolden çıktı!",
        "VERİ SIZINTISI: {name} sahibinin tüm taktikleri darkweb'e düştü!",
        "DİKKAT: Cüzdanlarınızı soğuk depolamaya alın, saldırı devam ediyor."
      ],
      [GlobalEventType.MARKET_CRASH]: [
        "BORSA ÇÖKTÜ! Altın rezervleri eriyor, herkes elindekini satıyor.",
        "EKONOMİK BUHRAN: Karaköy pazarında esnaf kepenk indirdi.",
        "PANİK: {district} esnafı kristal yerine buğday kabul etmeye başladı.",
        "ENFLASYON ŞOKU: Yem fiyatları iki katına çıktı!"
      ],
      [GlobalEventType.POLICE_RAID]: [
        "BÜYÜK TEMİZLİK: Emniyet güçleri yeraltı arenalarını mühürlüyor.",
        "KAÇIŞ! {district} bölgesindeki bahis salonlarına operasyon.",
        "İHBAR: {name} adlı horoz sahibinin illegal çip kullandığı tespit edildi.",
        "SIKIYÖNETİM: Maslak dışındaki tüm bölgelerde devriyeler artırıldı."
      ],
      [GlobalEventType.BOUNTY_HUNT]: [
        "ÖDÜL GECESİ: {district} arenasında her zafer iki kat kazandırıyor!",
        "ARANIYOR: {name} adlı horozu yenenlere büyük ödül!",
        "KAPIŞMA: Bu gece en çok kazanan 10 oyuncu ekstra kristal alacak.",
        "AV BAŞLADI: {district} sokaklarında yüksek seviyeli rakipler görüldü."
      ]
    };

    const templates = eventTemplates[currentEvent] || eventTemplates[GlobalEventType.NONE];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)].name;
    const name = ROOSTER_NAMES[Math.floor(Math.random() * ROOSTER_NAMES.length)];
    const percent = Math.floor(Math.random() * 20) + 5;

    return template
      .replace('{district}', district)
      .replace('{name}', name)
      .replace('{percent}', percent.toString());
  },

  getCommentary: (type: 'START' | 'HIT' | 'CRITICAL' | 'MISS' | 'SPECIAL' | 'WIN'): string => {
    const list = COMMENTARY[type];
    if (!list) return "Arenadan sesler yükseliyor...";
    return list[Math.floor(Math.random() * list.length)];
  },

  generateDailyTasks: (playerLevel: number): Task[] => {
    return [
      {
        id: `daily_${Date.now()}_1`,
        title: 'Antrenman Günü',
        description: 'Horozunu 3 kez antrenman yaptır.',
        type: TaskType.DAILY,
        requirement: { type: 'train', target: 3, current: 0 },
        reward: { gold: 100 * playerLevel, crystals: 2, xp: 50 },
        completed: false,
        claimed: false
      },
      {
        id: `daily_${Date.now()}_2`,
        title: 'Arena Tozu',
        description: '2 arena dövüşü kazan.',
        type: TaskType.DAILY,
        requirement: { type: 'fight', target: 2, current: 0 },
        reward: { gold: 200 * playerLevel, crystals: 5, xp: 100 },
        completed: false,
        claimed: false
      },
       {
        id: `daily_${Date.now()}_3`,
        title: 'Reklam Desteği',
        description: 'Sistemi desteklemek için 3 reklam izle.',
        type: TaskType.DAILY,
        requirement: { type: 'earn', target: 3, current: 0 },
        reward: { gold: 50, crystals: 10, xp: 20 },
        completed: false,
        claimed: false
      }
    ];
  }
};