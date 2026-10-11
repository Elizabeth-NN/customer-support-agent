# Customer Support Agent

An AI-powered customer support platform built around Retrieval-Augmented
Generation (RAG), source-grounded answers, controlled tools, and human
escalation.

The project is designed as a practical SaaS demonstration for businesses
that want to answer recurring customer questions using their own knowledge
base while escalating requests the AI cannot safely resolve.

## Features

- Business knowledge ingestion and document processing
- Document chunking, embeddings, and vector retrieval
- Answers grounded in retrieved business information
- Source attribution and retrieval evaluation
- Public customer chat widget
- Conversation and support-ticket management
- Controlled tools for business information and order-related workflows
- Human escalation for requests requiring additional support
- Business settings and dashboard
- Request IDs and privacy-conscious application logging
- Clerk authentication, PostgreSQL, and object storage

## Architecture

The application consists of two separately deployed applications.

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend API | FastAPI, Python |
| Authentication | Clerk |
| Database | Neon PostgreSQL |
| Vector search | PostgreSQL with pgvector |
| Document storage | Cloudflare R2 |
| LLM generation | Configurable provider; Ollama for local development |
| Embeddings | Configurable provider, including Gemini |
| Database migrations | Alembic |
| Backend tests | pytest |

### Planned deployment model

- Frontend: Vercel
- Backend: containerized FastAPI application
- Database: Neon PostgreSQL with pgvector
- Document storage: Cloudflare R2
- Authentication: Clerk

Only the backend will be containerized. The frontend remains a separate
Next.js application. No local database container is required.

A deployed backend cannot reach Ollama running on a developer's laptop via
`localhost`. Configure a model provider and base URL reachable from the
backend deployment environment.

## Repository structure

```text
customer-support-agent/
├── backend/
│   ├── alembic/          # Database migrations
│   ├── app/
│   │   ├── api/routes/   # API endpoints
│   │   ├── core/         # Configuration, auth, observability
│   │   ├── db/           # Database session and base
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # API schemas
│   │   └── services/    # RAG, ingestion, storage, tools
│   ├── backups/          # Local database backups; not committed
│   ├── scripts/          # Backend utility scripts
│   ├── tests/            # Backend tests
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── app/              # Next.js routes and pages
│   ├── components/       # UI components
│   ├── lib/
│   └── .env.example
├── data/                 # Local demo data
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRD.md
│   ├── RAG-EVALUATION.md
│   └── rafikiSupportFAQ.md
└── push.sh
```

## Prerequisites

- Python 3.12
- Node.js 22 or a compatible supported release
- npm
- A Neon PostgreSQL database with pgvector available
- A Cloudflare R2 bucket
- Clerk application credentials
- An LLM provider and embedding provider configured for the chosen environment

Ollama is optional for local model generation. If used, install Ollama and
pull the configured chat and embedding models.

## Local development

### 1. Configure the backend

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate

pip install -r backend/requirements.txt

cp backend/.env.example backend/.env
```

Edit `backend/.env` and provide the real database, R2, Clerk, and model
configuration values.

The backend settings require a database URL, R2 credentials, and Clerk
backend credentials. Choose model providers and configure their credentials
as appropriate for your environment.

### 2. Apply database migrations

```bash
cd backend
alembic upgrade head
```

Run migrations against the intended database and verify the database URL
before executing this command.

### 3. Start the backend

From the `backend/` directory, with the virtual environment activated:

```bash
uvicorn app.main:app --reload
```

The API will normally be available at `http://localhost:8000`.

Health check: `http://localhost:8000/health`

Interactive API documentation: `http://localhost:8000/docs`

### 4. Configure the frontend

Open another terminal:

```bash
cd ~/Development/code/personal/customer-support-agent/frontend

cp .env.example .env.local
npm ci
```

Edit `frontend/.env.local` with the Clerk publishable key and any other
required public settings. Set `NEXT_PUBLIC_API_URL` to the backend URL
appropriate for local development.

Start the frontend:

```bash
npm run dev
```

The frontend will normally be available at `http://localhost:3000`.

### Frontend commands

Run these commands from `frontend/`:

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Backend tests

Activate the project virtual environment and run:

```bash
cd backend
pytest -q
```

Tests may require appropriate environment configuration or mocked external
services, depending on the test being run.

## Database and document storage

- PostgreSQL stores application data and vector embeddings.
- Alembic manages database schema changes.
- Cloudflare R2 stores uploaded documents.
- Keep database backups and credentials outside version control.
- Never commit `.env`, `.env.local`, API keys, or access tokens.

## Observability

The backend emits structured JSON logs for HTTP requests and selected
customer-chat pipeline failures.

Request logs include a request ID, method, sanitized path, status code, and
duration. Pipeline failure logs identify the failed stage and exception type
without recording customer questions or exception messages.

Use the returned `X-Request-ID` response header to correlate related log
events. In deployment, inspect the backend host's runtime logs.

## Documentation

- [Product Requirements](docs/PRD.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [RAG Evaluation Guide](docs/RAG-EVALUATION.md)
- [Demo Business FAQ](docs/rafikiSupportFAQ.md)

## Deployment status

The project is under active development. The deployment architecture is
planned, but production deployment should not be considered complete until
the frontend, backend, managed services, authentication, and environment
configuration have been verified together.

The backend container configuration and deployment pipeline will be
maintained separately from the frontend deployment.

## Security notes

- Never commit real environment files or credentials.
- Keep customer data and database backups out of the public repository.
- Use HTTPS and production-specific authentication settings when deployed.
- Configure CORS and Clerk authorized parties for the actual frontend origin.
- Ensure the deployed backend can reach its configured model provider.
