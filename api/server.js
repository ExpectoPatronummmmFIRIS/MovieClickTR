const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const BOOSTER_ROLE_ID = process.env.BOOSTER_ROLE_ID;
const LEVEL_10_ROLE_ID = process.env.LEVEL_10_ROLE_ID;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME;
const LAUNCH_DATE = new Date(process.env.LAUNCH_DATE);

const EPISODE_DATABASE = {
  'the-rookie': {
    tmdbId: 79744,
    seasons: {
      1: {
        episodes: {
          1: {
            title: 'Pilot',
            bunnyVideoId: '906cbfad-ead1-4b48-ad7f-742c79437e83'
          },
          2: {
            title: 'Crash Course',
            bunnyVideoId: 'ANOTHER_VIDEO_ID'
          }
        }
      },
      2: {
        episodes: {
          1: {
            title: 'Impact',
            bunnyVideoId: 'VIDEO_ID_S2E1'
          }
        }
      }
    }
  }
};

app.get('/api/test', (req, res) => {
  res.json({
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? 'SET' : 'MISSING',
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ? 'SET' : 'MISSING',
    GUILD_ID: process.env.GUILD_ID ? 'SET' : 'MISSING',
    LAUNCH_DATE: process.env.LAUNCH_DATE ? 'SET' : 'MISSING',
    TMDB_API_KEY: process.env.TMDB_API_KEY ? 'SET' : 'MISSING',
    BUNNY_LIBRARY_ID: process.env.BUNNY_LIBRARY_ID ? 'SET' : 'MISSING'
  });
});

app.get('/api/status', (req, res) => {
  const now = new Date();
  const isLive = now >= LAUNCH_DATE;
  
  res.json({
    status: isLive ? 'LIVE' : 'COMING_SOON',
    launchDate: '2026-01-06T22:00:00Z',
    message: isLive ? 'Episodes are now available' : 'No episodes shown at the moment. MovieClick will go online on January 6 2026 10 pm ET when Season 8 premieres'
  });
});

app.get('/api/tmdb/show/:showId', async (req, res) => {
  const { showId } = req.params;
  
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/${showId}`,
      {
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: 'credits,images'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch show data' });
  }
});

app.get('/api/tmdb/show/:showId/season/:seasonNum', async (req, res) => {
  const { showId, seasonNum } = req.params;
  
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNum}`,
      {
        params: {
          api_key: TMDB_API_KEY
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch season data' });
  }
});

app.get('/api/shows/the-rookie', async (req, res) => {
  const showData = EPISODE_DATABASE['the-rookie'];
  
  try {
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/tv/${showData.tmdbId}`,
      {
        params: {
          api_key: TMDB_API_KEY
        }
      }
    );
    
    res.json({
      ...tmdbResponse.data,
      availableSeasons: Object.keys(showData.seasons)
    });
  } catch (error) {
    res.json({
      name: 'The Rookie',
      availableSeasons: Object.keys(showData.seasons)
    });
  }
});

app.get('/api/s-:season-e-:episode/player', async (req, res) => {
  const { season, episode } = req.params;
  const userId = req.query.userId;
  const discordToken = req.query.token;

  const now = new Date();
  const isLive = now >= LAUNCH_DATE;

  if (!isLive) {
    return res.json({
      error: 'Not available',
      message: 'No episodes shown at the moment. MovieClick will go online on January 6 2026 10 pm ET when Season 8 premieres',
      episode: null,
      canDownload: false
    });
  }

  if (!userId || !discordToken) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please connect your Discord account to access this episode'
    });
  }

  try {
    const userResponse = await axios.get('https://discordapp.com/api/users/@me', {
      headers: { Authorization: `Bearer ${discordToken}` }
    });

    const discordUserId = userResponse.data.id;

    const memberResponse = await axios.get(
      `https://discordapp.com/api/guilds/${GUILD_ID}/members/${discordUserId}`,
      { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
    );

    const roles = memberResponse.data.roles || [];
    const isBooster = roles.includes(BOOSTER_ROLE_ID);
    const isLevel10 = roles.includes(LEVEL_10_ROLE_ID);
    const canDownload = isBooster || isLevel10;

    if (!canDownload) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only boosters (level 10+) can download episodes'
      });
    }

    const episodeData = EPISODE_DATABASE['the-rookie']?.seasons[season]?.episodes[episode];
    
    if (!episodeData) {
      return res.status(404).json({
        error: 'Episode not found',
        message: `Season ${season} Episode ${episode} is not available yet`
      });
    }

    let tmdbData = null;
    try {
      const tmdbResponse = await axios.get(
        `https://api.themoviedb.org/3/tv/${EPISODE_DATABASE['the-rookie'].tmdbId}/season/${season}/episode/${episode}`,
        {
          params: { api_key: TMDB_API_KEY }
        }
      );
      tmdbData = tmdbResponse.data;
    } catch (err) {
      console.log('Could not fetch TMDB data');
    }

    const bunnyVideoId = episodeData.bunnyVideoId;
    const videoUrl = `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/playlist.m3u8`;
    const embedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${bunnyVideoId}`;

    res.json({
      episode: `Season ${season} Episode ${episode}`,
      title: episodeData.title || `The Rookie S${season}E${episode}`,
      videoUrl: videoUrl,
      embedUrl: embedUrl,
      poster: tmdbData?.still_path ? `https://image.tmdb.org/t/p/w500${tmdbData.still_path}` : null,
      overview: tmdbData?.overview || '',
      airDate: tmdbData?.air_date || '',
      canDownload: true,
      user: discordUserId
    });

  } catch (error) {
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Could not verify Discord account'
    });
  }
});

app.get('/api/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    const tokenResponse = await axios.post('https://discord.com/api/v10/oauth2/token', new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://movieclicktr-production.up.railway.app/api/discord/callback'
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenResponse.data.access_token;
    const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const userId = userResponse.data.id;
    res.redirect(`https://movieclick.up.railway.app/?token=${accessToken}&userId=${userId}`);
  } catch (error) {
    res.status(500).json({ error: 'OAuth2 exchange failed', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MovieClick API running on port ${PORT}`);
});
