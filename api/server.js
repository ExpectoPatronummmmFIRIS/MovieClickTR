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

const LAUNCH_DATE = new Date(process.env.LAUNCH_DATE);

app.get('/api/status', (req, res) => {
  const now = new Date();
  const isLive = now >= LAUNCH_DATE;
  
  res.json({
    status: isLive ? 'LIVE' : 'COMING_SOON',
    launchDate: '2025-01-06T22:00:00Z',
    message: isLive ? 'Episodes are now available' : 'No episodes shown at the moment. MovieClick will go online on January 6 2025 10 pm ET when Season 8 premieres'
  });
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

    res.json({
      episode: `Season ${season} Episode ${episode}`,
      title: `The Rookie S${season}E${episode}`,
      playerUrl: `https://player.example.com/s${season}e${episode}`,
      fileUrl: `https://files.example.com/the-rookie-s${season}e${episode}.mp4`,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MovieClick API running on port ${PORT}`);
});
