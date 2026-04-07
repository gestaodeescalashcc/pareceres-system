# Sistema de Pareceres Juridicos

Sistema completo para busca, cadastro e gestao de pareceres juridicos. Frontend em React + Tailwind CSS, backend em Express + SQLite.

## Estrutura

```
pareceres-system/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Componentes reutilizaveis
│   │   ├── pages/        # Paginas (Search, Detail, Admin, Login)
│   │   ├── contexts/     # AuthContext
│   │   ├── hooks/        # useSearch
│   │   └── utils/        # API client, helpers
│   └── ...
├── backend/           # Express.js + SQLite
│   ├── src/
│   │   ├── server.js        # Entry point
│   │   ├── database.js      # SQLite setup + migrations
│   │   ├── routes/          # Auth, Pareceres, Import
│   │   ├── services/        # Search, Index, PDF
│   │   └── middleware/      # Auth JWT, Validation
│   └── data/             # SQLite database (auto-criado)
├── vercel.json        # Config de deploy Vercel (frontend)
└── .env.example       # Variaveis de ambiente
```

## Requisitos

- Node.js >= 18

## Instalacao local

```bash
# Instalar dependencias (frontend + backend)
npm run install:all

# Popular banco com dados de exemplo
npm run seed

# Rodar em desenvolvimento (2 terminais)
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:5174
```

Login admin: `admin@pareceres.gov.br` / `admin123`

## Deploy

### Frontend (Vercel)

1. Suba o repositorio no GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure a variavel de ambiente:
   - `VITE_API_URL` = URL do backend (ex: `https://pareceres-api.onrender.com`)
4. O Vercel detecta automaticamente o `vercel.json` e faz o build

### Backend (Render / Railway)

O backend usa SQLite (modulo nativo), entao precisa de um servico com disco persistente.

**Render (recomendado):**

1. Crie um novo **Web Service** no [Render](https://render.com)
2. Conecte ao repositorio GitHub
3. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:**
     - `JWT_SECRET` = um segredo forte
     - `NODE_ENV` = `production`
4. Adicione um **Disk** em `/opt/render/project/src/backend/data` para persistir o SQLite

### Build de producao (local)

```bash
# Build do frontend
npm run build

# Iniciar servidor (serve frontend + API)
npm start
```

O backend serve os arquivos estaticos do frontend automaticamente em `http://localhost:3001`.

## Funcionalidades

- Busca full-text com highlighting e autocomplete
- Filtros avancados (tipo, status, materia, orgao, ano, autor, periodo)
- Facetas laterais com contagem
- Exportacao CSV
- Pareceres similares e relacionados
- Dashboard administrativo com estatisticas
- Cadastro via formulario, copy-paste ou upload PDF
- Autenticacao JWT
- Dark mode
- Responsivo (mobile-first)
