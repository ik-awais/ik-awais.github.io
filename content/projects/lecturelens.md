---
title: "LectureLens: AI-Powered Study Assistant with RAG & Hybrid Search"
date: 2026-06-15
lastmod: 2026-06-21
tags: ["RAG", "LLM", "Flask", "Python", "ChromaDB", "Hybrid Search", "NVIDIA API", "Sentence Transformers", "SQLite", "NLP", "Vector Database", "AI Study Assistant"]
github: "https://github.com/ik-awais/Python_Projects/tree/main/PAI/LectureLens"
demo: ""
summary: "A production-grade Flask application that ingests PDF, DOCX, and PPTX lecture materials, indexes them with ChromaDB vector embeddings and SQLite FTS5 full-text search, then answers natural-language questions via a RAG pipeline powered by NVIDIA's LLaMA 3.3 70B, complete with page-level source citations."
status: "complete"
keywords: ["RAG study assistant", "Flask RAG application", "ChromaDB hybrid search", "lecture notes AI chat", "SQLite FTS5 search", "NVIDIA LLaMA 3.3 70B", "PDF DOCX PPTX ingestion", "AI study assistant Python", "vector database Flask app", "academic document RAG pipeline"]
---

> **Upload your lecture slides and notes, then chat with them.** LectureLens turns static academic documents into an interactive, citation-aware study assistant powered by a large language model.

---

## What Is LectureLens?

LectureLens is a full-stack Retrieval-Augmented Generation (RAG) application built for students and researchers. Instead of keyword-searching through PDFs or scrubbing through lecture slides, you upload your course material once and ask questions in plain English, receiving precise, grounded answers backed by page-level citations from your own documents.

The system is built on a production-quality Flask backend with non-blocking background indexing, a ChromaDB vector store organised by academic subject, a SQLite FTS5 full-text search engine for keyword recall, and NVIDIA's hosted LLaMA 3.3 70B Instruct as the reasoning layer. Every answer is grounded in your uploaded material: the LLM is explicitly instructed to say "I don't have enough information" rather than hallucinate.

---

## Key Features

- **Multi-format document ingestion**: PDFs (PyMuPDF), DOCX (python-docx), and PPTX (python-pptx) are all parsed into a unified page-level structure
- **Hybrid search (vector + keyword)**: dense vector similarity (70 % weight, ChromaDB) is fused with SQLite FTS5 keyword search (30 % weight), giving higher recall than either method alone
- **Per-subject ChromaDB collections**: each subject (e.g. `lecturelens_machine_learning`) gets its own HNSW collection, keeping retrieval focused and enabling cross-subject search when needed
- **Page-level citations**: every answer includes `{filename, page}` pairs so students can verify sources instantly
- **Non-blocking background indexing**: uploads return `202 Accepted` immediately; a `ThreadPoolExecutor`-backed `IndexingQueue` handles the full parse → chunk → embed → store pipeline asynchronously
- **Auto-ingestion folder watcher**: a `FolderWatcher` daemon thread scans `uploads/<subject>/` on a configurable interval and automatically queues any new files it finds
- **SHA-256 duplicate detection**: the file hash is computed before any expensive parsing; identical documents are rejected gracefully
- **Session-aware chat history**: every Q&A exchange is persisted in SQLite under a UUID session ID, enabling multi-turn history retrieval
- **Transactional deletes**: document removal cascades through ChromaDB, FTS5, and SQLite atomically; any failure at a step returns a 500 before the next layer is touched
- **Admin dashboard**: a password-protected `/admin` panel (authenticated via `X-Admin-Password` header) offers document listing, per-subject stats, vector counts, reindex triggers, and live system health monitoring
- **Lazy-loaded embedding model**: `BAAI/bge-small-en-v1.5` (384-dimensional, 33 M parameters) is loaded once on first use and LRU-cached per text string, making repeated queries very fast

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Flask Application (app.py)                    │
│                  Application Factory Pattern                     │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │
│  │ POST /upload │   │ POST /chat   │   │ /admin/*             │ │
│  │ upload_bp    │   │ chat_bp      │   │ admin_bp             │ │
│  └──────┬───────┘   └──────┬───────┘   └──────────────────────┘ │
│         │                  │                                     │
│         ▼                  ▼                                     │
│  ┌──────────────┐   ┌──────────────────────────────────────┐    │
│  │ Indexing     │   │          RAG Pipeline                 │    │
│  │ Queue        │   │                                       │    │
│  │ (Thread      │   │  1. hybrid_search(question, subject)  │    │
│  │  Pool, N     │   │  2. _build_context(chunks)            │    │
│  │  workers)    │   │  3. NVIDIAClient.generate(prompt)     │    │
│  └──────┬───────┘   │  4. _extract_citations(chunks)        │    │
│         │           └──────────────┬───────────────────────┘    │
│         ▼                          │                             │
│  ┌──────────────┐          ┌───────▼──────────────────────┐    │
│  │ Indexing     │          │      Search Service           │    │
│  │ Service      │          │                               │    │
│  │              │          │  vector_results (ChromaDB)    │    │
│  │ 1. SHA-256   │          │    score = 1/(1+distance)     │    │
│  │ 2. parse()   │          │  × 0.7 weight                 │    │
│  │ 3. chunk()   │          │                               │    │
│  │ 4. FTS insert│          │  keyword_results (FTS5)       │    │
│  │ 5. embed()   │          │    score = 1/(1+rank)         │    │
│  │ 6. chroma    │          │  × 0.3 weight                 │    │
│  │    .add()    │          │                               │    │
│  │ 7. status=ok │          │  merged by chunk_id, top-k    │    │
│  └──────┬───────┘          └───────┬──────────────────────┘    │
└─────────┼──────────────────────────┼────────────────────────────┘
          │                          │
   ┌──────▼──────────┐    ┌──────────▼──────────────────┐
   │  ChromaDB       │    │  SQLite (WAL mode)           │
   │  Vector Store   │◄───│                              │
   │                 │    │  documents  (status, hash)   │
   │  lecturelens_   │    │  conversations (session Q&A) │
   │  <subject>      │    │  sessions   (UUID → created) │
   │  collections    │    │  subjects   (name registry)  │
   │  (HNSW cosine)  │    │  chunks_fts (FTS5 virtual)   │
   └─────────────────┘    └──────────────────────────────┘
          │
   ┌──────▼──────────────────────┐
   │  NVIDIA API                 │
   │  meta/llama-3.3-70b-instruct│
   │  temperature=0.2            │
   │  max_tokens=500             │
   └─────────────────────────────┘
```

---

## How It Works: Step by Step

### Step 1: Upload & Validation

`POST /upload` receives a file and a subject label. The route validates:

- Extension is in `('.pdf', '.docx', '.pptx')`
- File size is within `MAX_FILE_SIZE_MB` (default 2 GB for bulk academic uploads)

The file is saved with a `{uuid4_hex}_{secure_filename}` name to prevent path traversal, then an `indexing_task` closure is enqueued. The endpoint returns `202 Accepted` immediately, so the caller is never blocked by embedding time.

### Step 2: Background Indexing Pipeline

The `IndexingQueue` (a `ThreadPoolExecutor` with configurable `INDEXING_WORKERS`, default 4) picks up the task and runs `IndexingService.index_document()`:

| Step | Action |
|:-----|:-------|
| 1 | Compute SHA-256 hash → reject if duplicate already in DB |
| 2 | Parse document: PDF page-by-page via PyMuPDF; DOCX paragraphs joined as one page; PPTX slide-by-slide, skipping empty slides |
| 3 | Create SQLite record with `status='processing'` and a fresh UUID as `document_id` |
| 4 | Chunk text with `ChunkingService` (500-char window, 100-char overlap, sentence-boundary-aware snapping within ±200 chars) |
| 5 | Insert raw chunk text into the FTS5 virtual table `chunks_fts` for keyword indexing |
| 6 | Batch-embed all chunks with `BAAI/bge-small-en-v1.5` → 384-dimensional float vectors |
| 7 | Enrich each chunk dict with `document_id` and `filename` metadata |
| 8 | Store in the subject's ChromaDB collection (created on demand with `hnsw:space=cosine`) |
| 9 | Update SQLite status to `'completed'`; on any exception, set `'failed'` and re-raise |

### Step 3: Hybrid Search

When `POST /chat` receives a question, `SearchService.hybrid_search()` runs two parallel searches:

**Vector search**: the question is embedded with the same `BAAI/bge-small-en-v1.5` model (LRU-cached), then queried against the relevant ChromaDB collection (subject-specific) or all `lecturelens_*` collections (cross-subject). Raw cosine distances are normalised:

```
vector_score = 1.0 / (1.0 + distance)
```

**Keyword search**: the question is sanitised (punctuation stripped, double-quoted chars escaped) and run through FTS5 MATCH. SQLite's internal `rank` scores are normalised:

```
keyword_score = 1.0 / (1.0 + rank)
```

Results are merged by `chunk_id`. Chunks appearing in only one search get a zero score for the other. The final score is:

```
combined_score = 0.7 × vector_score + 0.3 × keyword_score
```

Top-k chunks by combined score are returned as the retrieval context.

### Step 4: RAG Answer Generation

`RAGPipeline.answer()` takes the retrieved chunks and:

1. Builds a context string with `[Source: {filename}, Page {page_num}]` headers above each chunk's text
2. Constructs a system prompt: *"Use only the provided context. If the answer is not in the context, say 'I don't have enough information about that.'"*
3. Calls `NVIDIAClient.generate()` → `meta/llama-3.3-70b-instruct` at `temperature=0.2` for factual, low-variance answers; falls back to concatenated raw chunks if the API call fails
4. Extracts a deduplicated `[{filename, page}, ...]` citation list from the chunks used
5. Returns `{answer, citations, retrieved_chunks}` as JSON

### Step 5: Chat History & Sessions

The first chat call for a user creates a session UUID via `SessionRepository`. Every Q&A pair is stored in the `conversations` table. `GET /chat/history?session_id=<uuid>` returns the last 50 exchanges, enabling review and multi-turn context replay.

---

## Project Structure

```
LectureLens/
│
├── app.py                          # Flask application factory
├── config.py                       # Frozen dataclass - validates all env vars at startup
├── requirements.txt                # Pinned production dependencies
│
├── routes/
│   ├── upload_routes.py            # POST /upload → validate, save, enqueue
│   ├── chat_routes.py              # POST /chat, GET /chat/history
│   ├── search_routes.py            # Search-only endpoint (no LLM)
│   ├── subjects_routes.py          # Subject CRUD
│   └── admin_routes.py             # /admin/* - stats, docs, health, reindex, delete
│
├── services/
│   ├── indexing_service.py         # Full pipeline orchestrator (parse→chunk→embed→store)
│   ├── document_parser.py          # Unified PDF / DOCX / PPTX parser
│   ├── chunking_service.py         # Sentence-boundary-aware sliding-window chunker
│   ├── embedding_service.py        # BAAI/bge-small-en-v1.5 with lazy load & LRU cache
│   ├── vector_store.py             # ChromaDB wrapper - per-subject collections, HNSW cosine
│   ├── search_service.py           # Hybrid search - weighted vector + FTS5 merge
│   ├── rag_pipeline.py             # Retrieve → prompt → NVIDIA LLM → citations
│   └── llm_client.py               # NVIDIA API client - LLaMA 3.3 70B Instruct
│
├── models/
│   ├── database.py                 # SQLite singleton - WAL mode, context-manager connections
│   ├── document_repository.py      # CRUD for documents table
│   ├── fts_repository.py           # FTS5 virtual table - insert, keyword_search, delete
│   ├── conversation_repository.py  # Q&A history per session
│   ├── session_repository.py       # Session UUID management
│   └── subject_repository.py       # Subject registry with default seeding
│
├── task_queue/
│   ├── indexing_queue.py           # ThreadPoolExecutor-backed global queue
│   └── folder_watcher.py           # Daemon thread - auto-ingests files dropped in uploads/
│
└── utils/
    ├── hashing.py                  # SHA-256 streaming hash for duplicate detection
    ├── validators.py               # Extension and size guards
    └── logger.py                   # Structured rotating file + console logging
```

---

## Tech Stack

| Layer | Technology | Role |
|:------|:-----------|:-----|
| Web framework | Flask 3.0 | REST API, blueprint routing, app factory |
| LLM | NVIDIA API (LLaMA 3.3 70B Instruct) | Answer generation, `temperature=0.2` |
| Embeddings | `BAAI/bge-small-en-v1.5` (sentence-transformers) | 384-dim dense vectors, LRU-cached |
| Vector store | ChromaDB 0.4 (persistent, HNSW cosine) | Semantic similarity retrieval |
| Keyword search | SQLite FTS5 virtual table | Exact / partial keyword recall |
| Relational DB | SQLite with WAL mode | Documents, sessions, conversations, subjects |
| PDF parsing | PyMuPDF (`fitz`) | Page-level text extraction |
| DOCX parsing | `python-docx` | Paragraph-level text extraction |
| PPTX parsing | `python-pptx` | Slide-level text extraction |
| Background jobs | `concurrent.futures.ThreadPoolExecutor` | Non-blocking indexing |
| Config | `python-dotenv` + frozen `@dataclass` | Validated env-var config at startup |
| Deep learning | PyTorch 2.2 (CPU) | Embedding model runtime |

---

## Configuration Reference

All settings come from a `.env` file and are validated inside the frozen `Config.from_env()` classmethod at startup; missing required keys raise `ValueError` before the app even binds to a port.

| Variable | Default | Purpose |
|:---------|:--------|:--------|
| `NVIDIA_API_KEY` | `None` | **Required.** NVIDIA hosted inference auth |
| `FLASK_SECRET_KEY` | `None` | **Required.** Flask session signing |
| `ADMIN_PASSWORD` | `None` | **Required.** Protects all `/admin/*` routes |
| `GEMINI_API_KEY` | `None` | Optional fallback LLM |
| `CHROMA_PATH` | `./database/chroma` | ChromaDB persistent storage |
| `DATABASE_PATH` | `./database/metadata.db` | SQLite file path |
| `UPLOAD_FOLDER` | `./uploads` | Temporary file landing zone |
| `CHUNK_SIZE` | `500` | Characters per chunk |
| `OVERLAP` | `100` | Character overlap between chunks |
| `BATCH_SIZE` | `32` | Embedding batch size |
| `INDEXING_WORKERS` | `4` | Thread pool size |
| `MAX_FILE_SIZE_MB` | `2048` | Upload size guard |
| `WATCH_FOLDER_ENABLED` | `True` | Enable auto-ingestion watcher |
| `WATCH_FOLDER_INTERVAL_SECONDS` | `30` | Watcher scan interval |

---

## API Reference

### Upload a Document
```http
POST /upload
Content-Type: multipart/form-data

file=<binary>
subject=<string>        # e.g. "Machine Learning"
```
Returns `202 Accepted` immediately; indexing runs in the background.

```json
{
  "message": "Document upload accepted, indexing in background",
  "original_filename": "week3_lecture.pdf",
  "subject": "Machine Learning"
}
```

### Chat (RAG)
```http
POST /chat
Content-Type: application/json

{
  "question": "What is gradient descent?",
  "subject": "Machine Learning",
  "top_k": 5,
  "session_id": "<optional-uuid>"
}
```
```json
{
  "answer": "Gradient descent is an optimisation algorithm that iteratively adjusts model parameters in the direction of steepest loss reduction...",
  "citations": [
    { "filename": "week3_lecture.pdf", "page": 12 },
    { "filename": "week3_lecture.pdf", "page": 14 }
  ],
  "session_id": "a1b2c3d4-...",
  "retrieved_chunks": [...]
}
```

### Chat History
```http
GET /chat/history?session_id=<uuid>
```
Returns last 50 Q&A pairs for the session.

### Admin: System Stats
```http
GET /admin/stats
X-Admin-Password: <password>
```
```json
{
  "total_documents": 42,
  "total_subjects": 6,
  "total_vectors": 18340,
  "completed_documents": 40,
  "failed_documents": 1,
  "pending_documents": 1
}
```

### Admin: System Health
```http
GET /admin/health
X-Admin-Password: <password>
```
Returns queue worker status, ChromaDB health, and SQLite health.

### Admin: Delete Document (Transactional)
```http
DELETE /admin/documents/<document_id>
X-Admin-Password: <password>
```
Cascades: ChromaDB vectors → FTS5 entries → SQLite row. Any failure stops the cascade and returns `500`.

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/ik-awais/Python_Projects.git
cd Python_Projects/PAI/LectureLens

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env - set NVIDIA_API_KEY, FLASK_SECRET_KEY, ADMIN_PASSWORD

# 5. Run the application
python app.py
# API available at http://localhost:5000
# Admin dashboard at http://localhost:5000/admin
```

---

## Design Decisions & Engineering Notes

**Why hybrid search instead of pure vector search?**
Vector similarity excels at semantic matching ("gradient descent" ↔ "optimisation algorithm") but can miss exact keyword hits like formula names, acronyms, or proper nouns. FTS5 catches these exactly. The 70/30 weighted merge gives the best of both: semantic breadth plus lexical precision.

**Why per-subject ChromaDB collections?**
Namespacing by subject means a query about "neural networks" inside the Machine Learning collection won't surface irrelevant chunks from a History or Law collection. It also makes deletion transactional per-subject: dropping a subject clears its entire ChromaDB collection in one call, rather than hunting by metadata filter.

**Why SQLite FTS5 rather than Elasticsearch or a dedicated search engine?**
Zero additional infrastructure. Python ships with `sqlite3`; FTS5 is built in. WAL mode (`PRAGMA journal_mode=WAL`) handles concurrent Flask workers reading/writing without table-level locking. For a single-server academic deployment this is more than sufficient, and the entire database is a single portable file.

**Why non-blocking upload with `ThreadPoolExecutor`?**
Embedding a 200-slide PPTX through a transformer model can take 20-60 seconds. Blocking the HTTP response that long would break mobile clients and timeout proxies. The `202 Accepted` pattern and background queue keep the API responsive regardless of document size or backlog.

**Why `BAAI/bge-small-en-v1.5`?**
At 33 M parameters it produces 384-dimensional embeddings that run fast on CPU and score well on MTEB retrieval benchmarks. Academic texts, dense with technical vocabulary and structured arguments, benefit from its BERT-style pretraining on diverse corpora, and the small model size means the embedding step is not the bottleneck even on modest hardware.

**Why a frozen `Config` dataclass?**
An immutable config object loaded once at startup prevents accidental mutation across request handlers. The `from_env()` classmethod validates every required key before `create_app()` returns, so misconfiguration fails loudly at boot rather than silently at the first API call.

---

## What I Learned

Building LectureLens end-to-end sharpened skills across the full production AI stack:

- **RAG pipeline design**: retrieval quality is the ceiling on answer quality; I iterated on chunk size, overlap, and the vector/keyword weight ratio to improve both precision and recall
- **Hybrid search implementation**: designing and calibrating the score normalisation (`1/(1+x)`) so that vector distances and FTS5 `rank` values are comparable before weighting
- **Concurrent document processing in Flask**: safely passing database repositories and vector store references into background threads without leaking Flask's request context
- **ChromaDB collection management**: HNSW index configuration, lazy client initialisation, and implementing transactional cascade deletes across a multi-store architecture
- **Production Flask patterns**: application factory, blueprint separation, dependency injection via `app.config`, and graceful shutdown via `atexit.register`
- **Operational observability**: building a health endpoint that reports queue worker status, ChromaDB availability, and SQLite connectivity in a single call

---

## Related Projects

If you found LectureLens interesting, here are the other projects in my portfolio:

### [AI Research Assistant Agent](https://ik-awais.github.io/projects/ai-research-agent/)
An autonomous agentic system that searches the live web, extracts multi-source content, and generates structured, cited research reports with PDF and TXT export, built with Groq LLM and the Tavily Search API.
→ [GitHub](https://github.com/ik-awais/ai-research-agent) · [Read More](https://ik-awais.github.io/projects/ai-research-agent/)

### [Document Q&A System](https://ik-awais.github.io/projects/document-qa-system/)
A production-ready RAG system for uploading PDF, DOCX, and TXT documents and asking natural-language questions with source citations and conversational follow-up memory, built with LangChain, FAISS, and Streamlit.
→ [GitHub](https://github.com/ik-awais/doc-qa-system) · [Read More](https://ik-awais.github.io/projects/document-qa-system/)

### [MediScan AI: Medical Image & Report Assistant](https://ik-awais.github.io/projects/mediscan-ai/)
An end-to-end medical imaging pipeline that classifies chest X-rays with a fine-tuned Vision Transformer, scores anomalies with IsolationForest, and generates structured radiology reports using LLaMA 3.1 70B, served through a single FastAPI endpoint.
→ [GitHub](https://github.com/ik-awais/mediscan-ai) · [Read More](https://ik-awais.github.io/projects/mediscan-ai/)

---

## Related Blog Posts

### [You Don't Need to Be a Programmer to Be a Tech Person](https://ik-awais.github.io/blog/tech-survival-guide-2026/)
The real tech skills that put you in the top 10% of your environment, including how tools like Python, Git, and AI APIs fit into day-to-day technical work.

### [How I Built My Portfolio Website with Hugo from Scratch](https://ik-awais.github.io/blog/portfolio-development-guide/)
A detailed account of building a personal portfolio with Hugo, GitHub Pages, and automated CI/CD, the same site this project is hosted on.

---

[← Back to All Projects](https://ik-awais.github.io/projects/) · [GitHub](https://github.com/ik-awais/Python_Projects/tree/main/PAI/LectureLens) · [Contact](https://ik-awais.github.io/#contact)