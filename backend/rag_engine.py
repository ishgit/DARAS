"""
DARAS RAG Engine — ChromaDB vector search over knowledge base
=============================================================
Provides:
  • index_document()      – add a document (auto-chunked) to the vector DB
  • index_directory()     – bulk-index all .txt / .md files in a folder
  • search_knowledge()    – semantic search → top-N relevant chunks
  • answer_with_rag()     – full pipeline: retrieve → augment → generate

The vector DB is stored locally at  backend/vector_db/  (no server needed).
Embeddings use Gemini text-embedding-004 (free tier: 1 500 RPM).

Graceful fallback: if ChromaDB or API key is unavailable, search_knowledge()
returns an empty list and the LLM still answers (just without grounding).
"""

import os
import logging
import re

log = logging.getLogger(__name__)

# ── Paths ────────────────────────────────────────────────────────────────────
_DIR = os.path.dirname(os.path.abspath(__file__))
VECTOR_DB_PATH = os.path.join(_DIR, "vector_db")
KNOWLEDGE_DIR = os.path.join(_DIR, "knowledge_base")

# ── Lazy-init ChromaDB ───────────────────────────────────────────────────────
_collection = None


def _get_collection():
    """Lazy-init the ChromaDB collection; returns None on failure."""
    global _collection
    if _collection is not None:
        return _collection

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        log.warning("[DARAS-RAG] GEMINI_API_KEY not set — RAG disabled")
        return None

    try:
        import chromadb
        from chromadb.utils import embedding_functions

        embed_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
            api_key=api_key,
            model_name="models/text-embedding-004",
        )

        client = chromadb.PersistentClient(path=VECTOR_DB_PATH)
        _collection = client.get_or_create_collection(
            name="daras_knowledge",
            embedding_function=embed_fn,
            metadata={"hnsw:space": "cosine"},
        )
        log.info(
            f"[DARAS-RAG] ChromaDB ready — {_collection.count()} chunks indexed"
        )
        return _collection

    except ImportError:
        log.warning("[DARAS-RAG] chromadb not installed — RAG disabled")
        return None
    except Exception as e:
        log.error(f"[DARAS-RAG] ChromaDB init failed: {e}")
        return None


# ── Chunking ─────────────────────────────────────────────────────────────────

def _chunk_text(text: str, max_chars: int = 800, overlap: int = 100) -> list[str]:
    """
    Split text into chunks of roughly `max_chars` characters
    with `overlap` character overlap between consecutive chunks.
    Splits on paragraph boundaries when possible.
    """
    # First try splitting on double-newlines (paragraphs)
    paragraphs = re.split(r"\n{2,}", text.strip())
    paragraphs = [p.strip() for p in paragraphs if len(p.strip()) > 30]

    # Merge small paragraphs, split large ones
    chunks = []
    current = ""

    for para in paragraphs:
        if len(current) + len(para) + 2 <= max_chars:
            current = (current + "\n\n" + para).strip()
        else:
            if current:
                chunks.append(current)
            # If a single paragraph is too long, split by sentences
            if len(para) > max_chars:
                sentences = re.split(r"(?<=[.!?।])\s+", para)
                buf = ""
                for sent in sentences:
                    if len(buf) + len(sent) + 1 <= max_chars:
                        buf = (buf + " " + sent).strip()
                    else:
                        if buf:
                            chunks.append(buf)
                        buf = sent
                if buf:
                    current = buf
                else:
                    current = ""
            else:
                current = para

    if current:
        chunks.append(current)

    return chunks


# ── Indexing ─────────────────────────────────────────────────────────────────

def index_document(
    doc_id: str, text: str, metadata: dict | None = None
) -> int:
    """
    Chunk a document and upsert into ChromaDB.

    Returns the number of chunks indexed, or 0 on failure.
    """
    coll = _get_collection()
    if coll is None:
        return 0

    chunks = _chunk_text(text)
    if not chunks:
        return 0

    ids = [f"{doc_id}__chunk_{i}" for i in range(len(chunks))]
    metas = [{**(metadata or {}), "source": doc_id, "chunk_idx": i} for i in range(len(chunks))]

    try:
        coll.upsert(ids=ids, documents=chunks, metadatas=metas)
        log.info(f"[DARAS-RAG] Indexed {len(chunks)} chunks from '{doc_id}'")
        return len(chunks)
    except Exception as e:
        log.error(f"[DARAS-RAG] Indexing '{doc_id}' failed: {e}")
        return 0


def index_directory(directory: str | None = None) -> int:
    """
    Index every .txt and .md file in `directory` (defaults to knowledge_base/).

    Returns total chunks indexed.
    """
    directory = directory or KNOWLEDGE_DIR
    if not os.path.isdir(directory):
        log.warning(f"[DARAS-RAG] Knowledge dir not found: {directory}")
        return 0

    total = 0
    for fname in sorted(os.listdir(directory)):
        if not fname.endswith((".txt", ".md")):
            continue
        fpath = os.path.join(directory, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            text = f.read()
        doc_id = os.path.splitext(fname)[0]
        total += index_document(doc_id, text, metadata={"file": fname})

    log.info(f"[DARAS-RAG] Indexed {total} total chunks from {directory}")
    return total


# ── Retrieval ────────────────────────────────────────────────────────────────

def search_knowledge(query: str, n_results: int = 5) -> list[str]:
    """
    Semantic search over the knowledge base.

    Returns a list of relevant text chunks (may be empty).
    """
    coll = _get_collection()
    if coll is None or coll.count() == 0:
        return []

    try:
        results = coll.query(query_texts=[query], n_results=n_results)
        docs = results.get("documents", [[]])[0]
        return docs
    except Exception as e:
        log.error(f"[DARAS-RAG] Search failed: {e}")
        return []


# ── Full RAG pipeline ────────────────────────────────────────────────────────

def answer_with_rag(
    question: str,
    user_context: dict | None = None,
    language: str = "hi",
) -> dict:
    """
    Full RAG pipeline:  retrieve → augment → generate.

    Returns
    -------
    dict with keys: answer (str|None), sources (list[str])
    """
    from ai_service import answer_question

    # 1 — Retrieve
    chunks = search_knowledge(question, n_results=4)

    # 2 — Generate (answer_question accepts rag_chunks)
    answer = answer_question(
        question=question,
        user_context=user_context,
        rag_chunks=chunks if chunks else None,
        language=language,
    )

    return {
        "answer": answer,
        "sources": [c[:120] + "…" for c in chunks] if chunks else [],
        "rag_used": bool(chunks),
    }
