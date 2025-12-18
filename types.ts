// Enums
export enum RoosterRank {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC'
}

export enum BreedType {
  DENIZLI = 'Denizli',
  HINT = 'Hint',
  ASEEL = 'Aseel',
  SHAMO = 'Shamo',
  BRAHMA = 'Brahma',
  GERZE = 'Gerze',
  SUMATRA = 'Sumatra',
  MODERN_GAME = 'Modern Game',
  PHOENIX = 'Phoenix',
  AYAM_CEMANI = 'Ayam Cemani'
}

export enum ElementType {
  IRON = 'IRON',
  WIND = 'WIND',
  FIRE = 'FIRE',
  EARTH = 'EARTH',
  POISON = 'POISON'
}

export enum ItemType {
  CONSUMABLE = 'CONSUMABLE',
  EQUIPMENT = 'EQUIPMENT',
  BOOSTER = 'BOOSTER',
  EGG = 'EGG',
  ILLEGAL = 'ILLEGAL'
}

export enum TaskType {
  DAILY = 'DAILY',
  ACHIEVEMENT = 'ACHIEVEMENT'
}

export enum GlobalEventType {
  NONE = 'NONE',
  CYBER_ATTACK = 'CYBER_ATTACK', // Crystal prices spike
  MARKET_CRASH = 'MARKET_CRASH', // Gold prices drop
  POLICE_RAID = 'POLICE_RAID',   // High risk in illegal activities
  BOUNTY_HUNT = 'BOUNTY_HUNT'    // Double XP/Gold in combat
}

// Interfaces
export interface Stats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
  criticalChance: number;
}

export interface Rooster {
  id: string;
  name: string;
  breed: BreedType;
  rank: RoosterRank;
  element: ElementType;
  level: number;
  xp: number;
  maxXp: number;
  stats: Stats;
  energy: number;
  hunger: number;
  hygiene: number;
  mood: number;
  traits: string[];
  visualSeed: string;
  matchesWon: number;
  matchesLost: number;
  createdAt: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  effect?: {
    stat?: keyof Stats | 'energy' | 'hunger' | 'hygiene' | 'mood';
    value: number;
    duration?: number;
  };
  price: number;
  image?: string;
  rarity: RoosterRank;
}

export interface InventoryItem extends Item {
  quantity: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  requirement: {
    type: 'fight' | 'train' | 'breed' | 'earn';
    target: number;
    current: number;
  };
  reward: {
    gold: number;
    crystals: number;
    xp: number;
  };
  completed: boolean;
  claimed: boolean;
}

export interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  dueDate: number;
  isPaid: boolean;
}

export interface PlayerStats {
  totalBattles: number;
  wins: number;
  losses: number;
  totalAdViews: number;
  lastLogin: number;
  totalGoldSpent: number;
  totalCrystalsSpent: number;
  maxDamageDealt: number;
  highestLevelReached: number;
}

export interface Player {
  id: string;
  username: string;
  title: string;
  level: number;
  xp: number;
  gold: number;
  crystals: number;
  prestige: number;
  roosters: Rooster[];
  inventory: InventoryItem[];
  tasks: Task[];
  loans: Loan[];
  stats: PlayerStats;
  settings: {
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  };
  shieldExpiresAt: number;
}

export interface GlobalEconomy {
  dailyCrystalPool: number;
  claimedCrystals: number;
  activePlayers: number;
  totalAdViewsToday: number;
  stabilityIndex: number;
  lastDrainTime: number;
  nextDrainTime: number;
  marketTaxRate: number;
  status: 'STABLE' | 'VOLATILE' | 'CRITICAL' | 'DRAINING';
  currentEvent: GlobalEventType;
}

export interface CombatRound {
  attackerId: string;
  defenderId: string;
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
  logMessage: string;
  attackerHealthRemaining: number;
  defenderHealthRemaining: number;
}

export interface CombatResult {
  winnerId: string;
  loserId: string;
  rounds: CombatRound[];
  rewards: {
    gold: number;
    xp: number;
    item?: Item;
  };
}

export interface CombatSession {
    id: string;
    playerRooster: Rooster;
    enemyRooster: Rooster;
    result: CombatResult | null;
    isActive: boolean;
}