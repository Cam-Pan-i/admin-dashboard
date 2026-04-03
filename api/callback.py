from http.server import BaseHTTPRequestHandler
import json
import os
import requests
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            parsed = urllib.parse.urlparse(self.path)
            query = urllib.parse.parse_qs(parsed.query)
            code = query.get('code', [''])[0]
            access_token = query.get('access_token', [''])[0]
            state = query.get('state', [''])[0]
            
            if not code and not access_token:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "error", "message": "Missing code or access_token"}')
                return
            
            SUPABASE_URL = os.environ.get("SUPABASE_URL")
            SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
            client_id = "1347543766340341782"
            client_secret = os.environ.get("DISCORD_CLIENT_SECRET")
            
            if not client_secret and code:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "error", "message": "Server missing credentials for code exchange"}')
                return

            refresh_token = ""

            if code:
                # Use the redirect_uri the client reports (matches exactly what's in the browser URL bar,
                # which is what Discord registered). Fall back to hardcoded default only if missing.
                redirect_uri = query.get('redirect_uri', [''])[0]
                if not redirect_uri:
                    redirect_uri = "https://bobtheseller.vercel.app/callback"
                
                print(f"[OAUTH DEBUG] Using redirect_uri from client: {redirect_uri!r}")
                
                # Clean the secret (avoid trailing whitespaces)
                client_secret = client_secret.strip()

                # Exchange code for token (using body parameters for 100% platform compatibility)
                data = {
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'grant_type': 'authorization_code',
                    'code': code.strip(),
                    'redirect_uri': redirect_uri
                }
                
                r = requests.post('https://discord.com/api/oauth2/token', data=data)
                r.raise_for_status()
                token_data = r.json()
                
                access_token = token_data['access_token']
                refresh_token = token_data.get('refresh_token', '')
            
            # Fetch user info
            user_res = requests.get('https://discord.com/api/v10/users/@me', headers={'Authorization': f'Bearer {access_token}'})
            user_res.raise_for_status()
            user_info = user_res.json()
            
            user_id = user_info['id']
            username = user_info.get('username')
            email = user_info.get('email', 'unknown')
            
            # Insert into Supabase
            sb_headers = {
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            }
            
            sb_payload = {
                'user_id': user_id,
                'username': username,
                'email': email,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'assigned_role': False
            }
            
            # Check if user already exists
            check_url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/authorized_users?user_id=eq.{user_id}&select=user_id"
            check_res = requests.get(check_url, headers=sb_headers)
            user_exists = len(check_res.json()) > 0 if check_res.ok else False

            if user_exists:
                # Update existing user
                sb_req = requests.patch(f"{SUPABASE_URL.rstrip('/')}/rest/v1/authorized_users?user_id=eq.{user_id}", headers=sb_headers, json=sb_payload)
            else:
                # Insert new user
                sb_req = requests.post(f"{SUPABASE_URL.rstrip('/')}/rest/v1/authorized_users", headers=sb_headers, json=sb_payload)
            
            if not sb_req.ok:
                raise Exception(f"Supabase Error {sb_req.status_code}: {sb_req.text}")
            
            sb_req.raise_for_status()
            
            # Log success to audit
            requests.post(f"{SUPABASE_URL.rstrip('/')}/rest/v1/audit_logs", headers=sb_headers, json={
                'action': 'VERIFICATION_SUCCESS', 'details': f"User {username} ({user_id}) verified via matrix."
            })

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "success", "message": "Verified and stored"}')
            
        except Exception as e:
            # Detailed Error Logging to Audit Table
            try:
                err_msg = str(e)
                if hasattr(e, 'response') and e.response is not None:
                    err_msg += f" | Status: {e.response.status_code} | Body: {e.response.text[:200]}"
                
                sb_headers = { 'apikey': os.environ.get("SUPABASE_KEY"), 'Authorization': f'Bearer {os.environ.get("SUPABASE_KEY")}', 'Content-Type': 'application/json' }
                requests.post(f"{os.environ.get('SUPABASE_URL').rstrip('/')}/rest/v1/audit_logs", headers=sb_headers, json={
                    'action': 'VERIFICATION_FAILED', 'details': err_msg
                }, timeout=5)
            except: pass

            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())
