---
title: "Document Q&A System"
date: 2025-02-01
lastmod: 2026-06-21
tags: ["LangChain", "FAISS", "Streamlit", "LLM", "NLP", "RAG", "Python", "Groq", "Vector Search", "Conversational AI"]
github: "https://github.com/ik-awais/doc-qa-system"
demo: ""
summary: "Production-ready RAG system built with LangChain, FAISS, and Streamlit. Upload PDF, DOCX, or TXT files and ask natural language questions with source citations and conversational follow-up memory."
status: "complete"
keywords: ["document Q&A system", "RAG system Python", "LangChain FAISS", "PDF question answering", "document chat LLM", "retrieval augmented generation", "Groq LLM LangChain", "semantic document search", "conversational document AI", "FAISS vector store Streamlit"]
---

A production-ready Retrieval-Augmented Generation (RAG) system that lets you upload documents and interrogate them in plain language. Upload a PDF, DOCX, or TXT file, ask any question, and get accurate, context-aware answers with citations pointing to the exact source chunk, all powered by **LangChain 0.3.25**, **FAISS**, and **Groq LLM** (`Llama 3.3 70B`).

Built without agent overhead: the system uses LangChain Chains directly, keeping the architecture simple, fast, and predictable.

## What It Does

The system operates in two distinct phases. During ingestion, an uploaded document is parsed, split into overlapping chunks, embedded locally using HuggingFace's `all-MiniLM-L6-v2` model, and stored in an in-memory FAISS index. During query, the user's question is embedded with the same model, and a similarity search retrieves the top-k most relevant chunks. Those chunks are passed to the LLM alongside the conversation history, which produces a grounded answer with traceable source references.

Conversational memory (`ConversationBufferWindowMemory`) feeds previous Q&A turns back into the LLM context, so pronouns and follow-up references ("what did it say about…", "and the second point?") resolve correctly without the user repeating context.

## Key Features

- **Multi-format document support**: ingests PDF (via PyPDF), DOCX (via python-docx), and plain TXT files
- **Semantic search**: retrieves answers by conceptual meaning, not keyword overlap, using FAISS cosine similarity over dense embeddings
- **Conversational memory**: `ConversationBufferWindowMemory` preserves chat history so follow-up questions work naturally
- **Source citations**: every answer surfaces the exact document chunk(s) that grounded it, with a "View Sources" toggle in the UI
- **Multi-document support**: upload multiple files and query across all of them in a single session
- **One-click document summarization**: map-reduce summarization pipeline condenses any document to a readable overview
- **Switchable LLM models**: choose between Llama 3.3 70B (highest quality), Llama 3.1 8B (faster), or Mixtral 8x7B from the sidebar without restarting
- **Chat history UI**: full conversation thread displayed in a clean Streamlit chat interface
- **Local embeddings**: `sentence-transformers/all-MiniLM-L6-v2` runs locally, so documents never leave your machine for embedding

## Architecture & Data Flow

The system runs two phases for every interaction:

```
── PHASE 1: INGESTION (on file upload) ──────────────────────────────────

  Document (PDF / DOCX / TXT)
      │
      ▼
  [ Parse Text ]
  PyPDF / python-docx / TextLoader
      │
      ▼
  [ Chunk Text ]
  RecursiveCharacterTextSplitter
  chunk_size=1000, chunk_overlap=200
      │
      ▼
  [ Generate Embeddings ]
  HuggingFace all-MiniLM-L6-v2 (local)
      │
      ▼
  [ FAISS Vector Index ]
  Stored in memory for the session

── PHASE 2: QUERY (on each question) ────────────────────────────────────

  User Question
      │
      ▼
  [ Embed Question ]
  same all-MiniLM-L6-v2 model
      │
      ▼
  [ FAISS Similarity Search ]
  Top k=4 chunks retrieved
      │
      ▼
  [ LangChain ConversationalRetrievalChain ]
  Chunks + Conversation History → Groq LLM
      │
      ▼
  Answer + Source Citations
```

## Tech Stack

| Component | Technology | Version |
|---|---|---|
| RAG Framework | LangChain | 0.3.25 |
| LLM Provider | Groq (via langchain-groq) | 0.3.2 |
| LLM Model | Llama 3.3 70B / Llama 3.1 8B / Mixtral 8x7B | N/A |
| Embeddings | HuggingFace all-MiniLM-L6-v2 | sentence-transformers 3.4.1 |
| Vector Store | FAISS (CPU) | 1.10.0 |
| UI | Streamlit | 1.45.1 |
| PDF Loader | PyPDF | 5.4.0 |
| DOCX Loader | python-docx | 1.1.2 |
| Memory | ConversationBufferWindowMemory | (LangChain built-in) |
| Summarization | Map-Reduce Chain | (LangChain built-in) |
| Token Counting | tiktoken | 0.9.0 |
| Config | python-dotenv | 1.1.0 |

## Project Structure

```
doc_qa_system/
│
├── app.py                        # Streamlit entry point & UI logic
├── .env                          # API keys (not committed)
├── .env.example                  # Environment variable template
├── requirements.txt              # 13 pinned dependencies
├── README.md                     # Project documentation
│
├── core/
│   ├── document_processor.py     # Document loading, parsing & chunking
│   ├── vector_store.py           # FAISS index creation & similarity search
│   ├── qa_chain.py               # LangChain ConversationalRetrievalChain
│   └── summarizer.py             # Map-reduce summarization pipeline
│
└── utils/
    └── helpers.py                # Configuration loading & shared utilities
```

## Setup & Installation

### Prerequisites

- Python 3.9 or higher
- A free [Groq API key](https://console.groq.com), no credit card required

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/ik-awais/doc-qa-system.git
cd doc-qa-system
```

**2. Create and activate a virtual environment**

```bash
python3 -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Configure your API key**

```bash
cp .env.example .env
```

Open `.env` and add your key:

```
GROQ_API_KEY=your_groq_api_key_here
```

**5. Run the application**

```bash
streamlit run app.py
```

The app opens automatically at `http://localhost:8501`.

## How to Use

Once the app is running, the workflow is straightforward:

1. **Upload a document** via the sidebar: PDF, DOCX, or TXT are all accepted
2. **Ask a question** in the chat input: the system retrieves relevant chunks and generates an answer
3. **View citations** by clicking "View Sources" under any response
4. **Ask follow-ups** naturally: the memory window preserves context so "what did it say about X?" resolves correctly
5. **Summarize** the full document with the "Generate Summary" button
6. **Add more documents**: upload additional files to query across the combined set
7. **Clear chat** to start a new conversation without removing the loaded documents
8. **Reset all** to wipe documents, index, and history and start completely fresh

## Configuration

### LLM Model Selection

Switch models in the sidebar at any time without restarting:

- **Llama 3.3 70B**: highest answer quality, recommended for most use cases
- **Llama 3.1 8B**: faster responses, suitable for simpler documents or latency-sensitive workflows
- **Mixtral 8x7B**: mixture-of-experts alternative with different strengths

### Chunking Parameters

Adjust in `core/document_processor.py` to tune retrieval precision vs. context coverage:

```python
chunk_size=1000      # Characters per chunk - larger = more context per chunk
chunk_overlap=200    # Characters shared between adjacent chunks - prevents answer splits at boundaries
```

### Retrieval Settings

Adjust in `core/qa_chain.py` to control how many source chunks are surfaced per query:

```python
search_kwargs={"k": 4}    # Number of chunks retrieved per query
```

Increasing `k` improves recall at the cost of longer LLM context; decreasing it keeps answers tighter.

## Dependencies (Pinned)

All 13 dependencies are fully pinned in `requirements.txt` for reproducible installs:

```
langchain==0.3.25
langchain-community==0.3.24
langchain-groq==0.3.2
langchain-huggingface==0.1.2
langchain-openai==0.3.16
faiss-cpu==1.10.0
streamlit==1.45.1
sentence-transformers==3.4.1
pypdf==5.4.0
python-docx==1.1.2
tiktoken==0.9.0
python-dotenv==1.1.0
openai==1.82.0
```

## Design Decisions

**Chains, not agents**: The system deliberately avoids LangChain agents. A `ConversationalRetrievalChain` is deterministic, predictable, and faster than an agent loop. For document Q&A there is no need for dynamic tool selection; the retrieve-then-generate pattern is sufficient and easier to debug.

**Local embeddings**: Using `sentence-transformers/all-MiniLM-L6-v2` locally rather than an API-hosted embedding model means documents are never sent to a third party for embedding. Only the retrieved chunks and question are sent to Groq for generation. This makes the system practical for internal or sensitive documents.

**Chunk overlap**: The 200-character overlap between chunks prevents answers from being cut off at chunk boundaries, which is a common failure mode in naive RAG implementations where the key sentence happens to straddle a split point.

**Map-reduce summarization**: Rather than truncating long documents to fit in a single context window, the summarizer uses a map-reduce approach: each chunk is summarized independently, then the summaries are combined in a reduce step. This scales to documents of arbitrary length.

**Environment variable template**: Shipping a `.env.example` file (rather than documentation alone) makes onboarding faster and reduces the chance of misconfiguration, since developers can see exactly which variable names are expected.

## License

This project is open source under the [MIT License](https://github.com/ik-awais/doc-qa-system/blob/main/LICENSE).

---

## Related Projects

### [AI Research Assistant Agent](https://ik-awais.github.io/projects/ai-research-agent/)
An autonomous agentic system that searches the live web, extracts multi-source content, and generates structured research reports, using the same Groq LLM backend but with Tavily web search instead of a document index.
→ [GitHub](https://github.com/ik-awais/ai-research-agent) · [Read More](https://ik-awais.github.io/projects/ai-research-agent/)

### [LectureLens: AI-Powered Study Assistant with RAG & Hybrid Search](https://ik-awais.github.io/projects/lecturelens/)
A production-grade Flask application that ingests PDF, DOCX, and PPTX lecture materials, indexes them with ChromaDB vector embeddings and SQLite FTS5 full-text search, then answers questions via a RAG pipeline powered by NVIDIA's LLaMA 3.3 70B, with page-level source citations.
→ [GitHub](https://github.com/ik-awais/Python_Projects/tree/main/PAI/LectureLens) · [Read More](https://ik-awais.github.io/projects/lecturelens/)

### [MediScan AI: Medical Image & Report Assistant](https://ik-awais.github.io/projects/mediscan-ai/)
End-to-end pipeline that classifies medical scans with a fine-tuned Vision Transformer, scores anomalies with IsolationForest, and generates structured radiology reports using LLaMA 3.1, served via FastAPI.
→ [GitHub](https://github.com/ik-awais/mediscan-ai) · [Read More](https://ik-awais.github.io/projects/mediscan-ai/)

---

## Related Blog Posts

### [You Don't Need to Be a Programmer to Be a Tech Person](https://ik-awais.github.io/blog/tech-survival-guide-2026/)
The practical tech skills, including Python, APIs, and AI tooling, that set you apart without a CS degree.

### [How I Built My Portfolio Website with Hugo from Scratch](https://ik-awais.github.io/blog/portfolio-development-guide/)
A detailed walkthrough of building this portfolio site with Hugo, GitHub Pages, and automated CI/CD, the infrastructure that hosts this project page.

---

[← Back to All Projects](https://ik-awais.github.io/projects/) · [GitHub](https://github.com/ik-awais/doc-qa-system) · [Contact](https://ik-awais.github.io/#contact)