'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface GameCreditConfig {
  _id: string;
  gameId: {
    _id: string;
    title: string;
    description: string;
  };
  gameTitle: string;
  enabled: boolean;
  earningRules: Array<{
    type: string;
    credits: number;
    requirement: {
      playtimeHours?: number;
      achievementId?: string;
      milestone?: string;
      description: string;
    };
    maxClaims?: number;
    cooldownHours?: number;
  }>;
  totalCreditsDistributed: number;
  totalPlayers: number;
}

export default function GameCreditManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [configs, setConfigs] = useState<GameCreditConfig[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [newRule, setNewRule] = useState({
    type: 'playtime' as 'playtime' | 'achievement' | 'milestone' | 'daily_login' | 'completion',
    credits: 10,
    playtimeHours: 1,
    achievementId: '',
    milestone: '',
    description: '',
    maxClaims: undefined as number | undefined,
    cooldownHours: undefined as number | undefined,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/MonyAdmin/login');
      return;
    }
    if (status === 'authenticated') {
      fetchConfigs();
      fetchGames();
    }
  }, [status, router]);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/app-builder/games/credits/config');
      const data = await response.json();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setGames(data.projects || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleSaveConfig = async (configId: string, updates: any) => {
    try {
      const config = configs.find((c) => c._id === configId);
      if (!config) return;

      const response = await fetch('/api/app-builder/games/credits/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: typeof config.gameId === 'object' ? config.gameId._id : config.gameId,
          ...updates,
        }),
      });

      const data = await response.json();
      if (data.config) {
        await fetchConfigs();
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    }
  };

  const handleAddRule = async (configId: string) => {
    try {
      const config = configs.find((c) => c._id === configId);
      if (!config) return;

      const requirement: any = {
        description: newRule.description || `Earn ${newRule.credits} credits`,
      };

      if (newRule.type === 'playtime') {
        requirement.playtimeHours = newRule.playtimeHours;
        requirement.description = `Play for ${newRule.playtimeHours} hour(s)`;
      } else if (newRule.type === 'achievement') {
        requirement.achievementId = newRule.achievementId;
        requirement.description = `Unlock achievement: ${newRule.achievementId}`;
      } else if (newRule.type === 'milestone') {
        requirement.milestone = newRule.milestone;
        requirement.description = `Reach milestone: ${newRule.milestone}`;
      }

      const updatedRules = [
        ...config.earningRules,
        {
          type: newRule.type,
          credits: newRule.credits,
          requirement,
          maxClaims: newRule.maxClaims,
          cooldownHours: newRule.cooldownHours,
        },
      ];

      await handleSaveConfig(configId, { earningRules: updatedRules });
      setNewRule({
        type: 'playtime',
        credits: 10,
        playtimeHours: 1,
        achievementId: '',
        milestone: '',
        description: '',
        maxClaims: undefined,
        cooldownHours: undefined,
      });
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const handleCreateConfig = async () => {
    if (!selectedGame) {
      alert('Please select a game');
      return;
    }

    try {
      const response = await fetch('/api/app-builder/games/credits/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGame,
          enabled: true,
          earningRules: [],
        }),
      });

      const data = await response.json();
      if (data.config) {
        await fetchConfigs();
        setShowAddForm(false);
        setSelectedGame('');
      }
    } catch (error) {
      console.error('Error creating config:', error);
      alert('Failed to create configuration');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Game Credit Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure games to award credits to players
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Game'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add Game to Credit System</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Game</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">Choose a game...</option>
                {games
                  .filter((game) => !configs.some((c) => (typeof c.gameId === 'object' ? c.gameId._id : c.gameId) === game._id))
                  .map((game) => (
                    <option key={game._id} value={game._id}>
                      {game.title}
                    </option>
                  ))}
              </select>
            </div>
            <button
              onClick={handleCreateConfig}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Create Configuration
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {configs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              No games configured yet. Add a game to get started.
            </p>
          </div>
        ) : (
          configs.map((config) => (
            <div key={config._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {typeof config.gameId === 'object' ? config.gameId.title : config.gameTitle}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {config.totalPlayers} players • {config.totalCreditsDistributed} credits distributed
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => handleSaveConfig(config._id, { enabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">Enabled</span>
                </label>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Earning Rules</h4>
                {config.earningRules.map((rule, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium capitalize">{rule.type}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rule.requirement.description}
                        </p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {rule.credits} credits
                        </p>
                        {rule.maxClaims && (
                          <p className="text-xs text-gray-500">
                            Max claims: {rule.maxClaims}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const updatedRules = config.earningRules.filter((_, i) => i !== index);
                          handleSaveConfig(config._id, { earningRules: updatedRules });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
                  <h5 className="font-semibold mb-3">Add New Rule</h5>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Type</label>
                        <select
                          value={newRule.type}
                          onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        >
                          <option value="playtime">Playtime</option>
                          <option value="achievement">Achievement</option>
                          <option value="milestone">Milestone</option>
                          <option value="daily_login">Daily Login</option>
                          <option value="completion">Completion</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Credits</label>
                        <input
                          type="number"
                          value={newRule.credits}
                          onChange={(e) => setNewRule({ ...newRule, credits: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                      </div>
                    </div>
                    {newRule.type === 'playtime' && (
                      <div>
                        <label className="block text-xs font-medium mb-1">Hours Required</label>
                        <input
                          type="number"
                          value={newRule.playtimeHours}
                          onChange={(e) => setNewRule({ ...newRule, playtimeHours: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                      </div>
                    )}
                    {newRule.type === 'achievement' && (
                      <div>
                        <label className="block text-xs font-medium mb-1">Achievement ID</label>
                        <input
                          type="text"
                          value={newRule.achievementId}
                          onChange={(e) => setNewRule({ ...newRule, achievementId: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                          placeholder="achievement_1"
                        />
                      </div>
                    )}
                    {newRule.type === 'milestone' && (
                      <div>
                        <label className="block text-xs font-medium mb-1">Milestone</label>
                        <input
                          type="text"
                          value={newRule.milestone}
                          onChange={(e) => setNewRule({ ...newRule, milestone: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                          placeholder="level_10"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Max Claims (optional)</label>
                        <input
                          type="number"
                          value={newRule.maxClaims || ''}
                          onChange={(e) => setNewRule({ ...newRule, maxClaims: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                          placeholder="Unlimited"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Cooldown (hours)</label>
                        <input
                          type="number"
                          value={newRule.cooldownHours || ''}
                          onChange={(e) => setNewRule({ ...newRule, cooldownHours: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                          placeholder="No cooldown"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddRule(config._id)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Add Rule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

