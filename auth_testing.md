# Auth Testing Playbook

Admin auth is password-only (single admin). Password lives in backend/.env as ADMIN_PASSWORD="1611".

## API test
```
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" -d '{"password":"1611"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s "$API_URL/api/auth/check" -H "Authorization: Bearer $TOKEN"
```

Expected: login returns {"token": "..."}, check returns {"ok": true}.
Wrong password returns 401 {"detail": "Senha incorreta"}.

## UI test
1. Go to /admin
2. Enter password 1611 in the password field (data-testid="admin-login-password-input")
3. Click "Entrar" (data-testid="admin-login-submit-button")
4. Admin panel appears (data-testid="admin-panel") with tabs Painel / Agenda / Serviços
5. Wrong password shows "Senha incorreta. Tente novamente." (data-testid="admin-login-error")
