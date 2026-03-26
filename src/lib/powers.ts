import type { HeroClass } from './classes';

export interface Power {
  id: string;
  name: string;
  icon: string;
  manaCost: number;
  cooldown: number;    // seconds
  description: string;
  color: string;
  // Effect (one or more)
  dmgMult?:        number;   // × ATK damage to boss
  healPct?:        number;   // % of maxHP restored
  atkBuffMult?:    number;   // player ATK multiplier
  buffDuration?:   number;   // seconds
  dotMult?:        number;   // × ATK per second (DoT)
  dotDuration?:    number;
  shieldHits?:     number;   // absorb N boss attacks
  invulDuration?:  number;   // invulnerable seconds
  manaRestore?:    number;   // flat mana restore
  guaranteedCrit?: boolean;
}

export const CLASS_POWERS: Record<HeroClass, Power[]> = {
  warrior: [
    {
      id: 'heroic_strike',
      name: 'Frappe Héroïque',
      icon: '⚔️',
      manaCost: 20,
      cooldown: 6,
      description: 'Inflige 3× ATK',
      color: 'var(--red)',
      dmgMult: 3,
    },
    {
      id: 'berserk',
      name: 'Berserk',
      icon: '🔥',
      manaCost: 40,
      cooldown: 22,
      description: 'ATK ×2 pendant 6s',
      color: 'var(--orange)',
      atkBuffMult: 2.0,
      buffDuration: 6,
    },
    {
      id: 'battle_cry',
      name: 'Cri de Guerre',
      icon: '🛡️',
      manaCost: 15,
      cooldown: 14,
      description: 'Récupère 25% PV',
      color: 'var(--green)',
      healPct: 0.25,
    },
  ],

  mage: [
    {
      id: 'fireball',
      name: 'Boule de Feu',
      icon: '🔮',
      manaCost: 25,
      cooldown: 5,
      description: 'Inflige 4× ATK',
      color: 'var(--orange)',
      dmgMult: 4,
    },
    {
      id: 'frost_shield',
      name: 'Bouclier de Givre',
      icon: '❄️',
      manaCost: 30,
      cooldown: 18,
      description: 'Absorbe 3 attaques',
      color: 'var(--blue)',
      shieldHits: 3,
    },
    {
      id: 'arcane_surge',
      name: 'Éclat Arcane',
      icon: '✨',
      manaCost: 55,
      cooldown: 35,
      description: '8× ATK + récup 30 mana',
      color: 'var(--purple-light)',
      dmgMult: 8,
      manaRestore: 30,
    },
  ],

  rogue: [
    {
      id: 'poison_blade',
      name: 'Lame Empoisonnée',
      icon: '🗡️',
      manaCost: 20,
      cooldown: 8,
      description: '1× ATK/s pendant 6s',
      color: 'var(--green)',
      dotMult: 1,
      dotDuration: 6,
    },
    {
      id: 'death_strike',
      name: 'Frappe Mortelle',
      icon: '💀',
      manaCost: 35,
      cooldown: 14,
      description: '5× ATK, crit assuré',
      color: 'var(--red)',
      dmgMult: 5,
      guaranteedCrit: true,
    },
    {
      id: 'vanish',
      name: 'Disparition',
      icon: '👤',
      manaCost: 15,
      cooldown: 10,
      description: 'Esquive + contre 1.5× ATK',
      color: '#b0b0b0',
      shieldHits: 1,
      dmgMult: 1.5,
    },
  ],

  paladin: [
    {
      id: 'holy_strike',
      name: 'Frappe Sacrée',
      icon: '✝️',
      manaCost: 20,
      cooldown: 7,
      description: '2× ATK + soin 15% PV',
      color: 'var(--gold)',
      dmgMult: 2,
      healPct: 0.15,
    },
    {
      id: 'divine_shield',
      name: 'Bouclier Divin',
      icon: '🌟',
      manaCost: 45,
      cooldown: 28,
      description: 'Invulnérable 4s',
      color: 'var(--gold)',
      invulDuration: 4,
    },
    {
      id: 'judgement',
      name: 'Jugement',
      icon: '⚡',
      manaCost: 30,
      cooldown: 12,
      description: '2.5× ATK + soin 20% PV',
      color: 'var(--cyan)',
      dmgMult: 2.5,
      healPct: 0.20,
    },
  ],
};
