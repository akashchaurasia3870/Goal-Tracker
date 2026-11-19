import React, { useState, useEffect } from 'react';
import {
  Award,
  Gift,
  CheckCircle2,
  Sparkles,
  Trophy,
  Zap,
  Flame,
  Star,
  Target,
  Milestone,
} from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import achievementService from '../../services/achievement.service';
import { useAuth } from '../../contexts/AuthContext';

const tierColorMap = {
  Bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  Silver: 'bg-slate-200 text-slate-800 border-slate-300',
  Gold: 'bg-yellow-100 text-yellow-800 border-yellow-300 font-bold',
  Platinum: 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold',
};

const AchievementsPage = () => {
  const { user, settings } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [progression, setProgression] = useState({ level: 1, currentXP: 0, nextLevelXP: 100, progress: 0 });
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const isXpEnabled = settings ? settings.xpEnabled : true;

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await achievementService.getAchievements();
      if (res.data) {
        setAchievements(res.data.achievements || []);
        if (res.data.progression) {
          setProgression(res.data.progression);
        }
      }

      const rewardRes = await achievementService.getClaimedRewards();
      if (rewardRes.data) {
        setClaimedRewards(rewardRes.data);
      }
    } catch (err) {
      // Fallback preview
      setProgression({ level: 4, currentXP: 1420, nextLevelXP: 1600, progress: 70 });
      setClaimedRewards([
        {
          _id: '1',
          rewardTitle: 'Watch a movie',
          milestoneTitle: 'SQL Fundamentals',
          goalTitle: 'Learn MySQL Database Mastery',
          claimedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Productivity Rewards & Achievements</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Motivate your progress through milestone rewards and productivity milestones
        </p>
      </div>

      {/* Optional XP & Level Progression Card (if enabled) */}
      {isXpEnabled && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-xl text-amber-300 border border-white/20">
                L{progression.level}
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-200 font-bold block">
                  Productivity Progression
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Level {progression.level} Explorer
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-white">{progression.currentXP}</span>
              <span className="text-xs text-blue-200 block">Total XP Earned</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span>Next Level (L{progression.level + 1})</span>
              <span>{progression.progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progression.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Claimed Milestone Rewards Shelf */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">Claimed Milestone Rewards</h3>
        </div>
        <p className="text-xs text-slate-500">
          Personal rewards earned from successfully reaching milestone stages
        </p>

        {claimedRewards.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3">
            No milestone rewards claimed yet. Complete milestones with defined rewards to celebrate here!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {claimedRewards.map((r) => (
              <div key={r._id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 text-sm">{r.rewardTitle}</span>
                  <p className="text-slate-500 text-[11px]">
                    Stage: <strong className="text-slate-700">{r.milestoneTitle}</strong>{' '}
                    {r.goalTitle && `(${r.goalTitle})`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Claimed
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {new Date(r.claimedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Productivity Achievements Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">Productivity Achievements</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((item) => {
            const isUnlocked = item.isUnlocked;
            const tierStyle = tierColorMap[item.tier] || tierColorMap.Bronze;

            return (
              <div
                key={item.code}
                className={`p-4 rounded-xl border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                  isUnlocked
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50/70 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnlocked ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${tierStyle}`}>
                    {item.tier}
                  </span>
                </div>

                {/* Progress bar towards completion */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {item.currentCount} / {item.requiredCount}
                    </span>
                    <span className="font-semibold">{item.progress}%</span>
                  </div>
                  <ProgressBar
                    value={item.progress}
                    color={isUnlocked ? 'emerald' : 'blue'}
                    height="h-1.5"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
