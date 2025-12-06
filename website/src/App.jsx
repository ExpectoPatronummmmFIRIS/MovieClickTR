import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, Lock } from 'lucide-react';

export default function MovieClick() {
  const [status, setStatus] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [season, setSeason] = useState('8');
  const [episodeNum, setEpisodeNum] = useState('1');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discordToken, setDiscordToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = 'https://movieclicktr-production.up.railway.app';

  useEffect(() => {
    fetchStatus();
    checkAuth();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/status`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError('Failed to fetch status');
    }
  };

  const checkAuth = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const uid = params.get('userId');
    
    if (token && uid) {
      setDiscordToken(token);
      setUserId(uid);
      setIsAuthenticated(true);
    }
  };

  const connectDiscord = () => {
    const clientId = '1446667555313025148';
    const redirectUri = encodeURIComponent(window.location.href);
    const scope = 'identify guilds.members.read';
    
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  const fetchEpisode = async () => {
    if (!isAuthenticated) {
      setError('Please connect Discord first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `${API_BASE}/api/s-${season}-e-${episodeNum}/player?userId=${userId}&token=${discordToken}`
      );
      const data = await res.json();
      
      if (res.ok) {
        setEpisode(data);
      } else {
        setError(data.message || 'Access denied');
        setEpisode(null);
      }
    } catch (err) {
      setError('Failed to load episode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">MovieClick</h1>
            <p className="text-xl text-blue-400">The Rookie - Exclusive Episodes</p>
          </div>

          {status && (
            <div className={`border rounded-lg p-6 mb-8 flex items-start gap-3 ${status.status === 'LIVE' ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700'}`}>
              <AlertCircle className={`flex-shrink-0 mt-1 ${status.status === 'LIVE' ? 'text-green-300' : 'text-red-300'}`} size={24} />
              <div>
                <h3 className={`font-bold mb-1 ${status.status === 'LIVE' ? 'text-green-200' : 'text-red-200'}`}>
                  {status.status === 'LIVE' ? 'Live Now' : 'Coming Soon'}
                </h3>
                <p className={status.status === 'LIVE' ? 'text-green-100' : 'text-red-100'}>
                  {status.message}
                </p>
              </div>
            </div>
          )}

          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="mb-6">
              {!isAuthenticated ? (
                <button
                  onClick={connectDiscord}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Connect Discord Account
                </button>
              ) : (
                <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                  <p className="text-green-200">✓ Discord connected</p>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">Season</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">Episode</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={episodeNum}
                      onChange={(e) => setEpisodeNum(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={fetchEpisode}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Watch Episode'}
                </button>
              </>
            )}

            {error && (
              <div className="mt-6 bg-red-900 border border-red-700 rounded-lg p-4">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {episode && (
              <div className="mt-8 space-y-6">
                <div className="bg-slate-700 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">{episode.episode}</h2>
                  
                  <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center">
                    <p className="text-slate-400">Player would load here</p>
                  </div>

                  {episode.canDownload && (
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition">
                      <Download size={20} />
                      Download Episode
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mt-8 bg-slate-700 rounded-lg p-6 flex items-start gap-3">
                <Lock className="text-slate-400 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-slate-200 mb-2">Boosters & Level 10+ Only</h3>
                  <p className="text-slate-400">
                    Downloads are exclusive to boosters and level 10+ members. Connect your Discord to verify your role.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-slate-400 text-sm">
            <p>MovieClick • The Rookie Streaming Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
