import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Milestone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Gift,
  Target,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import MilestoneCard from '../../components/milestones/MilestoneCard';
import MilestoneModal from '../../components/milestones/MilestoneModal';
import MilestoneCompleteModal from '../../components/milestones/MilestoneCompleteModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import milestoneService from '../../services/milestone.service';
import goalService from '../../services/goal.service';
import { sampleGoals } from '../../data/goal_data';
import toast from 'react-hot-toast';

const STATUSES = ['All', 'In Progress', 'Completed', 'Not Started', 'On Hold'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];

const MilestonesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const goalFilterParam = searchParams.get('goalId') || 'all';

  const [milestones, setMilestones] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(goalFilterParam);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [groupByGoal, setGroupByGoal] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [completingMilestone, setCompletingMilestone] = useState(null);
  const [deletingMilestone, setDeletingMilestone] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load goals and milestones
  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch goals
      let availableGoals = sampleGoals;
      try {
        const goalRes = await goalService.getGoals();
        if (goalRes.data && goalRes.data.length > 0) {
          availableGoals = goalRes.data;
        }
      } catch (err) {
        console.warn('Backend goals offline, using sample goals');
      }
      setGoals(availableGoals);

      // Fetch milestones
      try {
        const milestoneRes = await milestoneService.getMilestones();
        if (milestoneRes.data && milestoneRes.data.length > 0) {
          setMilestones(milestoneRes.data);
        } else {
          // Extract sample milestones from sampleGoals
          const extracted = availableGoals.flatMap((g, gIdx) =>
            (g.milestones || []).map((m, mIdx) => ({
              ...m,
              _id: m.id,
              goalId: { _id: g.id || g._id, title: g.title, color: g.color, category: g.category },
              order: mIdx + 1,
              priority: m.priority || 'Medium',
              reward: m.reward || (mIdx === 0 ? 'Watch a movie' : mIdx === 1 ? 'Personal celebration' : ''),
              rewardClaimed: m.status === 'Completed',
            }))
          );
          setMilestones(extracted);
        }
      } catch (err) {
        console.warn('Backend milestones offline, using extracted sample milestones');
        const extracted = availableGoals.flatMap((g) =>
          (g.milestones || []).map((m, mIdx) => ({
            ...m,
            _id: m.id,
            goalId: { _id: g.id || g._id, title: g.title, color: g.color, category: g.category },
            order: mIdx + 1,
            priority: m.priority || 'Medium',
            reward: mIdx === 0 ? 'Watch a movie' : 'Personal celebration',
            rewardClaimed: m.status === 'Completed',
          }))
        );
        setMilestones(extracted);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Save
  const handleSaveMilestone = async (data) => {
    try {
      if (editingMilestone) {
        const id = editingMilestone._id || editingMilestone.id;
        try {
          const res = await milestoneService.updateMilestone(id, data);
          setMilestones((prev) =>
            prev.map((m) => ((m._id || m.id) === id ? res.data : m))
          );
          toast.success('Milestone updated');
        } catch {
          setMilestones((prev) =>
            prev.map((m) =>
              (m._id || m.id) === id
                ? {
                    ...m,
                    ...data,
                    goalId: goals.find((g) => (g._id || g.id) === data.goalId) || m.goalId,
                  }
                : m
            )
          );
          toast.success('Milestone updated locally');
        }
      } else {
        try {
          const res = await milestoneService.createMilestone(data);
          setMilestones((prev) => [...prev, res.data]);
          toast.success('Milestone created');
        } catch {
          const parentG = goals.find((g) => (g._id || g.id) === data.goalId);
          const newM = {
            _id: `ms_${Date.now()}`,
            id: `ms_${Date.now()}`,
            ...data,
            progress: 0,
            tasksCount: 0,
            completedTasksCount: 0,
            goalId: parentG || { title: 'Goal', color: '#3b82f6' },
            order: milestones.filter((m) => (m.goalId?._id || m.goalId) === data.goalId).length + 1,
          };
          setMilestones((prev) => [...prev, newM]);
          toast.success('Milestone added locally');
        }
      }
      setEditingMilestone(null);
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  // Complete milestone celebration
  const handleConfirmComplete = async (milestone, { completionNotes, claimReward }) => {
    const id = milestone._id || milestone.id;
    try {
      await milestoneService.completeMilestone(id, { completionNotes, claimReward });
    } catch {
      // Local fallback
    }
    setMilestones((prev) =>
      prev.map((m) =>
        (m._id || m.id) === id
          ? {
              ...m,
              status: 'Completed',
              progress: 100,
              completedAt: new Date().toISOString(),
              completionNotes,
              rewardClaimed: claimReward && !!m.reward,
            }
          : m
      )
    );
    toast.success('Milestone marked completed! Goal progress updated.');
  };

  // Reopen milestone
  const handleReopen = async (milestone) => {
    const id = milestone._id || milestone.id;
    try {
      await milestoneService.reopenMilestone(id);
    } catch {
      // Local fallback
    }
    setMilestones((prev) =>
      prev.map((m) =>
        (m._id || m.id) === id
          ? { ...m, status: 'In Progress', completedAt: null, rewardClaimed: false }
          : m
      )
    );
    toast.success('Milestone reopened');
  };

  // Reorder milestone
  const handleReorder = async (milestone, direction) => {
    const id = milestone._id || milestone.id;
    try {
      await milestoneService.reorderMilestone(id, direction);
    } catch {
      // Local fallback swap
    }

    const goalId = milestone.goalId?._id || milestone.goalId;
    setMilestones((prev) => {
      const goalMilestones = prev.filter(
        (m) => (m.goalId?._id || m.goalId) === goalId
      );
      const currentIndex = goalMilestones.findIndex((m) => (m._id || m.id) === id);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex >= 0 && targetIndex < goalMilestones.length) {
        const tempOrder = goalMilestones[currentIndex].order;
        goalMilestones[currentIndex].order = goalMilestones[targetIndex].order;
        goalMilestones[targetIndex].order = tempOrder;
      }
      return [...prev];
    });
  };

  // Delete milestone
  const handleDeleteConfirm = async () => {
    if (!deletingMilestone) return;
    try {
      setIsDeleting(true);
      const id = deletingMilestone._id || deletingMilestone.id;
      try {
        await milestoneService.deleteMilestone(id);
      } catch {
        // Local removal
      }
      setMilestones((prev) => prev.filter((m) => (m._id || m.id) !== id));
      toast.success('Milestone deleted');
      setDeletingMilestone(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering
  const filteredMilestones = milestones.filter((m) => {
    const gId = m.goalId?._id || m.goalId?.id || m.goalId;
    const matchesGoal = selectedGoalId === 'all' || gId === selectedGoalId;
    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || m.priority === selectedPriority;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.reward && m.reward.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesGoal && matchesStatus && matchesPriority && matchesSearch;
  });

  // Calculate stats
  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.status === 'Completed').length;
  const inProgressCount = milestones.filter((m) => m.status === 'In Progress').length;
  const unclaimedRewardsCount = milestones.filter((m) => m.reward && !m.rewardClaimed).length;

  // Group milestones by goal if toggle is enabled
  const groupedMilestones = {};
  if (groupByGoal) {
    filteredMilestones.forEach((m) => {
      const gId = m.goalId?._id || m.goalId?.id || m.goalId || 'other';
      const gTitle = m.goalId?.title || 'Standalone Goals';
      const gColor = m.goalId?.color || '#3b82f6';

      if (!groupedMilestones[gId]) {
        groupedMilestones[gId] = {
          goalTitle: gTitle,
          goalColor: gColor,
          items: [],
        };
      }
      groupedMilestones[gId].items.push(m);
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Milestone Stages</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Divide high-level goals into achievable structured stages with rewards
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Group by Goal Toggle */}
          <button
            onClick={() => setGroupByGoal(!groupByGoal)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              groupByGoal
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Group by Goal</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingMilestone(null);
              setIsModalOpen(true);
            }}
          >
            New Milestone
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Total Stages</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-blue-600">In Progress</span>
          <p className="text-xl font-bold text-blue-700 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-emerald-600">Completed</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-amber-600">Pending Rewards</span>
          <p className="text-xl font-bold text-amber-700 mt-1">{unclaimedRewardsCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search milestone title, description, or reward..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Goal, Status, Priority Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px] truncate"
            >
              <option value="all">All Goals</option>
              {goals.map((g) => (
                <option key={g._id || g.id} value={g._id || g.id}>
                  {g.title}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              {STATUSES.slice(1).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.slice(1).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Milestones List */}
      {filteredMilestones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Milestone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Milestones Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery || selectedStatus !== 'All'
              ? 'No milestones match your current filters. Try resetting search or status.'
              : 'Add milestones to break down large goals into measurable, achievable steps.'}
          </p>
          <div className="mt-5">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingMilestone(null);
                setIsModalOpen(true);
              }}
            >
              Add First Milestone
            </Button>
          </div>
        </div>
      ) : groupByGoal ? (
        <div className="space-y-6">
          {Object.entries(groupedMilestones).map(([gId, group]) => (
            <div key={gId} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: group.goalColor }}
                />
                <h3 className="font-bold text-slate-800 text-sm">{group.goalTitle}</h3>
                <span className="text-xs text-slate-400 font-medium">
                  ({group.items.length} stages)
                </span>
              </div>

              {/* Group Items */}
              <div className="space-y-3">
                {group.items.map((milestone, idx) => (
                  <MilestoneCard
                    key={milestone._id || milestone.id}
                    milestone={milestone}
                    onComplete={(m) => setCompletingMilestone(m)}
                    onReopen={handleReopen}
                    onEdit={(m) => {
                      setEditingMilestone(m);
                      setIsModalOpen(true);
                    }}
                    onDelete={(m) => setDeletingMilestone(m)}
                    onReorder={handleReorder}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < group.items.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMilestones.map((milestone, idx) => (
            <MilestoneCard
              key={milestone._id || milestone.id}
              milestone={milestone}
              onComplete={(m) => setCompletingMilestone(m)}
              onReopen={handleReopen}
              onEdit={(m) => {
                setEditingMilestone(m);
                setIsModalOpen(true);
              }}
              onDelete={(m) => setDeletingMilestone(m)}
              onReorder={handleReorder}
              canMoveUp={idx > 0}
              canMoveDown={idx < filteredMilestones.length - 1}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Milestone Modal */}
      <MilestoneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMilestone(null);
        }}
        onSave={handleSaveMilestone}
        editingMilestone={editingMilestone}
        goals={goals}
        defaultGoalId={selectedGoalId !== 'all' ? selectedGoalId : ''}
      />

      {/* Complete Celebration Modal */}
      <MilestoneCompleteModal
        isOpen={!!completingMilestone}
        onClose={() => setCompletingMilestone(null)}
        milestone={completingMilestone}
        onConfirm={handleConfirmComplete}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingMilestone}
        onClose={() => setDeletingMilestone(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Milestone"
        message={`Are you sure you want to delete milestone "${deletingMilestone?.title}"? Linked tasks will not be deleted, but will become direct goal tasks.`}
        confirmText="Delete Milestone"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MilestonesPage;
