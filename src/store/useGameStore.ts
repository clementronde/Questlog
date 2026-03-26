import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Difficulty,
  XP_WEIGHTS,
  xpToGold,
  levelFromXp,
  xpIntoCurrentLevel,
  xpForCurrentLevel,
} from '../lib/xp';
import { updateStreak, comboMultiplier, todayKey } from '../lib/streaks';
import { checkNewAchievements, type Achievement } from '../lib/achievements';
import { DEFAULT_THEME_ID } from '../lib/themes';
import { syncPlayer } from '../lib/supabase';
import {
  type EquipSlot,
  type ChestTier,
  type InventoryItem,
  rollLoot,
  getEquipBonuses,
  CHEST_CONFIG,
  QUEST_DROP,
} from '../lib/equipment';
import { type HeroClass, CLASSES } from '../lib/classes';
import { type BossState, createInitialBosses, BOSS_POOL } from '../lib/bosses';

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestStatus = 'active' | 'completed';

export interface Quest {
  id: string;
  title: string;
  difficulty: Difficulty;
  status: QuestStatus;
  createdAt: string;
  completedAt?: string;
  xpReward: number;
  goldReward: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  xpCost: number;
  goldCost: number;
  icon: string;
  timesRedeemed: number;
}

export interface CharacterState {
  totalXp: number;
  gold: number;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  streak: number;
  lastActiveDate: string | null;
  combo: number;
  heroClass: HeroClass | null;
}

export interface PendingChest {
  instanceId: string;
  tier: ChestTier;
}

export interface GameState {
  quests: Quest[];
  rewards: Reward[];
  character: CharacterState;
  unlockedAchievements: string[];
  achievementQueue: Achievement[];
  pendingLevelUp: number | null;
  installDismissed: boolean;
  themeId: string;
  playerId: string;
  username: string | null;

  // Equipment & inventory
  inventory: InventoryItem[];
  equipped: Partial<Record<EquipSlot, string>>; // slot → instanceId
  chests: PendingChest[];         // unopened chests
  pendingLoot: InventoryItem | null; // just-opened item to show in modal

  // Boss battles
  bosses: BossState[];

  // Quest actions
  addQuest: (title: string, difficulty: Difficulty) => void;
  completeQuest: (id: string) => void;
  deleteQuest: (id: string) => void;
  clearCompleted: () => void;

  // Reward actions
  addReward: (reward: Omit<Reward, 'id' | 'timesRedeemed'>) => void;
  redeemReward: (id: string) => void;
  deleteReward: (id: string) => void;

  // Achievement actions
  shiftAchievementQueue: () => void;

  // Class & equipment
  selectClass: (cls: HeroClass) => void;
  equipItem: (instanceId: string) => void;
  unequipItem: (slot: EquipSlot) => void;
  buyChest: (tier: ChestTier) => void;
  openChest: (instanceId: string) => void;
  dismissLoot: () => void;

  // Boss
  engageBoss: (bossId: string) => void;
  saveBossHp: (bossId: string, hp: number) => void;
  defeatBoss: (bossId: string) => void;

  // UI / theme / leaderboard
  setTheme: (id: string) => void;
  setUsername: (name: string) => void;
  syncLeaderboard: () => Promise<void>;
  dismissLevelUp: () => void;
  dismissInstall: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function buildCharacter(
  totalXp: number,
  gold: number,
  streak: number,
  lastActiveDate: string | null,
  heroClass: HeroClass | null,
  comboBonus: number = 0,
): CharacterState {
  const classComboBonus = heroClass ? CLASSES[heroClass].comboGrowthBonus * streak : 0;
  return {
    totalXp,
    gold,
    level: levelFromXp(totalXp),
    xpIntoLevel: xpIntoCurrentLevel(totalXp),
    xpForLevel: xpForCurrentLevel(totalXp),
    streak,
    lastActiveDate,
    combo: Math.round(comboMultiplier(streak) * 100) + comboBonus + classComboBonus,
    heroClass,
  };
}

// ─── Default rewards ──────────────────────────────────────────────────────────

const DEFAULT_REWARDS: Reward[] = [
  {
    id: 'r1',
    title: 'Watch an Episode',
    description: 'Sit back and enjoy one episode guilt-free.',
    xpCost: 0, goldCost: 10, icon: 'tv', timesRedeemed: 0,
  },
  {
    id: 'r2',
    title: '30-min Gaming Session',
    description: 'Boot up your game of choice for 30 minutes.',
    xpCost: 0, goldCost: 20, icon: 'gamepad-2', timesRedeemed: 0,
  },
  {
    id: 'r3',
    title: 'Fancy Coffee',
    description: 'Treat yourself to that overpriced latte.',
    xpCost: 50, goldCost: 0, icon: 'coffee', timesRedeemed: 0,
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      quests: [],
      rewards: DEFAULT_REWARDS,
      character: buildCharacter(0, 0, 0, null, null),
      unlockedAchievements: [],
      achievementQueue: [],
      pendingLevelUp: null,
      installDismissed: false,
      themeId: DEFAULT_THEME_ID,
      playerId: uid(),
      username: null,
      inventory: [],
      equipped: {},
      chests: [],
      pendingLoot: null,
      bosses: createInitialBosses(),

      // ── Quest actions ──────────────────────────────────────────────────────
      addQuest(title, difficulty) {
        const baseXp = XP_WEIGHTS[difficulty];
        const quest: Quest = {
          id: uid(),
          title,
          difficulty,
          status: 'active',
          createdAt: new Date().toISOString(),
          xpReward: baseXp,
          goldReward: xpToGold(baseXp),
        };
        set((s) => ({ quests: [quest, ...s.quests] }));
      },

      completeQuest(id) {
        const { quests, character, unlockedAchievements, rewards, inventory, equipped } = get();
        const quest = quests.find((q) => q.id === id);
        if (!quest || quest.status === 'completed') return;

        // ── Streak ──
        const { streak, lastActiveDate } = updateStreak(character.lastActiveDate, character.streak);
        const multiplier = comboMultiplier(streak);

        // ── Equipment bonuses ──
        const equip = getEquipBonuses(inventory, equipped);

        // ── Class bonuses ──
        const cls = character.heroClass ? CLASSES[character.heroClass] : null;
        const isHardOrBoss = quest.difficulty === 'hard' || quest.difficulty === 'boss';
        const classXpBonus = cls
          ? cls.xpBonus + (isHardOrBoss ? cls.hardBossXpBonus : 0)
          : 0;
        const classGoldBonus = cls ? cls.goldBonus : 0;

        // ── Final rewards ──
        const xpMulti = multiplier * (1 + (equip.xpBonus + classXpBonus) / 100);
        const goldMulti = multiplier * (1 + (equip.goldBonus + classGoldBonus) / 100);
        const earnedXp   = Math.round(quest.xpReward * xpMulti);
        const earnedGold = Math.round(quest.goldReward * goldMulti);

        // ── Level up ──
        const prevLevel  = character.level;
        const newTotalXp = character.totalXp + earnedXp;
        const newGold    = character.gold + earnedGold;
        const newCharacter = buildCharacter(
          newTotalXp, newGold, streak, lastActiveDate,
          character.heroClass, equip.comboBonus,
        );

        const updatedQuests = quests.map((q) =>
          q.id === id ? { ...q, status: 'completed' as QuestStatus, completedAt: new Date().toISOString() } : q
        );

        const newlyUnlocked = checkNewAchievements({
          quests: updatedQuests,
          character: newCharacter,
          unlockedAchievements,
          rewards,
        });

        const achievementXpBonus = newlyUnlocked.reduce((s, a) => s + a.xpBonus, 0);
        const finalXp = newTotalXp + achievementXpBonus;
        const finalCharacter = achievementXpBonus > 0
          ? buildCharacter(finalXp, newGold, streak, lastActiveDate, character.heroClass, equip.comboBonus)
          : newCharacter;

        // ── Chest drop from quest ──
        let newChests = [...get().chests];
        for (const drop of (QUEST_DROP[quest.difficulty] ?? [])) {
          if (Math.random() < drop.chance) {
            newChests = [...newChests, { instanceId: uid(), tier: drop.tier }];
            break;
          }
        }

        set((s) => ({
          quests: updatedQuests,
          character: finalCharacter,
          pendingLevelUp: finalCharacter.level > prevLevel ? finalCharacter.level : s.pendingLevelUp,
          unlockedAchievements: [...s.unlockedAchievements, ...newlyUnlocked.map((a) => a.id)],
          achievementQueue: [...s.achievementQueue, ...newlyUnlocked],
          chests: newChests,
        }));

        setTimeout(() => get().syncLeaderboard(), 0);
      },

      deleteQuest(id) {
        set((s) => ({ quests: s.quests.filter((q) => q.id !== id) }));
      },

      clearCompleted() {
        set((s) => ({ quests: s.quests.filter((q) => q.status !== 'completed') }));
      },

      // ── Reward actions ─────────────────────────────────────────────────────
      addReward(reward) {
        set((s) => ({ rewards: [...s.rewards, { ...reward, id: uid(), timesRedeemed: 0 }] }));
      },

      redeemReward(id) {
        const { rewards, character, unlockedAchievements, quests } = get();
        const reward = rewards.find((r) => r.id === id);
        if (!reward) return;
        if (character.totalXp < reward.xpCost) return;
        if (character.gold < reward.goldCost) return;

        const updatedRewards   = rewards.map((r) =>
          r.id === id ? { ...r, timesRedeemed: r.timesRedeemed + 1 } : r
        );
        const updatedCharacter = { ...character, totalXp: character.totalXp - reward.xpCost, gold: character.gold - reward.goldCost };

        const newlyUnlocked = checkNewAchievements({ quests, character: updatedCharacter, unlockedAchievements, rewards: updatedRewards });

        set((s) => ({
          rewards: updatedRewards,
          character: updatedCharacter,
          unlockedAchievements: [...s.unlockedAchievements, ...newlyUnlocked.map((a) => a.id)],
          achievementQueue: [...s.achievementQueue, ...newlyUnlocked],
        }));
      },

      deleteReward(id) {
        set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) }));
      },

      // ── Achievement actions ────────────────────────────────────────────────
      shiftAchievementQueue() {
        set((s) => ({ achievementQueue: s.achievementQueue.slice(1) }));
      },

      // ── Class & equipment ──────────────────────────────────────────────────
      selectClass(cls) {
        const { character, chests } = get();
        const startTier = CLASSES[cls].startingChest;
        set({
          character: { ...character, heroClass: cls },
          chests: [...chests, { instanceId: uid(), tier: startTier }],
        });
      },

      equipItem(instanceId) {
        const { inventory, equipped } = get();
        const item = inventory.find((i) => i.instanceId === instanceId);
        if (!item) return;
        set({ equipped: { ...equipped, [item.slot]: instanceId } });
      },

      unequipItem(slot) {
        const { equipped } = get();
        const next = { ...equipped };
        delete next[slot];
        set({ equipped: next });
      },

      buyChest(tier) {
        const { character, chests } = get();
        const cost = CHEST_CONFIG[tier].cost;
        if (character.gold < cost) return;
        set({
          character: { ...character, gold: character.gold - cost },
          chests: [...chests, { instanceId: uid(), tier }],
        });
      },

      openChest(instanceId) {
        const { chests, inventory } = get();
        const chest = chests.find((c) => c.instanceId === instanceId);
        if (!chest) return;
        const item = rollLoot(chest.tier);
        set({
          chests: chests.filter((c) => c.instanceId !== instanceId),
          inventory: [...inventory, item],
          pendingLoot: item,
        });
      },

      dismissLoot() {
        set({ pendingLoot: null });
      },

      engageBoss(bossId) {
        const { bosses, character } = get();
        const boss = bosses.find((b) => b.id === bossId);
        if (!boss || boss.isDefeated || boss.isEngaged) return;
        if (character.gold < boss.ticketCost) return;
        set({
          character: { ...character, gold: character.gold - boss.ticketCost },
          bosses: bosses.map((b) =>
            b.id === bossId ? { ...b, isEngaged: true } : { ...b, isEngaged: false }
          ),
        });
      },

      saveBossHp(bossId, hp) {
        set((s) => ({
          bosses: s.bosses.map((b) => b.id === bossId ? { ...b, currentHp: hp } : b),
        }));
      },

      defeatBoss(bossId) {
        const { bosses, character } = get();
        const boss = bosses.find((b) => b.id === bossId);
        if (!boss) return;
        const newChests = [...get().chests, { instanceId: uid(), tier: boss.reward.chest }];
        const newChar = { ...character, totalXp: character.totalXp + boss.reward.xp, gold: character.gold + boss.reward.gold };
        let updatedBosses = bosses.map((b) =>
          b.id === bossId ? { ...b, isDefeated: true, isEngaged: false, currentHp: 0, defeatedAt: new Date().toISOString() } : b
        );
        // Unlock next boss
        const defeatedIds = updatedBosses.filter((b) => b.isDefeated).map((b) => b.id);
        const nextDef = BOSS_POOL.find((b) => !defeatedIds.includes(b.id) && !updatedBosses.find((eb) => eb.id === b.id));
        if (nextDef) {
          updatedBosses = [...updatedBosses, { ...nextDef, currentHp: nextDef.maxHp, isEngaged: false, isDefeated: false }];
        }
        set({ bosses: updatedBosses, character: newChar, chests: newChests });
        setTimeout(() => get().syncLeaderboard(), 0);
      },

      // ── UI state ───────────────────────────────────────────────────────────
      dismissLevelUp() { set({ pendingLevelUp: null }); },
      dismissInstall()  { set({ installDismissed: true }); },
      setTheme(id)      { set({ themeId: id }); },
      setUsername(name) { set({ username: name.trim() }); },

      async syncLeaderboard() {
        const { character, quests, playerId, username, themeId } = get();
        if (!username) return;
        await syncPlayer({
          player_id:   playerId,
          username,
          level:       character.level,
          total_xp:    character.totalXp,
          quests_done: quests.filter((q) => q.status === 'completed').length,
          streak:      character.streak,
          theme_id:    themeId,
          updated_at:  new Date().toISOString(),
        });
      },
    }),
    {
      name: 'questlog-storage',
      version: 4,
      partialize: (s) => ({
        quests: s.quests,
        rewards: s.rewards,
        character: s.character,
        unlockedAchievements: s.unlockedAchievements,
        installDismissed: s.installDismissed,
        themeId: s.themeId,
        playerId: s.playerId,
        username: s.username,
        inventory: s.inventory,
        equipped: s.equipped,
        chests: s.chests,
        bosses: s.bosses,
      }),
      migrate(persisted: unknown, _fromVersion: number) {
        const state = persisted as Partial<GameState>;
        return {
          ...state,
          unlockedAchievements: state.unlockedAchievements ?? [],
          themeId: (state as any).themeId ?? DEFAULT_THEME_ID,
          playerId: (state as any).playerId ?? uid(),
          username: (state as any).username ?? null,
          inventory: (state as any).inventory ?? [],
          equipped: (state as any).equipped ?? {},
          chests: (state as any).chests ?? [],
          bosses: (state as any).bosses ?? createInitialBosses(),
          character: {
            ...(state.character ?? {}),
            heroClass: (state as any).character?.heroClass ?? null,
          },
        };
      },
      merge(persisted, current) {
        const p = persisted as Partial<GameState>;
        return {
          ...current,
          ...p,
          unlockedAchievements: Array.isArray(p.unlockedAchievements) ? p.unlockedAchievements : [],
          achievementQueue: [],
          pendingLoot: null,
          quests: Array.isArray(p.quests) ? p.quests : [],
          rewards: Array.isArray(p.rewards) && p.rewards.length > 0 ? p.rewards : current.rewards,
          character: p.character ? { ...current.character, ...p.character, heroClass: (p.character as any).heroClass ?? null } : current.character,
          installDismissed: p.installDismissed ?? false,
          themeId: (p as any).themeId ?? DEFAULT_THEME_ID,
          playerId: (p as any).playerId ?? current.playerId,
          username: (p as any).username ?? null,
          inventory: Array.isArray((p as any).inventory) ? (p as any).inventory : [],
          equipped: (p as any).equipped ?? {},
          chests: Array.isArray((p as any).chests) ? (p as any).chests : [],
          bosses: Array.isArray((p as any).bosses) && (p as any).bosses.length > 0
            ? (p as any).bosses
            : createInitialBosses(),
        };
      },
    }
  )
);

// Selector helpers
export const selectActiveQuests    = (s: GameState) => s.quests.filter((q) => q.status === 'active');
export const selectCompletedQuests = (s: GameState) => s.quests.filter((q) => q.status === 'completed');
export const selectTodayCompleted  = (s: GameState) =>
  s.quests.filter((q) => q.status === 'completed' && q.completedAt?.startsWith(todayKey()));
