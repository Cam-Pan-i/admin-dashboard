from http.server import BaseHTTPRequestHandler
import json, os, requests, urllib.parse

SB_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SB_KEY = os.environ.get("SUPABASE_KEY", "")
GUILD  = os.environ.get("MAIN_GUILD", "")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 1. Extract Identity from Client Payload
            length = int(self.headers.get("Content-Length", 0))
            body_in = json.loads(self.rfile.read(length)) if length else {}
            vid = body_in.get("vid", "V-UNKNOWN")
            fp  = body_in.get("fp",  "FP-UNKNOWN")
            path = body_in.get("path", "/")

            # 2. Extract Geo Telemetry from Edge Headers
            country = self.headers.get("x-vercel-ip-country", "US")
            city    = urllib.parse.unquote(self.headers.get("x-vercel-ip-city", "Unknown"))
            ip      = self.headers.get("x-real-ip", "127.0.0.1")
            ua      = self.headers.get("user-agent", "Unknown")

            # ── Anti-Bot Protocol ──
            bot_keywords = ["oracle", "amazon", "aws", "googlebot", "bingbot", "ahrefs", "semrush", "serpstat", "dotbot", "python-requests", "go-http-client"]
            ua_lower = ua.lower()
            
            # Check for Banned IPs in Registry
            is_banned = False
            if SB_URL and SB_KEY:
                h = {"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"}
                try:
                    r_ban = requests.get(f"{SB_URL}/rest/v1/banned_ips?ip=eq.{ip}&select=ip", headers=h, timeout=3)
                    if r_ban.ok and r_ban.json():
                        is_banned = True
                except:
                    pass

            if is_banned or any(k in ua_lower for k in bot_keywords):
                self.send_response(403)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "denied", "message": "Neural Sentry: Node blacklisted or unauthorized."}).encode())
                return

            # 3. Global Neural Fiscal Matrix
            CURRENCY_MAP = {
                "AF": "AFN", "AX": "EUR", "AL": "ALL", "DZ": "DZD", "AS": "USD", "AD": "EUR", "AO": "AOA", "AI": "XCD", "AQ": "XCD", "AG": "XCD", "AR": "ARS", "AM": "AMD", "AW": "AWG", "AU": "AUD", "AT": "EUR", "AZ": "AZN",
                "BS": "BSD", "BH": "BHD", "BD": "BDT", "BB": "BBD", "BY": "BYN", "BE": "EUR", "BZ": "BZD", "BJ": "XOF", "BM": "BMD", "BT": "BTN", "BO": "BOB", "BQ": "USD", "BA": "BAM", "BW": "BWP", "BV": "NOK", "BR": "BRL",
                "IO": "USD", "BN": "BND", "BG": "BGN", "BF": "XOF", "BI": "BIF", "KH": "KHR", "CM": "XAF", "CA": "CAD", "CV": "CVE", "KY": "KYD", "CF": "XAF", "TD": "XAF", "CL": "CLP", "CN": "CNY", "CX": "AUD", "CC": "AUD",
                "CO": "COP", "KM": "KMF", "CG": "XAF", "CD": "CDF", "CK": "NZD", "CR": "CRC", "CI": "XOF", "HR": "EUR", "CU": "CUP", "CW": "ANG", "CY": "EUR", "CZ": "CZK", "DK": "DKK", "DJ": "DJF", "DM": "XCD", "DO": "DOP",
                "EC": "USD", "EG": "EGP", "SV": "USD", "GQ": "XAF", "ER": "ERN", "EE": "EUR", "ET": "ETB", "FK": "FKP", "FO": "DKK", "FJ": "FJD", "FI": "EUR", "FR": "EUR", "GF": "EUR", "PF": "XPF", "TF": "EUR", "GA": "XAF",
                "GM": "GMD", "GE": "GEL", "DE": "EUR", "GH": "GHS", "GI": "GIP", "GR": "EUR", "GL": "DKK", "GD": "XCD", "GP": "EUR", "GU": "USD", "GT": "GTQ", "GG": "GBP", "GN": "GNF", "GW": "XOF", "GY": "GYD", "HT": "HTG",
                "HM": "AUD", "VA": "EUR", "HN": "HNL", "HK": "HKD", "HU": "HUF", "IS": "ISK", "IN": "INR", "ID": "IDR", "IR": "IRR", "IQ": "IQD", "IE": "EUR", "IM": "GBP", "IL": "ILS", "IT": "EUR", "JM": "JMD", "JP": "JPY",
                "JE": "GBP", "JO": "JOD", "KZ": "KZT", "KE": "KES", "KI": "AUD", "KP": "KPW", "KR": "KRW", "KW": "KWD", "KG": "KGS", "LA": "LAK", "LV": "EUR", "LB": "LBP", "LS": "LSL", "LR": "LRD", "LY": "LYD", "LI": "CHF",
                "LT": "EUR", "LU": "EUR", "MO": "MOP", "MK": "MKD", "MG": "MGA", "MW": "MWK", "MY": "MYR", "MV": "MVR", "ML": "XOF", "MT": "EUR", "MH": "USD", "MQ": "EUR", "MR": "MRU", "MU": "MUR", "YT": "EUR", "MX": "MXN",
                "FM": "USD", "MD": "MDL", "MC": "EUR", "MN": "MNT", "ME": "EUR", "MS": "XCD", "MA": "MAD", "MZ": "MZN", "MM": "MMK", "NA": "NAD", "NR": "AUD", "NP": "NPR", "NL": "EUR", "NC": "XPF", "NZ": "NZD", "NI": "NIO",
                "NE": "XOF", "NG": "NGN", "NU": "NZD", "NF": "AUD", "MP": "USD", "NO": "NOK", "OM": "OMR", "PK": "PKR", "PW": "USD", "PS": "ILS", "PA": "PAB", "PG": "PGK", "PY": "PYG", "PE": "PEN", "PH": "PHP", "PN": "NZD",
                "PL": "PLN", "PT": "EUR", "PR": "USD", "QA": "QAR", "RE": "EUR", "RO": "RON", "RU": "RUB", "RW": "RWF", "BL": "EUR", "SH": "SHP", "KN": "XCD", "LC": "XCD", "MF": "EUR", "PM": "EUR", "VC": "XCD", "WS": "WST",
                "SM": "EUR", "ST": "STN", "SA": "SAR", "SN": "XOF", "RS": "RSD", "SC": "SCR", "SL": "SLL", "SG": "SGD", "SX": "ANG", "SK": "EUR", "SI": "EUR", "SB": "SBD", "SO": "SOS", "ZA": "ZAR", "GS": "GBP", "SS": "SSP",
                "ES": "EUR", "LK": "LKR", "SD": "SDG", "SR": "SRD", "SJ": "NOK", "SZ": "SZL", "SE": "SEK", "CH": "CHF", "SY": "SYP", "TW": "TWD", "TJ": "TJS", "TZ": "TZS", "TH": "THB", "TL": "USD", "TG": "XOF", "TK": "NZD",
                "TO": "TOP", "TT": "TTD", "TN": "TND", "TR": "TRY", "TM": "TMT", "TC": "USD", "TV": "AUD", "UG": "UGX", "UA": "UAH", "AE": "AED", "GB": "GBP", "US": "USD", "UM": "USD", "UY": "UYI", "UZ": "UZS", "VU": "VUV",
                "VE": "VES", "VN": "VND", "VG": "USD", "VI": "USD", "WF": "XPF", "EH": "MAD", "YE": "YER", "ZM": "ZMW", "ZW": "ZWL"
            }
            currency = CURRENCY_MAP.get(country, "USD")

            # 4. Secure Chronic Logging (Supabase)
            if SB_URL and SB_KEY:
                headers = {"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}", "Content-Type": "application/json"}
                try:
                    requests.post(f"{SB_URL}/rest/v1/visitor_logs", headers=headers, json={
                        "visitor_id": vid, "fingerprint": fp, "ip": ip, "country": country, "city": city, "path": path, "user_agent": ua
                    }, timeout=5)
                    requests.post(f"{SB_URL}/rest/v1/bot_control", headers=headers, json={
                        "guild_id": GUILD, "signal": "visitor_alert", "status": "pending",
                        "payload": {"vid": vid, "fp": fp, "ip": ip, "loc": f"{city}, {country}", "path": path}
                    }, timeout=5)
                except:
                    pass

            # 5. Respond with Neural Localization Data
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"ip":ip,"country":country,"city":city,"currency":currency,"vid":vid,"fp":fp}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_GET(self):
        # Fallback for GET requests
        country = self.headers.get("x-vercel-ip-country", "US")
        city    = urllib.parse.unquote(self.headers.get("x-vercel-ip-city", "Unknown"))
        ip      = self.headers.get("x-real-ip", "127.0.0.1")
        
        CURRENCY_MAP = {
            "GB": "GBP", "FR": "EUR", "DE": "EUR", "IT": "EUR", "ES": "EUR", "NL": "EUR", "BE": "EUR", "GR": "EUR",
            "CA": "CAD", "AU": "AUD", "JP": "JPY", "CN": "CNY", "IN": "INR", "KR": "KRW", "BR": "BRL", "MX": "MXN",
            "RU": "RUB", "TR": "TRY", "PL": "PLN", "EG": "EGP", "SA": "SAR", "AE": "AED", "PK": "PKR",
            "NG": "NGN", "ZA": "ZAR", "SG": "SGD", "MY": "MYR", "TH": "THB", "ID": "IDR", "VN": "VND", "IL": "ILS",
            "PH": "PHP", "BD": "BDT", "UA": "UAH", "CL": "CLP", "CO": "COP", "PE": "PEN", "AR": "ARS", "NZ": "NZD"
        }
        currency = CURRENCY_MAP.get(country, "USD")
        
        payload = {
            "ip": ip,
            "country_code": country,
            "city": city,
            "currency": currency,
            "managed_by": "Vercel Edge Intelligence"
        }
        
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())
