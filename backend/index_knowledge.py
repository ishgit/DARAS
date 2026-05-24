#!/usr/bin/env python3
"""
DARAS Knowledge Base Indexer
============================
Index all documents in  knowledge_base/  into ChromaDB.
Run once, or whenever you add new documents:

    cd backend
    python index_knowledge.py

Safe to run repeatedly — uses upsert, so existing docs are updated.
"""

import os
import sys

# Ensure .env is loaded
from dotenv import load_dotenv
load_dotenv()

# Verify API key
api_key = os.environ.get("GEMINI_API_KEY", "").strip()
if not api_key:
    print("❌ GEMINI_API_KEY not set in .env")
    print("   Get a free key from: https://aistudio.google.com/apikey")
    print("   Add to .env:  GEMINI_API_KEY=your-key-here")
    sys.exit(1)

from rag_engine import index_directory, _get_collection

print("📚 DARAS Knowledge Base Indexer")
print("=" * 50)

total = index_directory()

if total > 0:
    coll = _get_collection()
    print(f"\n✅ Done! {total} chunks indexed.")
    print(f"   Total chunks in DB: {coll.count()}")
    print(f"   Vector DB location: vector_db/")
else:
    print("\n⚠️  No documents were indexed.")
    print("   Make sure knowledge_base/ contains .txt or .md files.")
    print("   And that GEMINI_API_KEY is set in .env")
