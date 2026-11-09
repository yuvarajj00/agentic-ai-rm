// Week 2: Agentic RAG, Retrieval, Evaluation, and Memory (Days 8–14)
module.exports = [
  {
    day: 8,
    title: "Agent state and short-term memory",
    topic: "Agent state and short-term memory",
    topicGroup: "Agentic RAG & Memory",
    week: 2,
    date: "November 18, 2026",
    isoDate: "2026-11-18",
    goal: "Implement a robust short-term memory engine for conversational agents that manages context window limits using sliding window buffering, token-aware trimming, and semantic summary compaction.",
    prerequisites: [
      "Day 5 message history representation and role schemas",
      "Tokenization mechanics and context limits (tiktoken or provider token counters)",
      "JSON serialization and state persistence fundamentals"
    ],
    learningChecklist: [
      {
        category: "Conversation Memory Patterns",
        items: [
          "Statelessness of raw LLM API endpoints and the necessity of client-side state maintenance",
          "ConversationBufferMemory: naive append-only history and quadratic token cost growth",
          "ConversationBufferWindowMemory: fixed K-turn FIFO sliding window retention",
          "ConversationTokenBufferMemory: strict max-token budgeting with dynamic oldest-message pruning",
          "ConversationSummaryMemory: using background LLM passes to compact historical turns into a persistent running synopsis",
          "Hybrid Summary-Window Memory: retaining the last N turns verbatim while summarizing turns 1 through (total - N)",
          "Handling tool calls and tool responses inside pruned histories: avoiding dangling tool_call_id exceptions"
        ]
      },
      {
        category: "Token Budgeting & Context Windows",
        items: [
          "Pre-flight token estimation per message: role overhead, content tokens, and message envelope structure",
          "Allocating budget margins: system prompt budget (fixed), history budget (sliding), retrieval budget (dynamic), output budget (reserved)",
          "Graceful degradation when context limits are approached: warning thresholds vs hard eviction",
          "Why preserving the system prompt is non-negotiable during history truncation"
        ]
      },
      {
        category: "State Serialization & Persistence",
        items: [
          "Pydantic schemas for session state: `SessionState`, `MessageRecord`, and `MemoryMetadata`",
          "Serializing conversation state to disk (JSON / SQLite) and restoring it across process restarts",
          "Thread IDs / Session IDs: isolating concurrent user dialogues",
          "Resetting, clearing, and exporting session transcripts for human audit"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-08/` with modular structure",
      "Define `schemas.py` with `ChatMessage`, `MessageRole`, `MemoryConfig`, and `ConversationState` Pydantic models",
      "Implement `token_counter.py` using `tiktoken` or SDK native count_tokens to accurately calculate prompt token overhead",
      "Build `memory_buffer.py` implementing `SlidingWindowMemory` and `TokenBudgetMemory`",
      "Build `summarizer.py` that triggers an asynchronous summarization call when conversation token count exceeds 70% of budget",
      "Ensure tool calls and tool results are pruned in atomic pairs to prevent API schema validation errors",
      "Create `memory_manager.py` providing unified API: `add_user_message()`, `add_assistant_message()`, `add_tool_turn()`, and `get_context_window()`",
      "Implement file-based persistence in `storage.py` saving and loading sessions by `session_id`",
      "Write unit tests in `tests/test_memory.py` verifying sliding eviction, token budget compliance, and atomic tool pruning",
      "Document memory lifecycle diagrams and usage patterns in `README.md`"
    ],
    failureCases: [
      "Context limit exhaustion: History exceeds max token budget without throwing unhandled API 400 Bad Request",
      "Orphaned tool response: History pruning deletes assistant tool call but retains tool result (must detect and prune atomically)",
      "System prompt truncation: Pruning logic accidentally evicts Developer/System prompt (must protect system messages from eviction)",
      "Corrupt session file: JSON file contains truncated data (must fallback safely to new session and alert user)",
      "Summarizer recursion trap: Summary generation request itself exceeds token limits (must apply strict max_tokens to summary prompt)"
    ],
    deliverables: {
      requiredFiles: [
        "schemas.py",
        "token_counter.py",
        "memory_buffer.py",
        "summarizer.py",
        "memory_manager.py",
        "storage.py",
        "main.py",
        "tests/test_memory.py",
        "README.md"
      ],
      description: "A production-ready conversational memory manager supporting sliding-window, token-budgeted, and summarized context retention with persistence."
    },
    completionCriteria: [
      "Conversations spanning 30+ turns never exceed the configured context token ceiling",
      "System prompt remains pinned at position 0 across all pruning events",
      "Assistant tool calls and their matching tool responses are pruned in atomic pairs without leaving dangling references",
      "Sessions persist to local storage and resume cleanly with matching thread IDs",
      "Unit tests pass 100% covering sliding window truncation, token budgeting, and atomic cleanup"
    ],
    activeRecallQuestions: [
      "Why does a naive append-only conversation history inevitably crash long-running agent workflows?",
      "What runtime exception occurs if you delete an assistant tool call from history while leaving its corresponding tool role message in the array?",
      "How does a hybrid summary-buffer memory balance recency bias with long-range factual recall?",
      "Why must token counting account for message envelope framing (e.g., `<|im_start|>` tokens) rather than raw string lengths?",
      "What are the trade-offs of generating conversational summaries synchronously versus asynchronously in background workers?"
    ],
    advancedTopics: [
      "Entity memory extraction: tracking named entities (user preferences, project names) in structured key-value stores",
      "Vector-backed conversation memory: indexing past turns into a vector database for semantic recall across distant sessions",
      "Asynchronous background summarization via message queues (Redis / Celery)"
    ]
  },
  {
    day: 9,
    title: "Embeddings and document preparation",
    topic: "Embeddings and document preparation",
    topicGroup: "Agentic RAG & Memory",
    week: 2,
    date: "November 19, 2026",
    isoDate: "2026-11-19",
    goal: "Ingest unstructured documents (Markdown, PDF, HTML), execute deterministic text chunking with overlap, generate vector embeddings, and understand dense vector geometry.",
    prerequisites: [
      "Linear algebra fundamentals (vectors, dot products, Euclidean distance, cosine similarity)",
      "Python file I/O and text processing regex patterns",
      "Hosted embedding API access (Google text-embedding-004, OpenAI text-embedding-3-small, or local HuggingFace sentence-transformers)"
    ],
    learningChecklist: [
      {
        category: "Embedding Geometry & Models",
        items: [
          "What embeddings are: mapping semantic meaning into dense floating-point vectors in high-dimensional space (e.g. 768d or 1536d)",
          "Dot product, Euclidean distance (L2 norm), and Cosine similarity mathematical relationships",
          "Why normalized vectors make cosine similarity equivalent to a simple dot product",
          "Trade-offs between embedding models: parameter size, dimensionalities, context length, latency, and cost",
          "Matryoshka Representation Learning (MRL): truncating embedding dimensions without catastrophic accuracy loss",
          "Asymmetric embeddings: query embedding prefixes (`search_query: `) versus document embedding prefixes (`search_document: `)"
        ]
      },
      {
        category: "Document Parsing & Cleaning",
        items: [
          "Parsing multi-format raw files: Markdown, PDF (pypdf / pdfplumber), and HTML (BeautifulSoup)",
          "Sanitizing whitespace, stripping boilerplates, headers, footers, and HTML script tags",
          "Preserving structural hierarchy: Markdown headings (#, ##, ###), tables, and fenced code blocks",
          "Attaching rich chunk metadata: source filepath, document title, page number, section header, and creation timestamp"
        ]
      },
      {
        category: "Chunking Strategies",
        items: [
          "The chunking dilemma: chunks too small lose context; chunks too large dilute retrieval precision",
          "Fixed-size character chunking vs Token-based chunking",
          "Chunk overlap mechanics: preventing semantic fragmentation across boundaries",
          "Recursive character text splitting: splitting hierarchically by double newlines (`\\n\\n`), single newlines (`\\n`), spaces, and characters",
          "Document-specific splitting: MarkdownHeaderTextSplitter and PythonCodeSplitter",
          "Semantic chunking: splitting dynamically based on embedding distance spikes between adjacent sentences"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-09/` with sample corpus (technical documentation, articles)",
      "Define `document.py` containing `Document` and `Chunk` Pydantic models with typed metadata dictionaries",
      "Implement `loaders.py` to ingest Markdown files, raw text, and PDFs into standardized document objects",
      "Build `text_splitter.py` implementing recursive character chunking with configurable `chunk_size` and `chunk_overlap`",
      "Build `markdown_splitter.py` that preserves section heading ancestry in chunk metadata (`h1 > h2 > h3`)",
      "Build `embedding_client.py` wrapping embedding model calls with batching (e.g. 64 chunks per batch) and exponential backoff",
      "Implement a math utility `vector_math.py` computing cosine similarity and dot product from scratch without third-party libraries",
      "Write a test script `test_similarity.py` verifying semantically identical sentences produce cosine similarity > 0.85 while unrelated sentences produce < 0.3",
      "Write CLI tool `ingest.py` that scans a directory, splits files, generates embeddings, and saves serialized vectors to disk",
      "Document optimal chunk size and overlap benchmarks in `README.md`"
    ],
    failureCases: [
      "Chunk boundary clipping: Important sentence split directly down the middle due to zero overlap (must enforce 10-20% overlap)",
      "Rate limit on bulk embeddings: Ingesting 500 chunks simultaneously triggers 429 RateLimit (must implement batching with sleep / backoff)",
      "Corrupted PDF extraction: PDF parser returns empty string or ligature artifacts (must log warning and validate non-empty text)",
      "Dimension mismatch: Query embedded with 768d model compared against 1536d database vectors (must validate vector dimensionality)",
      "Metadata loss: Document source filename lost during chunking (must assert every chunk retains parent lineage)"
    ],
    deliverables: {
      requiredFiles: [
        "document.py",
        "loaders.py",
        "text_splitter.py",
        "markdown_splitter.py",
        "embedding_client.py",
        "vector_math.py",
        "ingest.py",
        "test_similarity.py",
        "README.md"
      ],
      description: "An end-to-end document preparation and embedding pipeline supporting recursive chunking, heading preservation, batch vectorization, and similarity math."
    },
    completionCriteria: [
      "Pipeline successfully parses Markdown and text documents into structured chunks with preserved heading metadata",
      "Recursive character splitter enforces max chunk size and overlap without creating zero-length chunks",
      "Embedding client vectorizes chunks in batches with automatic retries and progress logging",
      "Scratch cosine similarity function matches NumPy / SciPy results within 1e-6 tolerance",
      "Output artifacts inspectable in JSON format containing chunk text, metadata, and float vectors"
    ],
    activeRecallQuestions: [
      "Why does cosine similarity between normalized vectors simplify to the dot product?",
      "What is semantic chunking, and how does it differ from recursive character splitting?",
      "Why must chunk metadata include parent document lineage and section headings for reliable RAG?",
      "What happens when chunk size is set too small (e.g. 50 characters) versus too large (e.g. 8,000 characters)?",
      "Why do some modern embedding models require task-specific prefixes like 'search_query:' and 'search_document:'?"
    ],
    advancedTopics: [
      "Semantic chunking implementation using sentence boundary detection (`nltk` / `spacy`) and rolling cosine variance",
      "Matryoshka embeddings: experimenting with dimension truncation from 1536 down to 256 dimensions and measuring recall delta",
      "Multi-modal embeddings: joint image and text embeddings using CLIP or Gemini Multimodal Embedding models"
    ]
  },
  {
    day: 10,
    title: "Vector storage with PostgreSQL and pgvector",
    topic: "Vector storage with PostgreSQL and pgvector",
    topicGroup: "Agentic RAG & Memory",
    week: 2,
    date: "November 20, 2026",
    isoDate: "2026-11-20",
    goal: "Deploy PostgreSQL with the pgvector extension, design an enterprise vector schema, create indexing structures (IVFFlat vs HNSW), and execute k-NN similarity queries.",
    prerequisites: [
      "Day 9 embeddings generation and vector geometry",
      "Relational database and SQL fundamentals (DDL, DML, indexing, transactions)",
      "Docker basics (running postgres with pgvector image)"
    ],
    learningChecklist: [
      {
        category: "Vector Database Fundamentals",
        items: [
          "Why relational databases with vector extensions (pgvector) compete directly with standalone vector DBs (Pinecone, Qdrant, Chroma)",
          "Advantages of unified storage: joining relational user/tenant metadata with vector embeddings in a single ACID transaction",
          "Exact nearest neighbor search (k-NN) using brute force flat scan vs Approximate Nearest Neighbor search (ANN)",
          "Distance operators in pgvector: `<->` (Euclidean/L2), `<#>` (negative inner product), and `<=>` (cosine distance)"
        ]
      },
      {
        category: "Indexing Strategies in pgvector",
        items: [
          "IVFFlat index: Inverted file with flat quantization, Voronoi cells, and `lists` tuning parameters",
          "Why IVFFlat requires training on representative data and degrades if queried before data is populated",
          "HNSW index (Hierarchical Navigable Small World): multi-layer graph structures, `m` (max connections), and `ef_construction`",
          "HNSW trade-offs: faster query latency and higher recall at the cost of slower build times and higher RAM usage",
          "Query-time tuning: setting `hnsw.ef_search` to balance QPS vs recall"
        ]
      },
      {
        category: "Production Schema Design",
        items: [
          "PostgreSQL table schema: `id UUID`, `content TEXT`, `metadata JSONB`, and `embedding vector(1536)`",
          "GIN index on `metadata JSONB` for microsecond filtered vector queries (e.g. `WHERE metadata->>'user_id' = 'xyz'`)",
          "Idempotent document upserts: handling content hashing and deduplication (`ON CONFLICT DO UPDATE`)",
          "Connection pooling (psycopg3 / SQLAlchemy) in async Python runtimes"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-10/` with Docker Compose file",
      "Write `docker-compose.yml` spinning up PostgreSQL 16 with `pgvector/pgvector:pg16`",
      "Create `schema.sql` defining extension `CREATE EXTENSION IF NOT EXISTS vector;`, document table, and HNSW cosine index",
      "Build `db.py` managing async connection pooling with `psycopg` (v3) with pgvector registration",
      "Build `vector_repository.py` providing typed CRUD methods: `insert_chunks()`, `search_similar()`, and `delete_by_source()`",
      "Implement hybrid metadata filtering: query top-K similar chunks restricted to specific tenants or document tags",
      "Write `benchmark_indexing.py` loading 5,000 synthetic vectors to compare query latency: Exact Flat Scan vs IVFFlat vs HNSW",
      "Write automated tests in `tests/test_vector_store.py` validating upsert idempotency and similarity ranking correctness",
      "Document PostgreSQL setup, connection strings, and index configuration in `README.md`"
    ],
    failureCases: [
      "Vector dimension mismatch error: Inserting 768-dim vector into 1536-dim column (PostgreSQL raises typed vector length error)",
      "Premature IVFFlat index creation: Index created on empty table resulting in 0 search results after loading data (must explain why HNSW is preferred)",
      "Unescaped JSON metadata queries: Malformed JSONB filter crashing query (must use parameterized SQL queries with psycopg3)",
      "Connection exhaustion: Concurrent agent threads opening unpooled database connections (must enforce connection pool with max_overflow limits)",
      "Docker port conflict: Port 5432 already occupied by local service (must configure custom port 5433 with environment override)"
    ],
    deliverables: {
      requiredFiles: [
        "docker-compose.yml",
        "schema.sql",
        "db.py",
        "vector_repository.py",
        "benchmark_indexing.py",
        "main.py",
        "tests/test_vector_store.py",
        "README.md"
      ],
      description: "A production PostgreSQL + pgvector storage engine with HNSW indexing, JSONB metadata filtering, and benchmark suite."
    },
    completionCriteria: [
      "Docker Compose boots PostgreSQL with pgvector extension enabled and healthy",
      "Chunks with 1536d or 768d embeddings and JSONB metadata insert cleanly via batch transactions",
      "HNSW index creates successfully on cosine distance operator (`vector_cosine_ops`)",
      "Similarity search returns ordered top-K chunks with accurate cosine similarity scores",
      "Filtered vector queries (`WHERE metadata->>'tenant_id' = ...`) filter candidates accurately before similarity ranking"
    ],
    activeRecallQuestions: [
      "What is the mathematical difference between pgvector operators `<->`, `<#>`, and `<=>`?",
      "Why is HNSW generally preferred over IVFFlat for production vector search despite higher memory usage?",
      "What is the danger of creating an IVFFlat index on an empty table before loading bulk embeddings?",
      "How does combining a JSONB GIN index with an HNSW vector index enable efficient multi-tenant retrieval?",
      "What is the recall vs latency trade-off controlled by the PostgreSQL setting `SET hnsw.ef_search = 100`?"
    ],
    advancedTopics: [
      "Hybrid search in PostgreSQL: combining full-text search (`tsvector` + `BM25`) with `pgvector` using Reciprocal Rank Fusion (RRF)",
      "Partitioning vector tables by tenant or category using PostgreSQL native table partitioning",
      "Vector quantization techniques: Scalar Quantization (SQ8) to reduce RAM footprint by 75%"
    ]
  },
  {
    day: 11,
    title: "Basic RAG pipeline and grounded answers",
    topic: "Basic RAG pipeline and grounded answers",
    topicGroup: "Agentic RAG & Memory",
    week: 2,
    date: "November 21, 2026",
    isoDate: "2026-11-21",
    goal: "Build an end-to-end Retrieval-Augmented Generation (RAG) pipeline that retrieves grounded knowledge, constructs defensive prompts, and produces factual answers with strict source citations.",
    prerequisites: [
      "Day 9 document chunking and embedding pipelines",
      "Day 10 vector storage and similarity retrieval in PostgreSQL / pgvector",
      "Day 2 structured outputs and prompt engineering basics"
    ],
    learningChecklist: [
      {
        category: "RAG Architecture & Mechanics",
        items: [
          "The classic RAG triad: Ingest -> Retrieve -> Synthesize",
          "Why naive LLMs hallucinate domain-specific queries and how grounded context solves epistemic uncertainty",
          "Context window assembly: formatting retrieved chunks with index tags (`[Doc 1]`, `[Doc 2]`) and source metadata",
          "Lost in the Middle phenomenon: why critical evidence placed in the middle of long contexts is overlooked by transformer attention",
          "Prompt engineering for grounding: strict instructions to answer ONLY from context and explicitly declare 'I do not have sufficient information' when missing"
        ]
      },
      {
        category: "Citation & Attribution Mechanics",
        items: [
          "Designing citation schemas: forcing the LLM to return `answer: str` and `citations: list[Citation]`",
          "Citation model: `source_id`, `chunk_id`, `quote: str`, and `relevance_explanation`",
          "Verifying citations programmatically: asserting that quoted text actually exists in the retrieved context chunks (hallucinated quote detection)",
          "Calculating grounding confidence scores"
        ]
      },
      {
        category: "Handling Retrieval Edge Cases",
        items: [
          "Empty retrieval results: query terms produce similarity scores below the relevance threshold",
          "Irrelevant context distraction: retrieved chunks match query keywords but fail to answer the underlying intent",
          "Conflicting sources: two documents providing contradicting instructions",
          "Budgeting tokens between prompt, context chunks, and completion room"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-11/` linking Day 9 loaders and Day 10 pgvector repository",
      "Define `schemas.py` containing `RAGQuery`, `RetrievedContext`, `Citation`, and `GroundedAnswer` Pydantic models",
      "Implement `retriever.py` that embeds the user query, queries pgvector with a similarity threshold (e.g. > 0.70), and caps results at top-K (e.g. K=4)",
      "Build `context_builder.py` that formats retrieved chunks with XML or markdown delimiters (`<context><doc id='1'>...</doc></context>`)",
      "Build `prompts.py` containing a battle-tested system prompt strictly enforcing grounding, citation tags, and uncertainty admissions",
      "Implement `rag_pipeline.py` orchestrating: User Query -> Retrieval -> Context Building -> LLM Structured Generation -> Citation Verification",
      "Implement citation validator in `citation_verifier.py` verifying every quoted snippet exists as an exact substring in the retrieved chunks",
      "Write a test suite in `tests/test_rag.py` evaluating known query-context pairs, missing context queries, and out-of-domain traps",
      "Document full query-to-answer sequence diagrams and prompt templates in `README.md`"
    ],
    failureCases: [
      "Hallucinated citations: LLM invents a citation or quotes a sentence that does not exist in the context (must be flagged by validator)",
      "Unrelated query answering: User asks general knowledge question not in docs (must trigger 'I do not have sufficient information' refusal)",
      "Context stuffing overflow: Top-K chunks exceed model context window (context builder must measure tokens and trim lower-ranked chunks)",
      "Low-similarity garbage injection: Chunks with cosine similarity < 0.5 injected into prompt, confusing the LLM (must filter by similarity threshold)",
      "Prompt injection via retrieved document: Untrusted document chunk contains instructions like 'Ignore previous instructions' (must isolate context in data tags)"
    ],
    deliverables: {
      requiredFiles: [
        "schemas.py",
        "retriever.py",
        "context_builder.py",
        "prompts.py",
        "citation_verifier.py",
        "rag_pipeline.py",
        "main.py",
        "tests/test_rag.py",
        "README.md"
      ],
      description: "A complete grounded RAG pipeline with context formatting, structured answers, automated citation verification, and fallback handling."
    },
    completionCriteria: [
      "Pipeline answers user questions accurately using retrieved PostgreSQL document context",
      "Every answer includes structured citations linking directly to source chunk IDs",
      "Citation verifier successfully flags any hallucinated quotes with 100% precision",
      "When no relevant documents are found, pipeline cleanly outputs refusal without guessing or hallucinating",
      "Context documents are cleanly delimited with XML tags preventing prompt injection attacks from document contents"
    ],
    activeRecallQuestions: [
      "What is the 'Lost in the Middle' problem, and how can context reordering mitigate it?",
      "Why is automated citation verification necessary even when using state-of-the-art LLMs with temperature=0?",
      "How do delimiters like `<context>` and `<doc id='...'>` prevent document-injected prompt overrides?",
      "What are the trade-offs of setting a strict minimum similarity threshold (e.g. 0.75) for retrieved chunks?",
      "Why should an enterprise RAG system declare 'I do not have sufficient information' rather than attempting a best-effort guess?"
    ],
    advancedTopics: [
      "Context compression: using small models to extract only relevant sentences from chunks before injecting into prompt",
      "Reciprocal context ordering: placing the most relevant chunks at the very beginning and very end of the prompt context block",
      "Streaming RAG answers with real-time citation rendering via Server-Sent Events (SSE)"
    ]
  },
  {
    day: 12,
    title: "Retrieval quality and relevance evaluation",
    topic: "Retrieval quality and relevance evaluation",
    topicGroup: "Agentic RAG & Memory",
    week: 2,
    date: "November 22, 2026",
    isoDate: "2026-11-22",
    goal: "Measure retrieval performance using statistical IR metrics (MRR, NDCG, Precision@K), implement Cross-Encoder reranking, and apply query transformations (HyDE, Multi-Query).",
    prerequisites: [
      "Day 11 basic RAG pipeline and vector retrieval",
      "Information retrieval math (precision, recall, reciprocal rank, discounted cumulative gain)",
      "Cross-encoder vs Bi-encoder architectural concepts"
    ],
    learningChecklist: [
      {
        category: "Information Retrieval Metrics",
        items: [
          "Why naive similarity search often retrieves semantically close but factually irrelevant text",
          "Precision@K: proportion of retrieved top-K chunks that are truly relevant",
          "Recall@K: proportion of all relevant corpus chunks captured in top-K results",
          "Mean Reciprocal Rank (MRR): measuring the reciprocal rank of the first relevant chunk across a test query dataset",
          "Normalized Discounted Cumulative Gain (NDCG@K): evaluating graded relevance with logarithmic position penalties",
          "Building a golden evaluation dataset with ground-truth relevant document IDs"
        ]
      },
      {
        category: "Reranking Pipelines",
        items: [
          "Bi-Encoder (dense retrieval): fast vector dot-product at scale, but lacks cross-attention between query and document tokens",
          "Cross-Encoder (reranker): performs full self-attention across both query and candidate text simultaneously, delivering superior accuracy",
          "Two-stage retrieval architecture: Stage 1 retrieves top 25 candidates cheaply via vector/BM25; Stage 2 reranks top 25 down to top 4 using a Cross-Encoder (Cohere Rerank, BGE-Reranker)",
          "Quantifying latency overhead vs accuracy gain of rerankers"
        ]
      },
      {
        category: "Query Transformation Techniques",
        items: [
          "Query Rewriting: expanding acronyms, resolving ambiguous pronouns from chat history",
          "Hypothetical Document Embeddings (HyDE): prompting LLM to hallucinate a plausible hypothetical answer, then embedding that answer to retrieve real documents",
          "Multi-Query Expansion: generating 3–5 semantic variations of user query, executing parallel searches, and deduplicating results",
          "Sub-query Decomposition: breaking complex multi-part questions into discrete atomic retrieval steps"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-12/` with golden evaluation dataset `eval_dataset.json` (20 queries with ground-truth chunk IDs)",
      "Implement `metrics.py` calculating Precision@K, Recall@K, MRR, and NDCG@K from scratch",
      "Build `reranker.py` implementing a two-stage retrieval pipeline using `sentence-transformers/cross-encoder` or Cohere Rerank API",
      "Build `query_transform.py` implementing: `rewrite_query()`, `generate_hyde_document()`, and `generate_multi_queries()`",
      "Create `evaluator.py` benchmarking: Baseline Vector Retrieval vs Vector + HyDE vs Two-Stage (Vector + Reranker)",
      "Log detailed metric tables comparing MRR@5 and NDCG@5 across all three pipelines",
      "Write automated tests in `tests/test_retrieval_eval.py` asserting reranked MRR exceeds baseline vector MRR",
      "Document benchmark results, latency measurements, and recommendations in `README.md`"
    ],
    failureCases: [
      "HyDE hallucination drift: Hypothetical document contains bizarre hallucinations that pull vector search into wrong document clusters",
      "Reranker latency spike: Reranking 100 documents synchronously takes > 2.5 seconds, breaching agent SLA (must cap Stage 1 candidates to 20-30)",
      "Zero ground truth matches: Query terms completely missing from corpus (evaluator must score 0 without divide-by-zero crashes)",
      "Duplicate candidates in Multi-Query: Parallel query variations retrieve identical chunks (must implement deduplication by chunk ID before reranking)",
      "Cross-encoder token truncation: Document chunk exceeds cross-encoder context limit (512 tokens), silently discarding trailing evidence"
    ],
    deliverables: {
      requiredFiles: [
        "eval_dataset.json",
        "metrics.py",
        "reranker.py",
        "query_transform.py",
        "evaluator.py",
        "benchmark_runner.py",
        "tests/test_retrieval_eval.py",
        "README.md"
      ],
      description: "A comprehensive retrieval evaluation and optimization suite with MRR/NDCG metrics, Cross-Encoder reranking, and HyDE query transformations."
    },
    completionCriteria: [
      "`metrics.py` correctly calculates MRR and NDCG verified against standard scikit-learn / manual math",
      "Two-stage retrieval (Vector Search + Cross-Encoder Rerank) demonstrates measurable MRR improvement over raw vector search on `eval_dataset.json`",
      "HyDE module generates focused hypothetical answers and embeds them for enhanced semantic alignment",
      "Multi-query expansion executes queries in parallel and deduplicates chunks by unique ID",
      "README includes a comprehensive Markdown benchmark table showing latency and MRR deltas across methods"
    ],
    activeRecallQuestions: [
      "Why is a Cross-Encoder fundamentally more accurate than a Bi-Encoder for relevance scoring?",
      "How does NDCG penalize relevant documents that appear at rank 5 compared to rank 1?",
      "What is the core intuition behind HyDE, and in what query scenarios does it outperform raw query embeddings?",
      "Why is Two-Stage retrieval (Bi-encoder retrieve top-30 -> Cross-encoder rerank top-5) the standard architecture in production?",
      "How do you prevent Multi-Query expansion from flooding context windows with duplicate content?"
    ],
    advancedTopics: [
      "ColBERT / Late Interaction models: token-level vector representations balancing Bi-encoder speed with Cross-encoder expressive power",
      "Contextual query reformulation using multi-turn conversational chat history",
      "Active negative mining: fine-tuning domain-specific embedding models using hard negatives from failed queries"
    ]
  },
  {
    day: 13,
    title: "Agentic retrieval and CRAG-inspired correction",
    topic: "Agentic retrieval and CRAG-inspired correction",
    topicGroup: "Agentic RAG & Memory",
    week: 2,
    date: "November 23, 2026",
    isoDate: "2026-11-23",
    goal: "Implement Corrective Retrieval-Augmented Generation (CRAG) and self-reflective agent loops that grade retrieved documents, rewrite defective queries, and fallback to external search when internal knowledge is deficient.",
    prerequisites: [
      "Day 11 RAG pipeline and Day 12 query transformations",
      "Day 4 multi-turn tool execution loop and routing logic",
      "Search tool integration (Tavily, DuckDuckGo, or SearxNG)"
    ],
    learningChecklist: [
      {
        category: "Agentic RAG & Self-Reflection",
        items: [
          "The limitation of linear RAG pipelines: no mechanism to detect when retrieved context is useless before generating an answer",
          "CRAG (Corrective RAG) architecture: introducing an explicit Retrieval Evaluator node",
          "Three-way evaluation grading: Correct (high confidence), Ambiguous (partial relevance), Incorrect (zero relevant knowledge)",
          "Self-reflective loops: model acts as a critic grading both retrieval relevance and candidate generation groundedness"
        ]
      },
      {
        category: "Corrective Actions & Fallbacks",
        items: [
          "Document filtering / Knowledge refinement: stripping irrelevant sentences from graded 'Ambiguous' documents",
          "Automated query rewriting: transforming failed queries based on what information was missing",
          "External search fallback: automatically invoking web search (Tavily API / DuckDuckGo) when internal corpus confidence is 'Incorrect'",
          "Synthesizing combined knowledge: merging internal enterprise context with external web evidence safely"
        ]
      },
      {
        category: "Routing & Decision Graphs",
        items: [
          "Building state machines for retrieval: Query -> Vector Retrieve -> Grade Context -> Branch: [Valid -> Generate] OR [Invalid -> Web Search -> Generate]",
          "Setting maximum retry thresholds: preventing infinite query-rewriting loops",
          "Logging routing decisions for transparency and auditability"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-13/`",
      "Define `state.py` containing `AgenticRAGState` with fields: `query`, `original_query`, `documents`, `relevance_grade`, `retry_count`, and `final_answer`",
      "Build `evaluator.py` prompting an LLM grader to classify retrieved documents as `CORRECT`, `AMBIGUOUS`, or `INCORRECT` with structured confidence scores",
      "Build `knowledge_refiner.py` to extract high-signal key phrases and strip noise from ambiguous chunks",
      "Build `web_search.py` wrapping external search tool (Tavily or DuckDuckGo) for automated fallback",
      "Build `agent_loop.py` implementing the CRAG state loop: Retrieve -> Evaluate -> Branch (Refine / Web Search / Rewrite) -> Generate -> Hallucination Check",
      "Add a hallucination grading step: LLM verifies whether generated answer is strictly grounded in the approved context",
      "Write test cases in `tests/test_crag.py` simulating: 1) High-confidence internal match, 2) Poor retrieval triggering web fallback, 3) Ambiguous retrieval triggering refinement",
      "Document flowcharts and edge cases in `README.md`"
    ],
    failureCases: [
      "Grader false negative: Grader rejects a valid document due to overly pedantic rubric (must calibrate grading prompt with few-shot examples)",
      "Infinite rewrite loop: Web search repeatedly fails and triggers another rewrite (must enforce `max_retries = 2` hard stop)",
      "Web search rate limit failure: External search API is down or rate limited (must gracefully degrade to admitting lack of knowledge)",
      "Contradiction between web search and internal docs: Web data conflicts with internal policies (must prioritize internal corporate docs via prompt instructions)",
      "Context poisoning from web search: Malicious search result contains prompt injection (must run input sanitation on search snippets)"
    ],
    deliverables: {
      requiredFiles: [
        "state.py",
        "evaluator.py",
        "knowledge_refiner.py",
        "web_search.py",
        "agent_loop.py",
        "main.py",
        "tests/test_crag.py",
        "README.md"
      ],
      description: "An agentic self-correcting RAG pipeline implementing the CRAG pattern with retrieval grading, query rewriting, web search fallback, and hallucination checks."
    },
    completionCriteria: [
      "Agent autonomously grades retrieved document relevance without human intervention",
      "High-confidence retrievals proceed directly to generation without invoking external search",
      "Queries with zero internal document relevance autonomously trigger web search fallback and cite external sources",
      "Ambiguous contexts undergo knowledge stripping and query reformulation",
      "State loop terminates deterministically within max 2 iterations without unbounded execution loops"
    ],
    activeRecallQuestions: [
      "What is the fundamental difference between standard linear RAG and Corrective RAG (CRAG)?",
      "How does an LLM document grader classify retrieved text into 'Correct', 'Ambiguous', and 'Incorrect'?",
      "Why must external web search results be treated with higher security suspicion than internal document stores?",
      "What role does a secondary hallucination grader play after answer generation?",
      "How do you design a state machine to guarantee that query rewriting loops cannot run indefinitely?"
    ],
    advancedTopics: [
      "Self-RAG: training or prompting models to emit specialized reflection tokens (`[Retrieve]`, `[IsRel]`, `[IsSup]`, `[IsUse]`)",
      "Graph RAG: combining knowledge graph traversal with vector similarity for complex multi-hop entity queries",
      "Speculative RAG: running multiple drafting models in parallel to evaluate context usefulness"
    ]
  },
  {
    day: 14,
    title: "Long-term memory and Week 2 integration",
    topic: "Long-term memory and Week 2 integration",
    topicGroup: "Agentic RAG & Memory",
    week: 2,
    date: "November 24, 2026",
    isoDate: "2026-11-24",
    goal: "Ship Milestone Project 2: A complete Document QA & Research Agent that combines persistent long-term vector memory, two-stage reranking, CRAG self-correction, and the RAG Triad evaluation suite.",
    prerequisites: [
      "Days 8–13 complete implementations (Memory, Chunking, pgvector, Citations, Reranking, CRAG)",
      "Pydantic schemas, SQLite / PostgreSQL, and CLI design",
      "RAG Triad metrics (Context Relevance, Groundedness, Answer Relevance)"
    ],
    learningChecklist: [
      {
        category: "Long-Term Memory Architectures",
        items: [
          "Episodic memory (past conversation sessions) vs Semantic memory (factual knowledge base) vs Procedural memory (agent tools/skills)",
          "Vector-backed user profile memory: extracting user preferences and facts, storing them in a dedicated `user_memories` vector table",
          "Semantic recall: retrieving relevant user memories during initial prompt compilation",
          "Memory consolidation: merging duplicate facts, updating changed preferences, and expiring stale information"
        ]
      },
      {
        category: "RAG Triad Evaluation Suite",
        items: [
          "The TruLens / Ragas RAG Triad framework:",
          "1. Context Relevance: Is the retrieved context relevant to the user query? (Evaluating Retriever)",
          "2. Groundedness (Faithfulness): Is the answer fully supported by the retrieved context without hallucinations? (Evaluating Hallucination)",
          "3. Answer Relevance: Does the generated answer directly address the user's initial question? (Evaluating Generator)",
          "Automated scoring pipeline: running synthetic evaluation suites to generate a 0.0–1.0 quality scorecard"
        ]
      },
      {
        category: "System Integration & CLI Polish",
        items: [
          "Assembling the unified architecture: Document Ingestion -> Vector Storage -> Semantic Long-Term Memory -> Two-Stage Retrieval -> CRAG Self-Correction -> Citation Verification",
          "Building an interactive CLI research environment with rich terminal rendering (`rich` library)",
          "Generating exportable Markdown research briefs with verifiable footnotes and source links"
        ]
      }
    ],
    implementationChecklist: [
      "Create project repository `milestone-02-research-agent/`",
      "Implement `memory/long_term_memory.py` managing user facts and preferences in a PostgreSQL table with embedding search",
      "Integrate `retrieval/hybrid_retriever.py` combining pgvector search with Cohere / Cross-Encoder reranking",
      "Integrate `agent/crag_workflow.py` executing the self-correcting evaluation and web fallback loops",
      "Implement `eval/rag_triad.py` scoring Context Relevance, Groundedness, and Answer Relevance using structured LLM evaluators",
      "Build `cli.py` featuring interactive prompt loops, session memory persistence, streaming answers, and rich Markdown rendering",
      "Write automated end-to-end integration tests in `tests/test_milestone_02.py` verifying the full pipeline against 5 real-world technical documents",
      "Run evaluation suite and generate `reports/rag_triad_report.json` with average scores across test queries",
      "Draft comprehensive `README.md` with system architecture diagrams, installation instructions, sample queries, and evaluation benchmark results"
    ],
    failureCases: [
      "Conflicting user memory: Long-term memory states 'User prefers Python' but current session says 'Write in Rust' (must prioritize current session over historical memory)",
      "Low Groundedness score alert: Generator hallucinates an unsupported detail (RAG Triad test must catch hallucination and score Groundedness < 0.7)",
      "Database connection drop during multi-step research: Network blip drops Postgres pool (must auto-reconnect with retry backoff)",
      "Unbounded research budget: Agent initiates 10 recursive web searches for obscure topic (must enforce strict limit of 1 external search per query)",
      "Terminal formatting crash: Special characters in retrieved document crash CLI rendering (must sanitize ANSI strings)"
    ],
    deliverables: {
      requiredFiles: [
        "memory/long_term_memory.py",
        "retrieval/hybrid_retriever.py",
        "agent/crag_workflow.py",
        "eval/rag_triad.py",
        "cli.py",
        "main.py",
        "tests/test_milestone_02.py",
        "reports/rag_triad_report.json",
        "README.md"
      ],
      description: "Milestone Project 2: An enterprise Document QA & Research Agent featuring long-term memory, two-stage reranked RAG, CRAG self-correction, and automated RAG Triad evaluation."
    },
    completionCriteria: [
      "Agent successfully ingests a multi-document corpus and answers complex questions with verified citations",
      "Long-term memory successfully records and recalls user preferences across separate process runs",
      "CRAG workflow autonomously invokes web search fallback when tested with out-of-corpus queries",
      "RAG Triad evaluation suite executes and produces a quantitative report with Groundedness > 0.85 across all benchmark queries",
      "Milestone project is committed to Git with clean architecture, passing tests, and complete documentation"
    ],
    activeRecallQuestions: [
      "What are the three pillars of the RAG Triad, and which pipeline components does each pillar evaluate?",
      "How does semantic long-term memory differ in implementation from conversation buffer short-term memory?",
      "In what scenario should a current prompt's instructions override persistent long-term user memories?",
      "Why is automated groundedness evaluation critical before deploying agentic RAG into regulated customer-facing environments?",
      "What are the primary operational bottlenecks when running an end-to-end agentic RAG pipeline (embed -> retrieve -> rerank -> grade -> generate)?"
    ],
    advancedTopics: [
      "Automated synthetic dataset generation: using an LLM to generate 100 question-answer-context triples from raw documents for offline evaluation",
      "Graph-enhanced retrieval: linking vector search nodes with entity relationship edges in Neo4j",
      "Self-hosted Cross-Encoder deployment via vLLM / Triton Inference Server for sub-50ms reranking"
    ]
  }
];

