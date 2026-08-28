import React, { useState, useEffect, useRef } from 'react';
import { 
  GameState, 
  CustomerOrder, 
  PlacedStem, 
  WrapOption, 
  RibbonOption, 
  CardTagOption,
  Season,
  TimeOfDay,
  Weather,
  GardenPlot
} from './types';
import { ALL_FLOWERS, FLOWERS_BY_ID, SEASONS_LIST } from './data/flowers';
import { 
  INITIAL_CUSTOMERS, 
  WRAP_OPTIONS, 
  RIBBON_OPTIONS, 
  CARD_TAGS, 
  DAILY_QUESTS_POOL 
} from './data/customers';
import { Header } from './components/Header';
import { ShopFront } from './components/ShopFront';
import { BouquetStudio } from './components/BouquetStudio';
import { BotanicalGarden } from './components/BotanicalGarden';
import { FlowerGrimoire } from './components/FlowerGrimoire';
import { ShopUpgradesView } from './components/ShopUpgrades';
import { DaySummaryModal } from './components/DaySummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { soundManager } from './audio/soundManager';

const STORAGE_KEY = 'bloom_and_thread_cozy_save_v1';

const createInitialState = (): GameState => {
  const initialPlots: GardenPlot[] = Array.from({ length: 6 }, (_, i) => {
    if (i === 0) {
      return {
        id: 0,
        flowerId: 'tulip_blush',
        plantedAt: Date.now() - 10000,
        lastWateredAt: Date.now(),
        growthProgress: 80,
        isWatered: true,
        fertilized: false,
        stage: 'bud',
        quality: 'Normal',
      };
    }
    if (i === 1) {
      return {
        id: 1,
        flowerId: 'daisy_meadow',
        plantedAt: Date.now() - 15000,
        lastWateredAt: Date.now(),
        growthProgress: 100,
        isWatered: true,
        fertilized: false,
        stage: 'ready_to_harvest',
        quality: 'Lush',
      };
    }
    return {
      id: i,
      flowerId: null,
      plantedAt: null,
      lastWateredAt: null,
      growthProgress: 0,
      isWatered: false,
      fertilized: false,
      stage: 'empty',
      quality: 'Normal',
    };
  });

  const initialOrders: CustomerOrder[] = INITIAL_CUSTOMERS.slice(0, 3).map((c, idx) => ({
    orderId: 'order_' + idx + '_' + c.id,
    customer: c,
    isCustomRequest: true,
    status: 'waiting',
  }));

  const initialQuests = DAILY_QUESTS_POOL.slice(0, 4).map((q, idx) => ({
    ...q,
    id: 'quest_' + idx,
    progress: 0,
    completed: false,
    claimed: false,
  }));

  return {
    coins: 180,
    bloomTokens: 25,
    reputationHearts: 12,
    day: 1,
    season: 'Spring',
    timeOfDay: 'Morning',
    weather: 'Sunny',
    inventory: {
      tulip_blush: 4,
      daisy_meadow: 5,
      rose_vintage: 3,
      lavender_provence: 4,
      eucalyptus_silver: 4,
      babys_breath: 6,
      fern_woodland: 3,
    },
    seedInventory: {
      tulip_blush: 5,
      daisy_meadow: 5,
      cherry_blossom: 3,
      lavender_provence: 4,
      sunflower_golden: 4,
      chamomile_tea: 4,
      rose_vintage: 3,
    },
    gardenPlots: initialPlots,
    unlockedFlowerIds: ALL_FLOWERS.map(f => f.id),
    unlockedUpgrades: [],
    currentOrders: initialOrders,
    completedOrdersCount: 0,
    totalBouquetsCrafted: 0,
    activeBouquet: {
      stems: [],
      wrap: WRAP_OPTIONS[0],
      ribbon: RIBBON_OPTIONS[0],
      cardTag: CARD_TAGS[0],
    },
    dailyQuests: initialQuests,
    catHappiness: 50,
    lastCatPetAt: 0,
    bgmPlaying: false,
    bgmVolume: 0.5,
    sfxVolume: 0.7,
    ambientRainVolume: 0.3,
    selectedBgmTrack: 'Rainy Tea at 4PM',
  };
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return createInitialState();
  });

  const [activeTab, setActiveTab] = useState<'shop' | 'studio' | 'garden' | 'grimoire' | 'upgrades'>('shop');
  const [activeOrder, setActiveOrder] = useState<CustomerOrder | null>(null);
  const [isDaySummaryOpen, setIsDaySummaryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Save game state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {
      // Ignore
    }
  }, [gameState]);

  // Real-time Botanical Garden Growth Engine (runs every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const hasMisting = prev.unlockedUpgrades.includes('upgrade_misting_system');
        let anyChanged = false;

        const updatedPlots = prev.gardenPlots.map(plot => {
          if (!plot.flowerId || plot.stage === 'empty' || plot.stage === 'ready_to_harvest') {
            return plot;
          }

          const flower = FLOWERS_BY_ID[plot.flowerId];
          if (!flower) return plot;

          // If soil is watered, it grows
          // Automatic misting upgrade keeps it growing continuously
          const isGrowing = plot.isWatered || hasMisting;
          if (!isGrowing) return plot;

          anyChanged = true;
          const speedMultiplier = (plot.fertilized ? 1.6 : 1.0) * (hasMisting ? 1.25 : 1.0);
          const growthIncrement = (100 / flower.growthTimeSeconds) * speedMultiplier;
          const newProgress = Math.min(100, plot.growthProgress + growthIncrement);

          let newStage = plot.stage;
          if (newProgress >= 100) {
            newStage = 'ready_to_harvest';
          } else if (newProgress >= 66) {
            newStage = 'blooming';
          } else if (newProgress >= 33) {
            newStage = 'bud';
          } else if (newProgress >= 10) {
            newStage = 'sprout';
          } else {
            newStage = 'seed';
          }

          return {
            ...plot,
            growthProgress: newProgress,
            stage: newStage,
            // Soil slowly dries out over time unless misted
            isWatered: hasMisting ? true : Math.random() > 0.08 ? plot.isWatered : false,
          };
        });

        if (!anyChanged) return prev;
        return { ...prev, gardenPlots: updatedPlots };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sync Audio Volumes on Mount
  useEffect(() => {
    soundManager.setBgmVolume(gameState.bgmVolume);
    soundManager.setSfxVolume(gameState.sfxVolume);
    soundManager.setRainVolume(gameState.timeOfDay === 'Rainy Night' ? gameState.ambientRainVolume : 0);
  }, [gameState.timeOfDay, gameState.bgmVolume, gameState.sfxVolume, gameState.ambientRainVolume]);

  const handleToggleAudio = () => {
    const isPlaying = soundManager.toggleBgm();
    setGameState(prev => ({ ...prev, bgmPlaying: isPlaying }));
  };

  const handleUpdateAudio = (bgmVol: number, sfxVol: number, rainVol: number, track: string) => {
    setGameState(prev => ({
      ...prev,
      bgmVolume: bgmVol,
      sfxVolume: sfxVol,
      ambientRainVolume: rainVol,
      selectedBgmTrack: track,
    }));
  };

  // Quest Progress Helper
  const trackQuestProgress = (keyword: string, count = 1) => {
    setGameState(prev => {
      const updatedQuests = prev.dailyQuests.map(q => {
        if (q.completed) return q;
        if (q.title.toLowerCase().includes(keyword.toLowerCase()) || q.description.toLowerCase().includes(keyword.toLowerCase())) {
          const newProgress = Math.min(q.target, q.progress + count);
          return {
            ...q,
            progress: newProgress,
            completed: newProgress >= q.target,
          };
        }
        return q;
      });
      return { ...prev, dailyQuests: updatedQuests };
    });
  };

  // Pet Midnight the Cat
  const handlePetCat = () => {
    trackQuestProgress('pet', 1);
    trackQuestProgress('cat', 1);
    setGameState(prev => {
      const hasCatUpgrade = prev.unlockedUpgrades.includes('upgrade_cat_cushion');
      const tokenReward = hasCatUpgrade ? 2 : 1;
      return {
        ...prev,
        catHappiness: Math.min(100, prev.catHappiness + 5),
        bloomTokens: prev.bloomTokens + tokenReward,
        lastCatPetAt: Date.now(),
      };
    });
  };

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    setGameState(prev => {
      const quest = prev.dailyQuests.find(q => q.id === questId);
      if (!quest || quest.claimed) return prev;

      const updatedQuests = prev.dailyQuests.map(q =>
        q.id === questId ? { ...q, claimed: true } : q
      );

      const newSeedInventory = { ...prev.seedInventory };
      if (quest.rewardSeeds) {
        newSeedInventory[quest.rewardSeeds] = (newSeedInventory[quest.rewardSeeds] || 0) + 2;
      }

      return {
        ...prev,
        coins: prev.coins + quest.rewardCoins,
        seedInventory: newSeedInventory,
        dailyQuests: updatedQuests,
      };
    });
  };

  // Select order from storefront to craft
  const handleSelectOrder = (order: CustomerOrder) => {
    setActiveOrder(order);
    setActiveTab('studio');
  };

  const handleStartCustomBouquet = () => {
    setActiveOrder(null);
    setActiveTab('studio');
  };

  // Finish Bouquet & Fulfill Order
  const handleFinishBouquet = (
    stems: PlacedStem[],
    wrap: WrapOption,
    ribbon: RibbonOption,
    cardTag: CardTagOption | null,
    order: CustomerOrder | null
  ) => {
    // 1. Deduct stems from inventory
    const newInventory = { ...gameState.inventory };
    stems.forEach(stem => {
      if (newInventory[stem.flowerId]) {
        newInventory[stem.flowerId] = Math.max(0, newInventory[stem.flowerId] - 1);
      }
    });

    // 2. Calculate rewards
    let earnings = stems.reduce((sum, s) => {
      const fl = FLOWERS_BY_ID[s.flowerId];
      return sum + (fl ? fl.stemSellValue : 10);
    }, 0);

    let heartsEarned = 2;
    if (order) {
      const c = order.customer;
      earnings += 40; // Order completion bonus
      heartsEarned += 3;
      if (stems.length >= c.minStems) {
        earnings += 20;
      }
    }

    if (gameState.unlockedUpgrades.includes('upgrade_vintage_lanterns')) {
      earnings = Math.round(earnings * 1.1); // +10% tip bonus
    }

    // 3. Remove completed order from queue
    const updatedOrders = gameState.currentOrders.map(o =>
      order && o.orderId === order.orderId ? { ...o, status: 'completed' as const } : o
    ).filter(o => o.status !== 'completed');

    // 4. Track quest
    trackQuestProgress('bouquet', 1);
    trackQuestProgress('craft', 1);

    setGameState(prev => ({
      ...prev,
      coins: prev.coins + earnings,
      reputationHearts: prev.reputationHearts + heartsEarned,
      bloomTokens: prev.bloomTokens + 3,
      inventory: newInventory,
      currentOrders: updatedOrders,
      totalBouquetsCrafted: prev.totalBouquetsCrafted + 1,
      completedOrdersCount: prev.completedOrdersCount + (order ? 1 : 0),
    }));

    setActiveOrder(null);
    setActiveTab('shop');
  };

  // Plant Seed in Garden Plot
  const handlePlantSeed = (plotId: number, flowerId: string) => {
    if ((gameState.seedInventory[flowerId] || 0) <= 0) return;

    setGameState(prev => {
      const newSeeds = { ...prev.seedInventory, [flowerId]: prev.seedInventory[flowerId] - 1 };
      const updatedPlots = prev.gardenPlots.map(plot => {
        if (plot.id === plotId) {
          return {
            ...plot,
            flowerId,
            plantedAt: Date.now(),
            lastWateredAt: Date.now(),
            growthProgress: 0,
            isWatered: true,
            fertilized: false,
            stage: 'seed' as const,
            quality: 'Normal' as const,
          };
        }
        return plot;
      });
      return { ...prev, seedInventory: newSeeds, gardenPlots: updatedPlots };
    });
  };

  // Water single plot
  const handleWaterPlot = (plotId: number) => {
    trackQuestProgress('water', 1);
    setGameState(prev => ({
      ...prev,
      gardenPlots: prev.gardenPlots.map(plot =>
        plot.id === plotId ? { ...plot, isWatered: true, lastWateredAt: Date.now() } : plot
      ),
    }));
  };

  // Water All Plots
  const handleWaterAllPlots = () => {
    trackQuestProgress('water', gameState.gardenPlots.length);
    setGameState(prev => ({
      ...prev,
      gardenPlots: prev.gardenPlots.map(plot => ({
        ...plot,
        isWatered: true,
        lastWateredAt: Date.now(),
      })),
    }));
  };

  // Fertilize Plot
  const handleFertilizePlot = (plotId: number) => {
    if (gameState.bloomTokens < 5) return;
    setGameState(prev => ({
      ...prev,
      bloomTokens: prev.bloomTokens - 5,
      gardenPlots: prev.gardenPlots.map(plot =>
        plot.id === plotId ? { ...plot, fertilized: true, quality: 'Lush' as const } : plot
      ),
    }));
  };

  // Harvest Plot
  const handleHarvestPlot = (plotId: number) => {
    const plot = gameState.gardenPlots.find(p => p.id === plotId);
    if (!plot || !plot.flowerId || plot.stage !== 'ready_to_harvest') return;

    const flowerId = plot.flowerId;
    const isRadiant = plot.quality === 'Radiant' || (gameState.unlockedUpgrades.includes('upgrade_botanical_herbarium') && Math.random() > 0.6);
    const yieldCount = isRadiant ? 3 : 2;

    trackQuestProgress('harvest', yieldCount);

    setGameState(prev => {
      const newInventory = {
        ...prev.inventory,
        [flowerId]: (prev.inventory[flowerId] || 0) + yieldCount,
      };

      const updatedPlots = prev.gardenPlots.map(p =>
        p.id === plotId
          ? {
              ...p,
              flowerId: null,
              plantedAt: null,
              lastWateredAt: null,
              growthProgress: 0,
              isWatered: false,
              fertilized: false,
              stage: 'empty' as const,
              quality: 'Normal' as const,
            }
          : p
      );

      return {
        ...prev,
        inventory: newInventory,
        gardenPlots: updatedPlots,
        bloomTokens: prev.bloomTokens + (isRadiant ? 3 : 1),
      };
    });
  };

  // Buy Seeds from Nursery
  const handleBuySeeds = (flowerId: string, count: number) => {
    const fl = FLOWERS_BY_ID[flowerId];
    if (!fl) return;
    const totalCost = fl.seedCost * count;
    if (gameState.coins < totalCost) return;

    setGameState(prev => ({
      ...prev,
      coins: prev.coins - totalCost,
      seedInventory: {
        ...prev.seedInventory,
        [flowerId]: (prev.seedInventory[flowerId] || 0) + count,
      },
    }));
  };

  // Buy Shop Upgrade
  const handleBuyUpgrade = (upgradeId: string, cost: number) => {
    if (gameState.coins < cost) return;

    setGameState(prev => {
      let updatedPlots = [...prev.gardenPlots];
      if (upgradeId === 'upgrade_garden_bed_1') {
        // Add 2 extra garden plots
        const newPlot1: GardenPlot = {
          id: updatedPlots.length,
          flowerId: null,
          plantedAt: null,
          lastWateredAt: null,
          growthProgress: 0,
          isWatered: false,
          fertilized: false,
          stage: 'empty',
          quality: 'Normal',
        };
        const newPlot2: GardenPlot = {
          id: updatedPlots.length + 1,
          flowerId: null,
          plantedAt: null,
          lastWateredAt: null,
          growthProgress: 0,
          isWatered: false,
          fertilized: false,
          stage: 'empty',
          quality: 'Normal',
        };
        updatedPlots.push(newPlot1, newPlot2);
      }

      return {
        ...prev,
        coins: prev.coins - cost,
        unlockedUpgrades: [...prev.unlockedUpgrades, upgradeId],
        gardenPlots: updatedPlots,
      };
    });
  };

  // Advance to Next Day / Night Rest
  const handleAdvanceDay = () => {
    setIsDaySummaryOpen(true);
  };

  const handleStartNewDay = () => {
    setIsDaySummaryOpen(false);

    setGameState(prev => {
      const nextDay = prev.day + 1;
      const seasonIndex = Math.floor((nextDay - 1) / 5) % SEASONS_LIST.length;
      const nextSeason = SEASONS_LIST[seasonIndex];

      // Refresh customers queue with 2 to 3 new visitors
      const shuffledCustomers = [...INITIAL_CUSTOMERS].sort(() => Math.random() - 0.5);
      const newOrders: CustomerOrder[] = shuffledCustomers.slice(0, 3).map((c, idx) => ({
        orderId: 'order_day_' + nextDay + '_' + idx + '_' + c.id,
        customer: c,
        isCustomRequest: true,
        status: 'waiting',
      }));

      // Refresh daily quests
      const shuffledQuests = [...DAILY_QUESTS_POOL].sort(() => Math.random() - 0.5);
      const newQuests = shuffledQuests.slice(0, 4).map((q, idx) => ({
        ...q,
        id: 'quest_day_' + nextDay + '_' + idx,
        progress: 0,
        completed: false,
        claimed: false,
      }));

      // Random daytime weather
      const weathers: Weather[] = ['Sunny', 'Gentle Breeze', 'Cozy Rain', 'Golden Mist'];
      const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
      const times: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening', 'Rainy Night'];
      const nextTime = nextWeather === 'Cozy Rain' ? 'Rainy Night' : 'Morning';

      return {
        ...prev,
        day: nextDay,
        season: nextSeason,
        timeOfDay: nextTime,
        weather: nextWeather,
        currentOrders: newOrders,
        dailyQuests: newQuests,
      };
    });
  };

  // Reset Game
  const handleResetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(createInitialState());
    setActiveTab('shop');
    setActiveOrder(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#5c544b] flex flex-col font-sans selection:bg-[#8ca68e]/30">
      {/* Top Cozy App Navigation & Clock Bar */}
      <Header
        gameState={gameState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleAudio={handleToggleAudio}
        onAdvanceDay={handleAdvanceDay}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {activeTab === 'shop' && (
          <ShopFront
            gameState={gameState}
            onSelectOrder={handleSelectOrder}
            onPetCat={handlePetCat}
            onClaimQuest={handleClaimQuest}
            onStartCustomBouquet={handleStartCustomBouquet}
          />
        )}

        {activeTab === 'studio' && (
          <BouquetStudio
            gameState={gameState}
            activeOrder={activeOrder}
            onClearOrder={() => setActiveOrder(null)}
            onFinishBouquet={handleFinishBouquet}
            onConsumeStems={() => {}}
          />
        )}

        {activeTab === 'garden' && (
          <BotanicalGarden
            gameState={gameState}
            onPlantSeed={handlePlantSeed}
            onWaterPlot={handleWaterPlot}
            onWaterAllPlots={handleWaterAllPlots}
            onFertilizePlot={handleFertilizePlot}
            onHarvestPlot={handleHarvestPlot}
            onBuySeeds={handleBuySeeds}
          />
        )}

        {activeTab === 'grimoire' && (
          <FlowerGrimoire gameState={gameState} />
        )}

        {activeTab === 'upgrades' && (
          <ShopUpgradesView
            gameState={gameState}
            onBuyUpgrade={handleBuyUpgrade}
          />
        )}
      </main>

      {/* Day Transition Modal */}
      <DaySummaryModal
        isOpen={isDaySummaryOpen}
        gameState={gameState}
        onStartNewDay={handleStartNewDay}
      />

      {/* Settings & Audio Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        gameState={gameState}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateAudio={handleUpdateAudio}
        onResetGame={handleResetGame}
      />
    </div>
  );
}
