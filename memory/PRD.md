# PRD — Thay Nail Designer

## Problema original
Portar e melhorar o site da nail designer "Thay Nail Designer" (enviado em zip, stack TanStack/Supabase) para React + FastAPI + MongoDB, sem recriar do zero e sem alterar o que já funcionava. Requisitos: (1) animação de referência (30 frames JPG) como papel de parede da Home, controlada pelo scroll (avança ao descer, reverte ao subir), com texto "Thay Nail Designer" sobreposto; (2) Admin com CRUD completo do catálogo de serviços (nome, descrição, preço, duração, foto); (3) Admin define dias/horários de trabalho por dia da semana + bloqueios de data/horário; (4) alterações do admin refletidas automaticamente na área pública. Escolhas do usuário: backend local FastAPI+MongoDB, senha admin "1611", 5 serviços padrão seedados, manter padrão de cores original.

## Arquitetura
- **Frontend**: React (CRA/craco) em /app/frontend, rotas `/` (pública) e `/admin` (JWT sessionStorage). Tailwind v3 com tokens do design original (rose-gold #B76E79, cream, off-white, deep-warm; fontes Cormorant Garamond + Jost).
- **Backend**: FastAPI em /app/backend/server.py, rotas /api/*, MongoDB via motor. Auth: POST /api/auth/login (senha via ADMIN_PASSWORD no .env) → JWT 12h; dependency require_admin protege escritas.
- **Animação Home**: canvas fixo (Hero.jsx) com 30 frames (/public/frames/frame-0001..0030.jpg), índice do frame = scrollY/(1.4×viewport) × 29, desenho cover-fit com rAF throttle; respeita prefers-reduced-motion.

## Personas
- Cliente: visita o site, vê serviços, agenda horário em dias/horários disponíveis, confirma pelo WhatsApp.
- Admin (Thay, vitorialopesgoncalves4@gmail.com): gerencia serviços, agenda semanal e bloqueios em /admin (senha 1611).

## Requisitos implementados (2026-09-20)
- Home portada: Hero com animação scroll-driven + texto THAY NAIL DESIGNER, Sobre, Serviços (MongoDB), Agendamento (calendário respeitando work_days/bloqueios/agendamentos), Contato com horários dinâmicos, Footer.
- Admin: login JWT por senha, Painel (stats + próximos atendimentos + resumo dias), Agenda (toggle disponível/fechado por dia, horários, bloqueio de data/horário/dia todo), Serviços (criar/editar/excluir/reordenar, upload de foto redimensionada para base64, campo duração).
- Backend: CRUD services, work-days, blocked-slots, appointments (409 em conflito de horário), seeds idempotentes por coleção vazia.
- Testes: 18/18 backend pytest + E2E Playwright 100% (iteration_1).

## Backlog priorizado
- P1: slots do agendamento considerando duration_minutes do serviço (último horário não deve estourar o fechamento).
- P1: admin confirmar/cancelar agendamentos (mudar status) pelo Painel.
- P2: migrar @app.on_event para lifespan handlers (FastAPI).
- P2: validação backend de price/duration >= 0 em POST/PUT /api/services.
- P2: galeria de fotos gerenciável (modelo GalleryItem existia no projeto original, não portado).
- P2: link real do Instagram (atualmente "#" — aguardando URL da cliente).

## Próximas tarefas
- Validar com a usuária a animação no celular e ajustar faixa de scroll se necessário.
- Deploy quando aprovado.
