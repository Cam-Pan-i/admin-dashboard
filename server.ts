import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";

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

  app.get("/api/discord/members", async (req, res) => {
    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!token || !guildId) {
      return res.status(500).json({ 
        error: "Discord credentials missing." 
      });
    }

    try {
      // Fetch members (limit 100 for now)
      const membersResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=100`, {
        headers: {
          Authorization: `Bot ${token}`,
        },
      });

      if (!membersResponse.ok) {
        const errorData = await membersResponse.json();
        return res.status(membersResponse.status).json({ error: "Discord API error", details: errorData });
      }

      const membersData = await membersResponse.json();

      // Fetch guild roles to map IDs to names
      const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
        headers: {
          Authorization: `Bot ${token}`,
        },
      });
      const guildData = await guildResponse.json();
      const rolesMap = new Map<string, any>(guildData.roles.map((r: any) => [r.id, r]));

      const formattedMembers = membersData.map((m: any) => ({
        id: m.user.id,
        username: `${m.user.username}${m.user.discriminator !== '0' ? `#${m.user.discriminator}` : ''}`,
        avatar: m.user.avatar ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png` : null,
        joinDate: m.joined_at,
        premiumSince: m.premium_since,
        roles: m.roles.map((roleId: string) => {
          const role = rolesMap.get(roleId);
          return role ? { id: role.id, name: role.name, color: role.color } : null;
        }).filter(Boolean),
        status: 'unknown', // Status requires presence intent and gateway, not available via simple HTTP GET members
        nickname: m.nick,
        isBot: m.user.bot
      }));

      res.json(formattedMembers);
    } catch (error) {
      console.error("Error fetching Discord members:", error);
      res.status(500).json({ error: "Failed to fetch Discord members" });
    }
  });

  app.get("/api/discord/audit-logs", async (req, res) => {
    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!token || !guildId) {
      return res.status(500).json({ error: "Discord credentials missing." });
    }

    try {
      const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/audit-logs?limit=20`, {
        headers: { Authorization: `Bot ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: "Discord API error", details: errorData });
      }

      const data = await response.json();
      
      // Map audit log events to a more readable format
      // Action types: 20=MEMBER_KICK, 22=MEMBER_BAN_ADD, 23=MEMBER_BAN_REMOVE, 24=MEMBER_UPDATE, etc.
      const actionMap: Record<number, string> = {
        1: 'guild_update',
        10: 'channel_create',
        11: 'channel_update',
        12: 'channel_delete',
        13: 'channel_overwrite_create',
        14: 'channel_overwrite_update',
        15: 'channel_overwrite_delete',
        20: 'kick',
        21: 'prune',
        22: 'ban',
        23: 'unban',
        24: 'update',
        25: 'role_update',
        26: 'invite_create',
        27: 'invite_update',
        28: 'invite_delete',
        30: 'webhook_create',
        31: 'webhook_update',
        32: 'webhook_delete',
        40: 'emoji_create',
        41: 'emoji_update',
        42: 'emoji_delete',
        50: 'message_delete',
        51: 'message_bulk_delete',
        52: 'message_pin',
        53: 'message_unpin',
        60: 'integration_create',
        61: 'integration_update',
        62: 'integration_delete',
        72: 'thread_create',
        73: 'thread_update',
        74: 'thread_delete',
        80: 'sticker_create',
        81: 'sticker_update',
        82: 'sticker_delete',
        110: 'automod_rule_create',
        111: 'automod_rule_update',
        112: 'automod_rule_delete',
        113: 'automod_block_message',
      };

      const logs = data.audit_log_entries.map((entry: any) => {
        const user = data.users.find((u: any) => u.id === entry.user_id);
        const target = data.users.find((u: any) => u.id === entry.target_id);
        
        return {
          id: entry.id,
          mod: user ? user.username : 'Unknown',
          user: target ? target.username : (entry.target_id || 'System'),
          action: actionMap[entry.action_type] || `action_${entry.action_type}`,
          reason: entry.reason || 'No reason provided',
          time: 'Recently' // Discord doesn't provide relative time strings, we'd need to parse entry.id for timestamp or use a lib
        };
      });

      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  app.post("/api/discord/moderate", express.json(), async (req, res) => {
    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    const { userId, action, reason } = req.body;

    if (!token || !guildId) {
      return res.status(500).json({ error: "Discord credentials missing." });
    }

    try {
      let endpoint = "";
      let method = "PUT";

      if (action.toLowerCase() === 'ban') {
        endpoint = `https://discord.com/api/v10/guilds/${guildId}/bans/${userId}`;
        method = "PUT";
      } else if (action.toLowerCase() === 'kick') {
        endpoint = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`;
        method = "DELETE";
      } else {
        return res.status(400).json({ error: "Unsupported moderation action via API." });
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
          'X-Audit-Log-Reason': reason || 'Moderated via Bob Admin'
        },
        body: method === "PUT" ? JSON.stringify({ delete_message_days: 1 }) : undefined
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: "Discord API error", details: errorData });
      }

      res.json({ success: true, message: `User ${userId} has been ${action}ed.` });
    } catch (error) {
      console.error("Error executing moderation action:", error);
      res.status(500).json({ error: "Failed to execute moderation action" });
    }
  });

  app.post("/api/discord/send-embed", express.json(), async (req, res) => {
    const token = process.env.DISCORD_BOT_TOKEN;
    const mainGuildId = process.env.DISCORD_GUILD_ID;
    const { guildId, channelId, embed, content } = req.body;

    if (!token) {
      return res.status(500).json({ error: "Discord bot token missing." });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID is required." });
    }

    const targetGuildId = guildId || mainGuildId;

    try {
      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content || "",
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: "Discord API error", details: errorData });
      }

      const data = await response.json();
      res.json({ success: true, message: "Embed sent successfully!", messageId: data.id });
    } catch (error) {
      console.error("Error sending embed:", error);
      res.status(500).json({ error: "Failed to send embed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // SPA fallback for development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // Read index.html
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        // Apply Vite HTML transforms
        template = await vite.transformIndexHtml(url, template);
        // Send the transformed HTML
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
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
