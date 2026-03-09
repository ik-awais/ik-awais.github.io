---
title: "Document Q&A System"
date: 2025-02-01
tags: ["LangChain", "FAISS", "Streamlit", "LLM", "NLP"]
github: "https://github.com/ik-awais/doc-qa-system"
demo: ""
summary: "Production-ready RAG system for uploading documents and asking natural language questions with source citations."
status: "in-progress"
---

A production-ready Retrieval-Augmented Generation (RAG) system.

## What it does
Users upload documents (PDF, DOCX, TXT) and ask natural language questions.
The system retrieves the most relevant chunks and answers with source citations.

## Capabilities
- Document ingestion and chunking
- Semantic search via FAISS vector store
- LLM-powered Q&A with citations
- Multi-document support
- Streamlit interface

## Architecture
Upload → Parse → Chunk → Embed → FAISS Index → Query → LLM → Answer + Sources
