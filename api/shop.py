from http.server import BaseHTTPRequestHandler
import os, json, requests

SB_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SB_KEY  = os.environ.get("SUPABASE_KEY", "")
GUILD   = os.environ.get("MAIN_GUILD", "")
NP_KEY  = os.environ.get("NOWPAYMENTS_API_KEY", "")
NP_URL  = os.environ.get("NOWPAYMENTS_API_URL", "https://api.nowpayments.io/v1")

SB_HEADERS = {
    "apikey": SB_KEY,
    "Authorization": f"Bearer {SB_KEY}",
    "Content-Type": "application/json",
}

def sb_get(path):
    r = requests.get(f"{SB_URL}/rest/v1/{path}", headers=SB_HEADERS, timeout=8)
    return r.json() if r.ok else []


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Return stock categories and sold item count — no credentials exposed."""
        try:
            from urllib.parse import urlparse, parse_qs
            parsed  = urlparse(self.path)
            qs      = parse_qs(parsed.query)
            action  = qs.get("action", ["list"])[0]

            if action == "list":
                stock = sb_get(f"stock_items?guild_id=eq.{GUILD}&select=id,category,added_at")
                # Group by category with counts only (no passwords!)
                from collections import Counter
                cats = Counter(item["category"] for item in stock)
                sold_count = len(sb_get(f"sold_items?select=id"))
                payload = {
                    "categories": [{"name": k, "count": v} for k, v in cats.items()],
                    "total_stock": len(stock),
                    "total_sold":  sold_count,
                }

            elif action == "status":
                payment_id = qs.get("pid", [""])[0]
                if not payment_id:
                    raise ValueError("Missing payment ID")
                r = requests.get(
                    f"{NP_URL}/payment/{payment_id}",
                    headers={"x-api-key": NP_KEY},
                    timeout=8,
                )
                data = r.json()
                payload = {
                    "status":       data.get("payment_status"),
                    "payment_id":   data.get("payment_id"),
                    "pay_amount":   data.get("pay_amount"),
                    "pay_currency": data.get("pay_currency"),
                }
            else:
                payload = {"error": "Unknown action"}

            body = json.dumps(payload).encode()
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
        """Create a NowPayments invoice — API key stays server-side."""
        try:
            length  = int(self.headers.get("Content-Length", 0))
            body_in = json.loads(self.rfile.read(length)) if length else {}

            product   = body_in.get("product", "Unknown")
            price_usd = float(body_in.get("price_usd", 0))
            discord_id = body_in.get("discord_id", "")
            currency  = body_in.get("currency", "ltc")

            if not price_usd:
                raise ValueError("Missing price")

            # Create invoice
            r = requests.post(
                f"{NP_URL}/payment",
                headers={"x-api-key": NP_KEY, "Content-Type": "application/json"},
                json={
                    "price_amount":    price_usd,
                    "price_currency":  "usd",
                    "pay_currency":    currency,
                    "order_description": f"Bob's Market — {product}",
                    "is_fixed_rate":   False,
                    "is_fee_paid_by_user": False,
                },
                timeout=10,
            )
            resp_data = r.json()
            if r.status_code >= 400:
                print(f"[NP ERROR] {r.status_code}: {resp_data}")
                raise ValueError(resp_data.get("message", "Payment Provider Error"))

            # Log to Supabase
            if resp_data.get("payment_id"):
                requests.post(
                    f"{SB_URL}/rest/v1/shop_orders",
                    headers=SB_HEADERS,
                    json={
                        "payment_id":      str(resp_data["payment_id"]),
                        "product":         product,
                        "price_usd":       price_usd,
                        "buyer_discord_id": discord_id,
                        "guild_id":        GUILD,
                        "status":          "waiting",
                    },
                    timeout=5,
                )

            payload = {
                "payment_id":    resp_data.get("payment_id"),
                "pay_address":   resp_data.get("pay_address"),
                "pay_amount":    resp_data.get("pay_amount"),
                "pay_currency":  resp_data.get("pay_currency"),
                "status":        resp_data.get("payment_status"),
            }

            body = json.dumps(payload).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)

        except Exception as e:
            print(f"[SHOP EXCEPTION] {e}")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
