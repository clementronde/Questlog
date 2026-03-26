import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Gamepad2, Coffee, Gift, Trash2 } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import type { Reward } from '../../store/useGameStore';

const ICON_MAP: Record<string, React.ReactNode> = {
  tv:         <Tv size={20} />,
  'gamepad-2':<Gamepad2 size={20} />,
  coffee:     <Coffee size={20} />,
  gift:       <Gift size={20} />,
};
const ICON_OPTIONS = ['tv', 'gamepad-2', 'coffee', 'gift'];

export default function RewardShop() {
  const rewards      = useGameStore(useShallow((s) => s.rewards));
  const character    = useGameStore((s) => s.character);
  const redeemReward = useGameStore((s) => s.redeemReward);
  const deleteReward = useGameStore((s) => s.deleteReward);
  const addReward    = useGameStore((s) => s.addReward);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="px-3 pt-4 pb-4">

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between mb-4 pb-3"
        style={{ borderBottom: '2px dashed var(--border)' }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--text-dim)', marginBottom: 4 }}>
            ▸ REWARD SHOP
          </div>
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--text-dim)' }}>
            Spend your loot
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--purple-light)' }}>
            {character.totalXp.toLocaleString()} XP
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--gold)', marginTop: 3 }}>
            {character.gold.toLocaleString()} GOLD
          </div>
        </div>
      </div>

      {/* ── Add button ── */}
      <motion.button
        whileTap={{ x: 2, y: 2 }}
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center gap-2 justify-center py-2.5 mb-4"
        style={{
          background: 'var(--bg-surface)',
          border: '2px dashed var(--purple)',
          color: 'var(--purple-light)',
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          letterSpacing: '0.05em',
        }}
      >
        ＋ CREATE REWARD
      </motion.button>

      {/* ── Rewards list ── */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {rewards.map((reward) => {
            const canAfford =
              character.totalXp >= reward.xpCost &&
              character.gold >= reward.goldCost;
            return (
              <RewardCard
                key={reward.id}
                reward={reward}
                canAfford={canAfford}
                onRedeem={() => redeemReward(reward.id)}
                onDelete={() => deleteReward(reward.id)}
              />
            );
          })}
        </AnimatePresence>

        {rewards.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Gift size={32} style={{ color: 'var(--text-faint)' }} />
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', textAlign: 'center', lineHeight: 2 }}>
              NO REWARDS YET
              <br />CREATE ONE ABOVE
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && <AddRewardSheet onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}

function RewardCard({
  reward, canAfford, onRedeem, onDelete,
}: {
  reward: Reward;
  canAfford: boolean;
  onRedeem: () => void;
  onDelete: () => void;
}) {
  const [redeemed, setRedeemed] = useState(false);

  const handleRedeem = () => {
    if (!canAfford) return;
    setRedeemed(true);
    onRedeem();
    setTimeout(() => setRedeemed(false), 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: canAfford ? 1 : 0.5, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-3 p-3"
      style={{
        background: 'var(--bg-card)',
        border: `2px solid ${canAfford ? 'var(--border-light)' : 'var(--border)'}`,
        boxShadow: canAfford ? '3px 3px 0 var(--pixel-shadow)' : 'none',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          color: 'var(--purple-light)',
          flexShrink: 0,
        }}
      >
        {ICON_MAP[reward.icon] ?? <Gift size={20} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {reward.title}
        </div>
        <div className="flex gap-2">
          {reward.xpCost > 0 && (
            <span style={{ fontFamily: 'var(--font-vt)', fontSize: '14px', color: 'var(--purple-light)' }}>
              {reward.xpCost} XP
            </span>
          )}
          {reward.goldCost > 0 && (
            <span style={{ fontFamily: 'var(--font-vt)', fontSize: '14px', color: 'var(--gold)' }}>
              {reward.goldCost} G
            </span>
          )}
          {reward.timesRedeemed > 0 && (
            <span style={{ fontFamily: 'var(--font-vt)', fontSize: '14px', color: 'var(--text-faint)' }}>
              ×{reward.timesRedeemed}
            </span>
          )}
        </div>
      </div>

      {/* Buy */}
      <motion.button
        whileTap={canAfford ? { x: 2, y: 2 } : {}}
        onClick={handleRedeem}
        disabled={!canAfford}
        className="px-btn"
        style={{
          background: redeemed ? 'var(--green)' : canAfford ? 'var(--purple)' : 'var(--bg-surface)',
          border: `2px solid ${redeemed ? 'var(--green)' : canAfford ? 'var(--purple-light)' : 'var(--border)'}`,
          boxShadow: canAfford && !redeemed ? '2px 2px 0 var(--pixel-shadow)' : 'none',
          color: redeemed ? '#000' : canAfford ? '#fff' : 'var(--text-faint)',
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          padding: '6px 10px',
          flexShrink: 0,
          transition: 'none',
        }}
      >
        {redeemed ? '✓ OK' : 'BUY'}
      </motion.button>

      {/* Delete */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onDelete}
        style={{ color: 'var(--text-faint)', flexShrink: 0 }}
      >
        <Trash2 size={14} />
      </motion.button>
    </motion.div>
  );
}

function AddRewardSheet({ onClose }: { onClose: () => void }) {
  const addReward = useGameStore((s) => s.addReward);
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [xpCost, setXpCost]     = useState(0);
  const [goldCost, setGoldCost] = useState(10);
  const [icon, setIcon]         = useState('gift');

  const handleSubmit = () => {
    if (!title.trim()) return;
    addReward({ title: title.trim(), description: description.trim(), xpCost, goldCost, icon });
    onClose();
  };

  const inputStyle = {
    background: 'var(--bg-deep)',
    border: '2px solid var(--border-light)',
    boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.5)',
    color: 'var(--text)',
    fontFamily: 'var(--font-vt)',
    fontSize: '18px',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40" style={{ background: 'rgba(5,5,16,0.85)' }}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
        style={{
          background: 'var(--bg-card)',
          borderTop: '2px solid var(--gold)',
          boxShadow: '0 -4px 0 var(--pixel-shadow)',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--gold)' }}>▸ NEW REWARD</span>
          <button onClick={onClose} style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)' }}>✕</button>
        </div>

        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Reward name..." style={{ ...inputStyle, marginBottom: 8 }} />
        <input value={description} onChange={(e) => setDesc(e.target.value)}
          placeholder="Description..." style={{ ...inputStyle, marginBottom: 12 }} />

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-dim)', marginBottom: 4 }}>XP COST</div>
            <input type="number" min={0} value={xpCost} onChange={(e) => setXpCost(Number(e.target.value))} style={inputStyle} />
          </div>
          <div className="flex-1">
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-dim)', marginBottom: 4 }}>GOLD COST</div>
            <input type="number" min={0} value={goldCost} onChange={(e) => setGoldCost(Number(e.target.value))} style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {ICON_OPTIONS.map((i) => (
            <button key={i} onClick={() => setIcon(i)}
              style={{
                width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: icon === i ? 'var(--purple-dim)' : 'var(--bg-deep)',
                border: `2px solid ${icon === i ? 'var(--purple-light)' : 'var(--border)'}`,
                boxShadow: icon === i ? '2px 2px 0 var(--pixel-shadow)' : 'none',
                color: icon === i ? 'var(--purple-light)' : 'var(--text-dim)',
              }}
            >
              {ICON_MAP[i]}
            </button>
          ))}
        </div>

        <motion.button
          whileTap={{ x: 3, y: 3 }} onClick={handleSubmit} disabled={!title.trim()}
          className="w-full py-3"
          style={{
            background: title.trim() ? 'var(--gold)' : 'var(--bg-surface)',
            border: `2px solid ${title.trim() ? 'var(--gold)' : 'var(--border)'}`,
            boxShadow: title.trim() ? '3px 3px 0 var(--pixel-shadow)' : 'none',
            color: title.trim() ? '#000' : 'var(--text-faint)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
          }}
        >
          ▶ ADD REWARD
        </motion.button>
      </motion.div>
    </>
  );
}
