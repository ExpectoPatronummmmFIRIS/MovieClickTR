import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, Lock, LogOut, Play, Zap } from 'lucide-react';

export default function MovieClick() {
  const [status, setStatus] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [season, setSeason] = useState('8');
  const [episodeNum, setEpisodeNum] = useState('1');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discordToken, setDiscordToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [fadeIn, setFadeIn] = useState(false);

  const API_BASE = 'https://movieclicktr-production.up.railway.app';

  useEffect(() => {
    setFadeIn(true);
    fetchStatus();
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && discordToken) {
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, discordToken]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/status`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError('Failed to fetch status');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('https://discordapp.com/api/users/@me', {
        headers: { Authorization: `Bearer ${discordToken}` }
      });
      const data = await res.json();
      setUserProfile(data);
    } catch (err) {
      console.error('Failed to fetch user profile');
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
    const redirectUri = encodeURIComponent('https://movieclicktr-production.up.railway.app/api/discord/callback');
    const scope = 'identify guilds.members.read';
    
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  const disconnect = () => {
    setIsAuthenticated(false);
    setDiscordToken(null);
    setUserId(null);
    setUserProfile(null);
    window.location.href = window.location.pathname;
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black overflow-hidden">
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-50">
        <nav className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">MovieClick</h1>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-lg transition duration-300 ${currentPage === 'home' ? 'bg-white/20 backdrop-blur-md text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('status')}
                className={`px-4 py-2 rounded-lg transition duration-300 ${currentPage === 'status' ? 'bg-white/20 backdrop-blur-md text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Status
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && userProfile ? (
                <div className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 transition duration-300">
                  <img
                    src={`https://cdn.discordapp.com/avatars/${userProfile.id}/${userProfile.avatar}.png`}
                    alt={userProfile.username}
                    className="w-8 h-8 rounded-full border border-white/30"
                  />
                  <span className="text-white font-semibold text-sm hidden sm:inline">{userProfile.username}</span>
                  <button
                    onClick={disconnect}
                    className="p-1 hover:bg-white/20 rounded-full transition"
                    title="Disconnect"
                  >
                    <LogOut size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectDiscord}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold text-sm transition duration-300 transform hover:scale-105"
                >
                  Connect Discord
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className={`transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          {currentPage === 'home' && (
            <div className="max-w-7xl mx-auto px-4 py-16">
              <div className="text-center mb-12">
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-4 animate-pulse">MovieClick</h1>
                <p className="text-xl text-purple-200">Watch The Rookie - Exclusive Episodes</p>
              </div>

              {status && (
                <div className={`mb-8 backdrop-blur-xl border rounded-2xl p-8 transition duration-500 transform hover:scale-105 ${status.status === 'LIVE' ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-400/30' : 'bg-gradient-to-br from-red-500/20 to-pink-600/20 border-red-400/30'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-4 h-4 rounded-full ${status.status === 'LIVE' ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'}`}></div>
                    <h3 className={`text-2xl font-bold ${status.status === 'LIVE' ? 'text-green-200' : 'text-red-200'}`}>
                      {status.status === 'LIVE' ? '🟢 LIVE NOW' : '🔴 COMING SOON'}
                    </h3>
                  </div>
                  <p className={`text-lg ${status.status === 'LIVE' ? 'text-green-100' : 'text-red-100'}`}>
                    {status.message}
                  </p>
                </div>
              )}

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 hover:bg-white/15 transition duration-500">
                {!isAuthenticated ? (
                  <div className="text-center">
                    <Lock className="w-16 h-16 mx-auto text-purple-300 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-4">Premium Access Required</h2>
                    <p className="text-gray-300 mb-8">Connect your Discord to watch exclusive episodes</p>
                    <button
                      onClick={connectDiscord}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-lg transition duration-300 transform hover:scale-105 inline-flex items-center gap-2"
                    >
                      <Zap size={24} />
                      Connect Discord Now
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-8">Select Episode</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-purple-200 font-semibold mb-3">Season</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={season}
                          onChange={(e) => setSeason(e.target.value)}
                          className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-200 font-semibold mb-3">Episode</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={episodeNum}
                          onChange={(e) => setEpisodeNum(e.target.value)}
                          className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition duration-300"
                        />
                      </div>
                    </div>

                    <button
                      onClick={fetchEpisode}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      <Play size={24} />
                      {loading ? 'Loading...' : 'Watch Episode'}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mt-6 backdrop-blur-md bg-red-500/20 border border-red-400/30 rounded-xl p-4">
                    <p className="text-red-200 font-semibold">{error}</p>
                  </div>
                )}

                {episode && (
                  <div className="mt-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 animate-fadeIn">
                    <h2 className="text-3xl font-bold text-white mb-6">{episode.episode}</h2>
                    
                    <div className="aspect-video bg-gradient-to-br from-black/50 to-purple-900/50 rounded-2xl mb-6 flex items-center justify-center border border-white/10">
                      <Play size={64} className="text-purple-400" />
                    </div>

                    {episode.canDownload && (
                      <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition duration-300 transform hover:scale-105">
                        <Download size={24} />
                        Download Episode
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentPage === 'status' && (
            <div className="max-w-4xl mx-auto px-4 py-16">
              <h2 className="text-5xl font-bold text-white mb-12 text-center bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">System Status</h2>
              
              {status && (
                <div className={`backdrop-blur-xl border-2 rounded-3xl p-12 transition duration-500 ${status.status === 'LIVE' ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-400/30' : 'bg-gradient-to-br from-red-500/20 to-pink-600/20 border-red-400/30'}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-6 h-6 rounded-full ${status.status === 'LIVE' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                    <h3 className={`text-4xl font-bold ${status.status === 'LIVE' ? 'text-green-200' : 'text-red-200'}`}>
                      {status.status === 'LIVE' ? '🟢 LIVE' : '🔴 COMING SOON'}
                    </h3>
                  </div>
                  <p className={`text-2xl ${status.status === 'LIVE' ? 'text-green-100' : 'text-red-100'} mb-6`}>
                    {status.message}
                  </p>
                  <p className="text-gray-300 text-lg">
                    <span className="text-purple-200">Launch Date:</span> <span className="text-white font-bold">January 6, 2025 at 10:00 PM ET</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
      `}</style>
    </div>
  );
}
