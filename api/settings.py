from http.server import BaseHTTPRequestHandler
import os, json, requests
from urllib.parse import urlparse, parse_qs

SB_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SB_KEY  = os.environ.get("SUPABASE_KEY", "")
GUILD   = os.environ.get("MAIN_GUILD", "")

HEADERS = {
    "apikey": SB_KEY,
    "Authorization": f"Bearer {SB_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

def sb_get(path):
    r = requests.get(f"{SB_URL}/rest/v1/{path}", headers=HEADERS, timeout=8)
    return r.json() if r.ok else []


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Return full bot_settings row for the dashboard."""
        try:
            rows = sb_get(f"bot_settings?id=eq.global&select=*")
            settings = rows[0] if rows else {}
            # Strip internal signals before sending to browser
            for key in ("restart_signal", "shutdown_signal", "post_tickets_signal", "post_verification_signal"):
                settings.pop(key, None)

            body = json.dumps({"settings": settings}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_POST(self):
        """Save a subset of bot_settings fields."""
        try:
            length  = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length)) if length else {}

            # Whitelist allowed fields — never expose credentials via PATCH
            ALLOWED = {
                # General
                "prefix", "maintenance_mode", "bot_name", "maintenance_msg", "ephemeral_default",
                # Moderation roles
                "owner_role_id", "admin_role_id", "mod_role_id", "helper_role_id",
                "spam_level", "raid_shield", "auto_role_id",
                # Tickets
                "ticket_category_id", "transcript_channel_id", "ticket_landing_id",
                "ticket_welcome_msg", "log_channel_id",
                # Verification
                "verification_channel", "verified_role", "everyone_role", "difficulty",
                # Logging & Filters
                "log_delete", "log_join", "log_roles",
                "ghost_ping_detector", "anti_link", "anti_invites", "bad_words",
                # Community Features
                "suggestion_channel_id", "starboard_channel_id",
                # Welcome / Leave
                "welcome_enabled", "welcome_channel_id", "welcome_msg",
                "leave_enabled", "leave_channel_id", "leave_msg",
                # Auto-Mod
                "anti_link", "anti_invites", "bad_words",
                # Shop
                "shop_active", "auto_ship", "shop_url",
                "ltc_wallet", "btc_wallet", "eth_wallet", "usdt_wallet", "sol_wallet",
                # Bot presence
                "bot_status", "activity_type", "activity_text",
                # Voice
                "auto_vc_category_id", "auto_vc_channel_id", "idle_timeout", "afk_channel_id",
            }
            clean = {k: v for k, v in payload.items() if k in ALLOWED}
            if not clean:
                raise ValueError("No valid fields to update")

            r = requests.patch(
                f"{SB_URL}/rest/v1/bot_settings?id=eq.global",
                headers=HEADERS,
                json=clean,
                timeout=8,
            )
            self.send_response(200 if r.ok else 400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": r.ok, "status": r.status_code}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
