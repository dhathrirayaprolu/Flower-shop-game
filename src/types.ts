export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Rainy Night';
export type Weather = 'Sunny' | 'Gentle Breeze' | 'Cozy Rain' | 'Golden Mist';

export type FlowerCategory = 'Focal Bloom' | 'Secondary Bloom' | 'Filler' | 'Greenery / Foliage';

export interface FlowerSpecies {
  id: string;
  name: string;
  scientificName: string;
  category: FlowerCategory;
  season: Season | 'All Year';
  languageOfFlowers: string; // Meaning (e.g. "Devotion and Eternal Love")
  color: string;
  secondaryColor?: string;
  growthTimeSeconds: number; // For the garden
  seedCost: number;
  stemSellValue: number;
  description: string;
  scentProfile: 'Sweet & Floral' | 'Fresh & Herbal' | 'Delicate & Calming' | 'Warm & Spiced' | 'Crisp Citrus';
  iconSvgKey: string;
  palette: {
    petal: string;
    petalShadow: string;
    center: string;
    stem: string;
  };
}

export interface GardenPlot {
  id: number;
  flowerId: string | null;
  plantedAt: number | null; // timestamp ms
  lastWateredAt: number | null;
  growthProgress: number; // 0 to 100
  isWatered: boolean;
  fertilized: boolean;
  stage: 'empty' | 'seed' | 'sprout' | 'bud' | 'blooming' | 'ready_to_harvest';
  quality: 'Normal' | 'Lush' | 'Radiant';
}

export interface PlacedStem {
  uid: string;
  flowerId: string;
  x: number; // -100 to 100 relative offset
  y: number; // -100 to 100 relative offset
  rotation: number; // degrees
  scale: number;
  layer: number;
}

export interface WrapOption {
  id: string;
  name: string;
  cost: number;
  pattern: 'kraft' | 'newspaper' | 'sage_linen' | 'blush_silk' | 'frosted' | 'lavender_tweed';
  color: string;
  textColor: string;
}

export interface RibbonOption {
  id: string;
  name: string;
  cost: number;
  color: string;
  style: 'jute_twine' | 'satin_bow' | 'velvet_ribbon' | 'gold_thread';
}

export interface CardTagOption {
  id: string;
  title: string;
  note: string;
  icon: string;
}

export interface BouquetCreation {
  id: string;
  name: string;
  stems: PlacedStem[];
  wrap: WrapOption;
  ribbon: RibbonOption;
  cardTag: CardTagOption | null;
  harmonyScore: number;
  createdAt: number;
  value: number;
}

export interface Customer {
  id: string;
  name: string;
  avatarSeed: string;
  title: string;
  story: string;
  requestText: string;
  desiredTheme: string; // e.g. "Warm & Loving", "Apology & Comfort", "Wildflower Whimsy"
  requiredColors?: string[];
  preferredFlowers?: string[];
  minStems: number;
  budget: number;
  dialogueHappy: string;
  dialogueDelighted: string;
  dialogueNeutral: string;
  friendshipLevel: number;
}

export interface CustomerOrder {
  orderId: string;
  customer: Customer;
  timeRemaining?: number;
  isCustomRequest: boolean;
  status: 'waiting' | 'in_progress' | 'completed' | 'declined';
  bonusReward?: number;
}

export interface ShopUpgrade {
  id: string;
  name: string;
  category: 'shelves' | 'garden' | 'decor' | 'music' | 'ambience';
  cost: number;
  description: string;
  unlocked: boolean;
  icon: string;
  benefit: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardCoins: number;
  rewardSeeds?: string;
  completed: boolean;
  claimed: boolean;
}

export interface GameState {
  coins: number;
  bloomTokens: number;
  reputationHearts: number;
  day: number;
  season: Season;
  timeOfDay: TimeOfDay;
  weather: Weather;
  inventory: Record<string, number>; // flowerId -> stem count
  seedInventory: Record<string, number>; // flowerId -> seed count
  gardenPlots: GardenPlot[];
  unlockedFlowerIds: string[];
  unlockedUpgrades: string[];
  currentOrders: CustomerOrder[];
  completedOrdersCount: number;
  totalBouquetsCrafted: number;
  activeBouquet: {
    stems: PlacedStem[];
    wrap: WrapOption;
    ribbon: RibbonOption;
    cardTag: CardTagOption | null;
  };
  dailyQuests: DailyQuest[];
  catHappiness: number;
  lastCatPetAt: number;
  bgmPlaying: boolean;
  bgmVolume: number;
  sfxVolume: number;
  ambientRainVolume: number;
  selectedBgmTrack: string;
}
