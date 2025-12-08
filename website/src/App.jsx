import React, { useState, useEffect, useRef } from 'react';
import { Play, Star, Calendar, Home, TrendingUp, Sparkles, Award, Users, ChevronLeft, ChevronRight, Info, PlayCircle } from 'lucide-react';

export default function MovieClick() {
  const [status, setStatus] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [season, setSeason] = useState('1');
  const [episodeNum, setEpisodeNum] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [currentPoster, setCurrentPoster] = useState(0);
  const videoRef = useRef(null);

  const API_BASE = 'https://movieclicktr-production.up.railway.app';

  const rookiePosters = [
    'https://images.justwatch.com/poster/178491450/s718/the-rookie.jpg',
    'https://m.media-amazon.com/images/M/MV5BMTYzMjAwNDA4Nl5BMl5BanBnXkFtZTgwMzgzMDUzNjM@._V1_FMjpg_UX1000_.jpg',
    'https://flxt.tmsimg.com/assets/p15941332_b_v13_aa.jpg'
  ];

  const castMembers = [
    { name: 'Nathan Fillion', role: 'John Nolan', image: 'https://m.media-amazon.com/images/M/MV5BMTc5NzYzODQyNl5BMl5BanBnXkFtZTcwMjI3MTEzMw@@._V1_UY317_CR18,0,214,317_AL_.jpg' },
    { name: 'Melissa O\'Neil', role: 'Lucy Chen', image: 'https://m.media-amazon.com/images/M/MV5BMjE2NjU0MjQ5NF5BMl5BanBnXkFtZTgwNDU3NDU0MjE@._V1_UY317_CR51,0,214,317_AL_.jpg' },
    { name: 'Eric Winter', role: 'Tim Bradford', image: 'https://m.media-amazon.com/images/M/MV5BYWQ5YjQyZDctNzE1OS00YzY2LTkxNzktMjE5NzUxMzA2OTM5XkEyXkFqcGc@._V1_UY317_CR16,0,214,317_AL_.jpg' },
    { name: 'Alyssa Diaz', role: 'Angela Lopez', image: 'https://m.media-amazon.com/images/M/MV5BZGM2MTVmZGEtYzY0ZS00YWMxLWJhMmQtOTYwZGZlNWRhYjZkXkEyXkFqcGc@._V1_UY317_CR14,0,214,317_AL_.jpg' },
    { name: 'Richard T. Jones', role: 'Wade Grey', image: 'https://m.media-amazon.com/images/M/MV5BMTkxNjUxNTY0N15BMl5BanBnXkFtZTcwNzc2MjQzMw@@._V1_UY317_CR12,0,214,317_AL_.jpg' },
    { name: 'Mekia Cox', role: 'Nyla Harper', image: 'https://m.media-amazon.com/images/M/MV5BYWRmNjdkMjEtZTQ3OS00ZGEyLTkwZGMtNWI5MWZjMjllNTdmXkEyXkFqcGc@._V1_UY317_CR16,0,214,317_AL_.jpg' }
  ];

  const [castScroll, setCastScroll] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPoster((prev) => (prev + 1) % rookiePosters.length);
    }, 6000);
    return () => clearInterval(interval);
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

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchEpisode = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/s-${season}-e-${episodeNum}/player`);
      const data = await res.json();
      
      if (res.ok) {
        setEpisode(data);
        setTimeout(() => {
          if (videoRef.current && data.videoUrl) {
            initializePlayer(data.videoUrl);
          }
        }, 100);
      } else {
        setError(data.message || 'Episode not available');
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
      script.onload = () => setupHls(videoUrl);
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
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => video.play());
    }
  };

  const scrollCast = (direction) => {
    const container = document.getElementById('cast-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">MovieClick<span className="text-red-600">TR</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${currentPage === 'home' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={() => setCurrentPage('status')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${currentPage === 'status' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <TrendingUp size={18} />
              <span className="hidden sm:inline">Status</span>
            </button>
          </div>
        </div>
      </nav>

      {currentPage === 'home' && (
        <div>
          <div className="relative h-[70vh] sm:h-[85vh] overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
              style={{ backgroundImage: `url(${rookiePosters[currentPoster]})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-end pb-12 sm:pb-20">
              <div className="max-w-xl sm:max-w-2xl">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <span className="text-red-500 font-semibold text-xs sm:text-sm uppercase tracking-wider">Premium Series</span>
                </div>
                
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight">
                  The Rookie
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-sm sm:text-base text-slate-300">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">8.1/10</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span>2018 - Present</span>
                  <span className="text-slate-500">•</span>
                  <span className="px-2 py-1 bg-slate-800/80 rounded text-xs font-semibold">TV-14</span>
                </div>

                <p className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  Starting over isn't easy, especially for small-town guy John Nolan who, after a life-altering incident, is pursuing his dream of being an LAPD officer.
                </p>

                <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                  <span className="px-3 py-1 bg-slate-800/80 rounded-full text-xs sm:text-sm text-slate-300">Drama</span>
                  <span className="px-3 py-1 bg-slate-800/80 rounded-full text-xs sm:text-sm text-slate-300">Crime</span>
                  <span className="px-3 py-1 bg-slate-800/80 rounded-full text-xs sm:text-sm text-slate-300">Action</span>
                </div>

                <button
                  onClick={() => window.scrollTo({ top: document.getElementById('watch-section').offsetTop - 80, behavior: 'smooth' })}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
                >
                  <Play size={20} fill="white" />
                  Watch Now
                </button>
              </div>
            </div>
          </div>

          <div id="watch-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
            {status && (
              <div className={`mb-6 sm:mb-8 border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl transition-all duration-500 ${status.status === 'LIVE' ? 'bg-emerald-950/30 border-emerald-600/50' : 'bg-red-950/30 border-red-600/50'}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`w-3 h-3 rounded-full ${status.status === 'LIVE' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'} animate-pulse`}></div>
                  <h3 className={`text-lg sm:text-xl font-bold ${status.status === 'LIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {status.status === 'LIVE' ? 'NOW STREAMING' : 'COMING SOON'}
                  </h3>
                  <span className="ml-auto text-xs sm:text-sm text-slate-400">{status.message}</span>
                </div>
              </div>
            )}

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <PlayCircle className="text-red-600" size={28} />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Watch Episodes</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-slate-400 font-semibold mb-2 text-sm">Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-all duration-300"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(s => (
                      <option key={s} value={s}>Season {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-2 text-sm">Episode</label>
                  <input
                    type="number"
                    min="1"
                    max="22"
                    value={episodeNum}
                    onChange={(e) => setEpisodeNum(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-all duration-300"
                    placeholder="1-22"
                  />
                </div>
              </div>

              <button
                onClick={fetchEpisode}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-red-900/50"
              >
                <Play size={20} fill="white" />
                {loading ? 'Loading...' : 'Play Episode'}
              </button>

              {error && (
                <div className="mt-6 bg-red-950/50 border border-red-600/50 rounded-xl p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {episode && (
                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <Info className="text-red-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{episode.title}</h3>
                      {episode.overview && (
                        <p className="text-slate-400 leading-relaxed text-sm sm:text-base">{episode.overview}</p>
                      )}
                      {episode.airDate && (
                        <div className="flex items-center gap-2 text-slate-500 mt-3 text-xs sm:text-sm">
                          <Calendar size={16} />
                          <span>Aired: {episode.airDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-700">
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      poster={episode.poster}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 sm:mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Cast</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollCast('left')}
                    className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-all duration-300"
                  >
                    <ChevronLeft className="text-white" size={20} />
                  </button>
                  <button
                    onClick={() => scrollCast('right')}
                    className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-all duration-300"
                  >
                    <ChevronRight className="text-white" size={20} />
                  </button>
                </div>
              </div>

              <div 
                id="cast-container"
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {castMembers.map((cast, idx) => (
                  <div key={idx} className="flex-shrink-0 w-32 sm:w-40">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 mb-3 group">
                      <img 
                        src={cast.image} 
                        alt={cast.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x450/1e293b/64748b?text=' + cast.name.split(' ').map(n => n[0]).join('');
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1">{cast.name}</h3>
                    <p className="text-slate-400 text-xs">{cast.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'status' && (
        <div className="pt-24 sm:pt-32 max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">System Status</h2>
            <p className="text-slate-400 text-sm sm:text-base">Check the current availability of MovieClickTR</p>
          </div>
          
          {status && (
            <div className={`border-2 rounded-xl sm:rounded-2xl p-8 sm:p-12 backdrop-blur-xl transition-all duration-500 ${status.status === 'LIVE' ? 'bg-emerald-950/30 border-emerald-600/50' : 'bg-red-950/30 border-red-600/50'}`}>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`w-6 h-6 rounded-full ${status.status === 'LIVE' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'} animate-pulse`}></div>
                <h3 className={`text-3xl sm:text-4xl font-black ${status.status === 'LIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {status.status === 'LIVE' ? 'LIVE' : 'COMING SOON'}
                </h3>
              </div>
              <p className={`text-xl sm:text-2xl text-center ${status.status === 'LIVE' ? 'text-emerald-300' : 'text-red-300'} mb-8`}>
                {status.message}
              </p>
              <div className="bg-slate-900/50 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-base sm:text-lg mb-2">Launch Date</p>
                <p className="text-white font-bold text-xl sm:text-2xl">January 6, 2025 at 10:00 PM ET</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 text-center">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-white font-bold text-base sm:text-lg mb-2">Open Access</h3>
              <p className="text-slate-400 text-xs sm:text-sm">No login required</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 text-center">
              <Award className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-white font-bold text-base sm:text-lg mb-2">Premium Quality</h3>
              <p className="text-slate-400 text-xs sm:text-sm">HD streaming</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 text-center">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-white font-bold text-base sm:text-lg mb-2">Latest Episodes</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Updated regularly</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
