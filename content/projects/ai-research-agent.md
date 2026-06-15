---
title: "AI Research Assistant Agent"
date: 2025-01-01
lastmod: 2026-06-16
tags: ["AI Agents", "LLM", "Web Search", "Automation", "Streamlit", "Groq", "Tavily", "Python", "RAG", "NLP"]
github: "https://github.com/ik-awais/ai-research-agent"
demo: ""
summary: "Autonomous AI research agent built with Python, Groq LLM, and Tavily Search API — searches the web, extracts multi-source content, and generates structured, cited research reports with PDF/TXT export."
status: "in-progress"
keywords: ["AI research agent", "autonomous AI agent", "Groq LLM", "Tavily API", "web research automation", "LLM summarization", "AI report generation", "Streamlit AI app", "agentic AI Python", "multi-source research tool"]
---

An autonomous AI agent that researches any topic by searching the live web, extracting content from multiple sources, and generating a fully structured, cited research report — all powered by **Groq LLM** (`llama-3.3-70b-versatile`) and the **Tavily Search API**.

## What It Does

Given any research topic, the agent autonomously plans a search strategy, queries the web in real time, scrapes and de-duplicates content from multiple sources, summarizes each source with an LLM, and assembles everything into a structured Markdown report with an introduction, key findings, analysis, and conclusion — complete with inline citations traceable back to the original URLs.

The agent thinks iteratively: after each round of search results, it evaluates whether the gathered information is sufficient or whether follow-up searches are needed. This loop continues autonomously until the agent is confident enough to produce the final report.

## Key Features

- **Real-time web search** via Tavily API — fetches fresh, live results rather than relying on a static knowledge base
- **Multi-source content extraction** using BeautifulSoup4 — scrapes and cleans article text from each result URL
- **Source de-duplication** — consolidates overlapping results to avoid redundant content in the final report
- **AI summarization per source** using Groq LLM (`llama-3.3-70b-versatile`) — each source is independently summarized before synthesis
- **Iterative autonomous reasoning** — agent decides whether to run follow-up searches based on coverage gaps
- **Structured Markdown report** with clearly defined sections: Introduction, Key Findings, Analysis, Conclusion
- **Full source citation** — every factual claim is attributed to a specific URL
- **Export to TXT or PDF** via `fpdf2` — download the final report in either format
- **Live agent thinking UI** — Streamlit interface shows the agent's reasoning steps in real time as it works

## Architecture & Data Flow

```
User Query
    │
    ▼
[ Tavily Web Search ]
    │  (real-time results + URLs)
    ▼
[ BeautifulSoup4 Content Extraction ]
    │  (raw HTML → clean article text)
    ▼
[ De-duplication & Relevance Filtering ]
    │
    ▼
[ Groq LLM — Per-Source Summarization ]
    │  (llama-3.3-70b-versatile)
    ▼
[ Agent Reasoning Loop ]
    │  (sufficient coverage? → if not, run follow-up search)
    ▼
[ Report Generator — Structured Markdown ]
    │  (Introduction / Key Findings / Analysis / Conclusion)
    ▼
[ Export: TXT or PDF ]
```

Each module is isolated in its own file, making the codebase straightforward to extend with new search providers, LLM backends, or export formats.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Language | Python 3.x | Core agent logic — no heavyweight frameworks |
| LLM | Groq API (`llama-3.3-70b-versatile`) | Fast inference for per-source summarization and report synthesis |
| Web Search | Tavily API | Real-time web search with clean structured results |
| HTML Parsing | BeautifulSoup4 | Extraction of article content from raw web pages |
| UI | Streamlit 1.50 | Interactive front-end with live agent thinking display |
| PDF Export | fpdf2 | Programmatic PDF generation from the final Markdown report |
| Config | python-dotenv | Secure API key management via `.env` file |

## Project Structure

```
ai-research-agent/
│
├── .env                     # API keys (not committed)
├── requirements.txt         # Pinned dependencies
├── app.py                   # Streamlit UI — entry point
│
├── agent/
│   ├── research_agent.py    # Core agent loop & reasoning logic
│   ├── tools.py             # Tavily web search + BeautifulSoup extraction
│   ├── summarizer.py        # Groq LLM summarization per source
│   └── report_generator.py  # Assembles structured Markdown report
│
└── utils/
    └── export.py            # PDF and TXT export utilities
```

## Setup & Installation

### Prerequisites

- Python 3.9 or higher
- A free [Groq API key](https://console.groq.com)
- A free [Tavily API key](https://app.tavily.com)

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/ik-awais/ai-research-agent.git
cd ai-research-agent
```

**2. Create and activate a virtual environment**

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Configure API keys**

Create a `.env` file in the project root:

```
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

**5. Run the app**

```bash
streamlit run app.py
```

Open `http://localhost:8501` in your browser. Enter any research topic and watch the agent work through its reasoning in real time.

## Dependencies (Pinned)

The full `requirements.txt` pins every transitive dependency for reproducible builds. Key direct dependencies include:

```
groq==1.0.0
tavily-python==0.7.21
beautifulsoup4==4.14.3
streamlit==1.50.0
fpdf2==2.8.4
python-dotenv==1.2.1
requests==2.32.5
```

## Sample Output

The agent has been tested on topics including "Impact of AI on Healthcare in 2025" and "Impact of AI on Finance." Sample output `.txt` and `.pdf` report files are included in the repository root for reference.

A generated report follows this structure:

```markdown
# Research Report: [Topic]

## Introduction
[Overview of the topic and research scope]

## Key Findings
[Bullet-point findings with source citations]

## Analysis
[Synthesized insights across sources]

## Conclusion
[Summary and implications]

## Sources
[1] https://...
[2] https://...
```

## Design Decisions

**No agent framework** — The agent loop is implemented in pure Python without LangChain, LlamaIndex, or CrewAI. This keeps the code transparent and easy to audit, which matters when building research tools that need to be trustworthy.

**Groq for speed** — Groq's hardware inference delivers very low latency on `llama-3.3-70b-versatile`, which matters here because the agent calls the LLM once per source URL. A slow provider would make multi-source research impractical.

**Tavily over raw search** — Tavily returns clean, structured search results with content snippets, reducing the need for aggressive scraping and lowering the rate of extraction failures compared to scraping search engine result pages directly.

**Per-source summarization before synthesis** — Rather than dumping all raw content into a single prompt, each source is summarized independently first. This respects context window limits and keeps individual source contributions traceable in the final report.

## Status

This project is actively in development. Planned improvements include streaming output support, configurable search depth, multi-language report generation, and a richer UI with source previews.

---

## Related Projects

If you found this project interesting, you might also like:

### [Document Q&A System](https://ik-awais.github.io/projects/document-qa-system/)
A production-ready RAG system for uploading documents (PDF, DOCX, etc.) and asking natural language questions with source citations — built with LangChain, FAISS, and Streamlit.
→ [GitHub](https://github.com/ik-awais/doc-qa-system) · [Read More](https://ik-awais.github.io/projects/document-qa-system/)

### [MediScan AI — Medical Image & Report Assistant](https://ik-awais.github.io/projects/mediscan-ai/)
End-to-end pipeline that classifies medical scans with a fine-tuned Vision Transformer, scores anomalies with IsolationForest, and generates structured radiology reports using LLaMA 3.1 — served via FastAPI.
→ [GitHub](https://github.com/ik-awais/mediscan-ai) · [Read More](https://ik-awais.github.io/projects/mediscan-ai/)

### [LectureLens — AI-Powered Study Assistant with RAG & Hybrid Search](https://ik-awais.github.io/projects/lecturelens/)
A production-grade Flask application that ingests PDF, DOCX, and PPTX lecture materials, indexes them with ChromaDB vector embeddings and SQLite FTS5, then answers natural-language questions via a RAG pipeline powered by NVIDIA's LLaMA 3.3 70B.
→ [GitHub](https://github.com/ik-awais/Python_Projects/tree/main/PAI/LectureLens) · [Read More](https://ik-awais.github.io/projects/lecturelens/)

---

## Related Blog Posts

### [You Don't Need to Be a Programmer to Be a Tech Person](https://ik-awais.github.io/blog/tech-survival-guide-2026/)
The real tech skills that put you in the top 10% of your environment — including how tools like Python, Git, and AI APIs fit into day-to-day technical work.

### [How I Built My Portfolio Website with Hugo from Scratch](https://ik-awais.github.io/blog/portfolio-development-guide/)
A detailed account of building a personal portfolio with Hugo, GitHub Pages, and automated CI/CD — the same site this project is hosted on.

---

[← Back to All Projects](https://ik-awais.github.io/projects/) · [GitHub](https://github.com/ik-awais/ai-research-agent) · [Contact](https://ik-awais.github.io/#contact)