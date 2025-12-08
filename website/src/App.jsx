import React, { useState, useEffect, useRef } from 'react';
import { Download, Lock, LogOut, Play, Film, Star, Calendar, Clock, Home, TrendingUp } from 'lucide-react';

export default function MovieClick() {
  const [status, setStatus] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [season, setSeason] = useState('1');
  const [episodeNum, setEpisodeNum] = useState('1');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discordToken, setDiscordToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const videoRef = useRef(null);

  const API_BASE = 'https://movieclicktr-production.up.railway.app';

  const loadFontAwesome = () => {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
      document.head.appendChild(link);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/status`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError('Failed to fetch status');
    }
  };

  const fetchUserProfile = React.useCallback(async () => {
    if (!discordToken) return;
    try {
      const res = await fetch('https://discordapp.com/api/users/@me', {
        headers: { Authorization: `Bearer ${discordToken}` }
      });
      const data = await res.json();
      setUserProfile(data);
    } catch (err) {
      console.error('Failed to fetch user profile');
    }
  }, [discordToken]);

  useEffect(() => {
    fetchStatus();
    checkAuth();
    loadFontAwesome();
  }, []);

  useEffect(() => {
    if (isAuthenticated && discordToken) {
      fetchUserProfile();
    }
  }, [isAuthenticated, discordToken, fetchUserProfile]);

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
    setEpisode(null);
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
        setTimeout(() => {
          if (videoRef.current && data.videoUrl) {
            initializePlayer(data.videoUrl);
          }
        }, 100);
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

  const initializePlayer = (videoUrl) => {
    if (!window.Hls) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.7/hls.min.js';
      script.onload = () => {
        setupHls(videoUrl);
      };
      document.body.appendChild(script);
    } else {
      setupHls(videoUrl);
    }
  };

  const setupHls = (videoUrl) => {
    const video = videoRef.current;
    if (!video) return;

    if (window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <nav className="bg-black/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/50">
              <Film className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">MovieClick<span className="text-red-600">TR</span></h1>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${currentPage === 'home' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Home size={18} />
              Home
            </button>
            <button
              onClick={() => setCurrentPage('status')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${currentPage === 'status' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <TrendingUp size={18} />
              Status
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && userProfile ? (
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-750 transition-all duration-300">
                <img
                  src={`https://cdn.discordapp.com/avatars/${userProfile.id}/${userProfile.avatar}.png`}
                  alt={userProfile.username}
                  className="w-8 h-8 rounded-full border-2 border-red-600"
                />
                <span className="text-white font-semibold text-sm hidden sm:inline">{userProfile.username}</span>
                <button
                  onClick={disconnect}
                  className="p-1 hover:bg-gray-700 rounded-full transition"
                  title="Disconnect"
                >
                  <LogOut size={16} className="text-red-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectDiscord}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-900/50"
              >
                <i className="fab fa-discord mr-2"></i>
                Connect Discord
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="relative">
        {currentPage === 'home' && (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
                MovieClick<span className="text-red-600">TR</span>
              </h1>
              <p className="text-xl text-gray-400">Watch The Rookie - Season 1 Episode 1</p>
            </div>

            {status && (
              <div className={`mb-8 border-2 rounded-2xl p-8 transition-all duration-500 transform hover:scale-[1.02] ${status.status === 'LIVE' ? 'bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-green-600' : 'bg-gradient-to-br from-red-950/50 to-pink-950/50 border-red-600'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-4 h-4 rounded-full ${status.status === 'LIVE' ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'}`}></div>
                  <h3 className={`text-2xl font-bold ${status.status === 'LIVE' ? 'text-green-400' : 'text-red-400'}`}>
                    {status.status === 'LIVE' ? 'LIVE NOW' : 'COMING SOON'}
                  </h3>
                </div>
                <p className={`text-lg ${status.status === 'LIVE' ? 'text-green-300' : 'text-red-300'}`}>
                  {status.message}
                </p>
              </div>
            )}

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-12 hover:bg-gray-900/70 transition-all duration-500 shadow-2xl">
              {!isAuthenticated ? (
                <div className="text-center">
                  <Lock className="w-16 h-16 mx-auto text-red-500 mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-4">Premium Access Required</h2>
                  <p className="text-gray-400 mb-8">Connect your Discord to watch exclusive episodes</p>
                  <button
                    onClick={connectDiscord}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2 shadow-lg shadow-red-900/50"
                  >
                    <i className="fab fa-discord text-2xl"></i>
                    Connect Discord Now
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <Film className="text-red-600" />
                    Select Episode
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-gray-400 font-semibold mb-3 flex items-center gap-2">
                        <i className="fas fa-layer-group text-red-600"></i>
                        Season
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-semibold mb-3 flex items-center gap-2">
                        <i className="fas fa-film text-red-600"></i>
                        Episode
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={episodeNum}
                        onChange={(e) => setEpisodeNum(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <button
                    onClick={fetchEpisode}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-red-900/50"
                  >
                    <Play size={24} />
                    {loading ? 'Loading...' : 'Watch Episode'}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-950/50 border-2 border-red-600 rounded-xl p-4">
                  <p className="text-red-300 font-semibold flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                  </p>
                </div>
              )}

              {episode && (
                <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-2xl p-8 animate-fadeIn">
                  <div className="flex items-center gap-3 mb-6">
                    <Star className="text-red-600" size={28} />
                    <h2 className="text-3xl font-bold text-white">{episode.title}</h2>
                  </div>

                  {episode.overview && (
                    <p className="text-gray-400 mb-6 leading-relaxed">{episode.overview}</p>
                  )}

                  {episode.airDate && (
                    <div className="flex items-center gap-2 text-gray-500 mb-6">
                      <Calendar size={18} />
                      <span>Air Date: {episode.airDate}</span>
                    </div>
                  )}
                  
                  <div className="aspect-video bg-black rounded-2xl mb-6 border border-gray-700 overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      poster={episode.poster}
                    >
                      Your browser does not support HLS video playback.
                    </video>
                  </div>

                  {episode.canDownload && (
                    <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-green-900/50">
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
            <h2 className="text-5xl font-bold text-white mb-12 text-center">System Status</h2>
            
            {status && (
              <div className={`border-2 rounded-3xl p-12 transition-all duration-500 ${status.status === 'LIVE' ? 'bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-green-600' : 'bg-gradient-to-br from-red-950/50 to-pink-950/50 border-red-600'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-6 h-6 rounded-full ${status.status === 'LIVE' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'} animate-pulse`}></div>
                  <h3 className={`text-4xl font-bold ${status.status === 'LIVE' ? 'text-green-400' : 'text-red-400'}`}>
                    {status.status === 'LIVE' ? 'LIVE' : 'COMING SOON'}
                  </h3>
                </div>
                <p className={`text-2xl ${status.status === 'LIVE' ? 'text-green-300' : 'text-red-300'} mb-6`}>
                  {status.message}
                </p>
                <p className="text-gray-400 text-lg flex items-center gap-2">
                  <Clock size={20} />
                  <span className="text-gray-500">Launch Date:</span> <span className="text-white font-bold">January 6, 2025 at 10:00 PM ET</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
      `}</style>
    </div>
  );
}
