'use client';

import { Trophy, Share2, Lock, Star, Zap, Target, Award } from 'lucide-react';
import { cn } from '@/lib/shared/utils/cn';
import type { Achievement } from './types';

interface AchievementsPanelProps {
  achievements: Achievement[];
  onShare?: (achievement: Achievement) => void;
}

const rarityConfig = {
  common: {
    color: 'text-slate-600 bg-slate-50 border-slate-200',
    label: 'Common',
  },
  rare: {
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    label: 'Rare',
  },
  epic: {
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    label: 'Epic',
  },
  legendary: {
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    label: 'Legendary',
  },
};

const achievementIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
};

interface AchievementCardProps {
  achievement: Achievement;
  onShare?: () => void;
}

function AchievementCard({ achievement, onShare }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt;
  const rarity = achievement.rarity || 'common';
  const config = rarityConfig[rarity];
  const Icon = achievementIcons[achievement.icon] || Trophy;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-white p-4 transition-all',
        isUnlocked ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Achievement icon */}
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg border',
            isUnlocked ? config.color : 'border-slate-200 bg-slate-50 text-slate-400',
          )}
        >
          {isUnlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
        </div>

        {/* Achievement details */}
        <div className="flex-grow">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={cn('font-medium', isUnlocked ? 'text-slate-900' : 'text-slate-500')}>
                {achievement.title}
              </h4>
              <p className="mt-0.5 text-xs text-slate-500">{achievement.description}</p>
            </div>
            {isUnlocked && achievement.shareUrl && (
              <button
                onClick={e => {
                  e.preventDefault();
                  onShare?.();
                }}
                className="rounded-md p-1 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600"
                aria-label="Share achievement"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Progress bar for progressive achievements */}
          {achievement.progress !== undefined && achievement.progress < 100 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>{achievement.progress}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlocked date and rarity */}
          <div className="mt-2 flex items-center gap-3 text-xs">
            {isUnlocked && achievement.unlockedAt && (
              <span className="text-slate-500">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            )}
            {isUnlocked && (
              <span className={cn('font-medium', config.color.split(' ')[0])}>{config.label}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementsPanel({ achievements, onShare }: AchievementsPanelProps) {
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;

  // Sort achievements: unlocked first, then by rarity
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;

    const rarityOrder = ['legendary', 'epic', 'rare', 'common'];
    const aRarity = a.rarity || 'common';
    const bRarity = b.rarity || 'common';
    return rarityOrder.indexOf(aRarity) - rarityOrder.indexOf(bRarity);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase text-slate-500">Achievements</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Trophy className="h-4 w-4" />
            <span>
              {unlockedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {achievements.length > 0 ? (
        <div className="space-y-3">
          {sortedAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onShare={() => onShare?.(achievement)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
          <Trophy className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">No achievements yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Complete lessons and quizzes to unlock achievements
          </p>
        </div>
      )}

      {/* Achievement summary */}
      {unlockedCount > 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <Award className="h-4 w-4" />
            <span className="font-medium">
              {unlockedCount === totalCount
                ? 'All achievements unlocked! 🎉'
                : `${totalCount - unlockedCount} achievements remaining`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
