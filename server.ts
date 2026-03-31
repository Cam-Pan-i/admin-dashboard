import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/discord/guild", async (req, res) => {
    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!token || !guildId) {
      return res.status(500).json({ 
        error: "Discord credentials missing. Please set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID in your environment." 
      });
    }

    try {
      // Fetch guild information
      const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
        headers: {
          Authorization: `Bot ${token}`,
        },
      });

      if (!guildResponse.ok) {
        const errorData = await guildResponse.json();
        return res.status(guildResponse.status).json({ error: "Discord API error", details: errorData });
      }

      const guildData = await guildResponse.json();

      // Fetch roles separately if needed, but they are usually in the guild object
      // The guild object includes roles, name, approximate_member_count, etc.

      res.json({
        name: guildData.name,
        memberCount: guildData.approximate_member_count,
        icon: guildData.icon ? `https://cdn.discordapp.com/icons/${guildId}/${guildData.icon}.png` : null,
        roles: guildData.roles.map((role: any) => ({
          id: role.id,
          name: role.name,
          color: role.color,
          position: role.position,
        })).sort((a: any, b: any) => b.position - a.position),
      });
    } catch (error) {
      console.error("Error fetching Discord data:", error);
      res.status(500).json({ error: "Failed to fetch Discord data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
