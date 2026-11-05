// Week 5: Deployment, Tracing, and AgentOps (Days 29–35)
module.exports = [
  {
    day: 29,
    title: "FastAPI service design for agents",
    topic: "FastAPI service design for agents",
    topicGroup: "Production & Guardrails",
    week: 5,
    date: "December 3, 2026",
    isoDate: "2026-12-03",
    goal: "Wrap agentic workflows in a high-performance, asynchronous FastAPI microservice featuring typed Pydantic endpoints, background job dispatch, run status polling, and API key authentication.",
    prerequisites: [
      "Weeks 1–4 agent workflows, LangGraph graphs, and guardrails",
      "FastAPI fundamentals (routing, Pydantic request/response models, dependency injection)",
      "RESTful API design and HTTP status semantics"
    ],
    learningChecklist: [
      {
        category: "Agent API Architecture",
        items: [
          "Why synchronous request-response breaks for agents: agent missions often take 15–90 seconds, causing HTTP gateway timeouts (504 Gateway Timeout)",
          "Asynchronous Execution Pattern: `POST /api/v1/runs` immediately returns `202 Accepted` with a `run_id`; client polls `GET /api/v1/runs/{run_id}` or listens to streaming events",
          "API Resource Modeling: `RunRequest`, `RunStatusResponse`, `RunStateResponse`, `ToolExecutionEvent`, and `RunCancelResponse`",
          "Separation of API server and execution workers: handling background agent coroutines safely"
        ]
      },
      {
        category: "FastAPI Production Primitives",
        items: [
          "Lifespan event handlers (`@asynccontextmanager`): initializing database pools, embedding models, and HTTP clients on startup; graceful shutdown on SIGTERM",
          "Dependency Injection (`Depends`): extracting authenticated user tokens, database sessions, and agent service instances",
          "API Key / Bearer Authentication: securing endpoints using `HTTPBearer` and verifying credentials against hashed keys in database",
          "Structured Global Exception Handlers: intercepting unhandled agent errors and returning standardized RFC 7807 Problem Details JSON"
        ]
      },
      {
        category: "State & Progress Polling Endpoints",
        items: [
          "`POST /api/v1/runs`: accepts user query and returns `{ 'run_id': 'uuid', 'status': 'queued' }`",
          "`GET /api/v1/runs/{run_id}`: returns execution status (`queued`, `running`, `completed`, `failed`, `cancelled`), timestamps, and total cost",
          "`GET /api/v1/runs/{run_id}/state`: returns full LangGraph state snapshot and intermediate messages",
          "`POST /api/v1/runs/{run_id}/cancel`: signals cooperative cancellation token to abort active run"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-29/` with FastAPI application layout",
      "Define `schemas.py` with Pydantic v2 models: `CreateRunRequest`, `RunResponse`, `RunStatus`, and `ErrorResponse`",
      "Implement `auth.py` verifying `X-API-Key` headers via FastAPI `Security` dependency",
      "Build `agent_runner.py` managing background execution of LangGraph agents using `asyncio.create_task`",
      "Build `api/routes.py` with endpoints: `POST /runs`, `GET /runs/{id}`, `GET /runs/{id}/state`, and `POST /runs/{id}/cancel`",
      "Implement `lifespan.py` managing application lifecycle, connection pools, and graceful task drainage",
      "Build `main.py` configuring CORS middleware, global exception handlers, and mounting API routers",
      "Write integration tests with `httpx.AsyncClient` in `tests/test_api.py` testing run creation, polling, cancellation, and unauthorized rejections",
      "Document API OpenAPI specification and curl examples in `README.md`"
    ],
    failureCases: [
      "Gateway timeout on long agent run: Synchronous endpoint blocks for 60s, triggering reverse proxy 504 (must use 202 Accepted async pattern)",
      "Unauthorized API request: Client sends request without valid API key (must return 401 Unauthorized with clean JSON error)",
      "Non-existent run ID: Client polls unknown UUID (must return 404 Not Found with explicit error message)",
      "Orphaned background task: Server receives SIGTERM while 5 agent runs are active (lifespan handler must await in-flight tasks up to 10s grace period)",
      "Invalid request body: Client omits required fields in prompt payload (Pydantic returns 422 Unprocessable Entity with exact field errors)"
    ],
    deliverables: {
      requiredFiles: [
        "schemas.py",
        "auth.py",
        "agent_runner.py",
        "api/routes.py",
        "lifespan.py",
        "main.py",
        "tests/test_api.py",
        "README.md"
      ],
      description: "An asynchronous production FastAPI microservice exposing agent execution, status polling, cancellation, and API key security."
    },
    completionCriteria: [
      "FastAPI server boots cleanly and serves interactive documentation at `/docs`",
      "`POST /runs` accepts task prompts, initiates background agent execution, and responds immediately with 202 Accepted and run ID",
      "`GET /runs/{id}` returns accurate live statuses as the background agent progresses",
      "Security dependency rejects unauthenticated calls with 401 Unauthorized",
      "Automated test suite passes 100% using `httpx.AsyncClient` verifying all endpoints and error cases"
    ],
    activeRecallQuestions: [
      "Why must production AI agent APIs use asynchronous 202 Accepted job submission rather than synchronous request-response?",
      "How do FastAPI Lifespan context managers manage startup resource initialization and graceful shutdown?",
      "What is the difference between polling `GET /runs/{id}` and streaming via Server-Sent Events?",
      "How does dependency injection in FastAPI simplify security authentication and database session lifecycle?",
      "What happens to in-flight `asyncio` background tasks when a FastAPI process receives a SIGTERM signal?"
    ],
    advancedTopics: [
      "Offloading background agent runs to distributed Celery / ARQ worker pools backed by Redis",
      "Dynamic webhook notifications: allowing clients to register a `callback_url` notified when an agent run finishes",
      "API rate limiting per API key using `slowapi` or Redis token buckets"
    ]
  },
  {
    day: 30,
    title: "Async execution and progress streaming",
    topic: "Async execution and progress streaming",
    topicGroup: "Production & Guardrails",
    week: 5,
    date: "December 4, 2026",
    isoDate: "2026-12-04",
    goal: "Implement real-time progress and token streaming for agent workflows using Server-Sent Events (SSE) and WebSockets, delivering low-latency intermediate updates to frontend clients.",
    prerequisites: [
      "Day 29 FastAPI service design and route handling",
      "Server-Sent Events (SSE) protocol vs WebSocket bidirectional communication",
      "Python async generators (`async def` with `yield`)"
    ],
    learningChecklist: [
      {
        category: "Real-Time Streaming Protocols",
        items: [
          "The UX imperative of streaming: why waiting 30 seconds for a blank screen causes high user bounce rates",
          "Server-Sent Events (SSE): HTTP-based, unidirectional (server -> client), automatic browser reconnection, lightweight text framing (`event: ...\\ndata: ...\\n\\n`)",
          "WebSockets: full-duplex bidirectional communication, higher connection overhead, necessary only when user must send continuous inputs during execution",
          "Why SSE is the industry standard for LLM generation and agent progress streams"
        ]
      },
      {
        category: "Event Streaming Architectures for Agents",
        items: [
          "Event Taxonomy: `run.started`, `agent.thinking`, `tool.called`, `tool.completed`, `token.delta`, `run.completed`, `run.failed`",
          "Streaming LLM token chunks (`token.delta`) vs Streaming graph superstep events (`node.start`, `node.finish`)",
          "Using LangGraph `app.astream_events(..., version='v2')` to capture fine-grained node transitions and token streams",
          "Event formatting: serialization to JSON and formatting as standard SSE text lines"
        ]
      },
      {
        category: "Connection Management & Resilience",
        items: [
          "Handling client disconnects: detecting when the browser closes the tab and cancelling the background agent coroutine to save tokens",
          "Heartbeat / Keep-Alive pings: sending periodic `: ping\\n\\n` comments every 15 seconds to prevent intermediate proxy timeouts",
          "Buffering and event IDs: supporting `Last-Event-ID` for resuming interrupted event streams"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-30/`",
      "Define streaming event models in `event_schemas.py` (`AgentEvent`, `EventType`, `EventPayload`)",
      "Build `stream_adapter.py` consuming LangGraph `astream_events()` and yielding structured SSE formatted strings",
      "Implement SSE endpoint in `api/stream_routes.py`: `GET /api/v1/runs/{run_id}/stream` returning `StreamingResponse(..., media_type='text/event-stream')`",
      "Add client disconnect detection: monitoring `request.is_disconnected()` inside the event generator loop and triggering cancellation",
      "Implement keep-alive heartbeat generator emitting `: ping\\n\\n` comments during long tool execution phases",
      "Build a lightweight test client in `test_client.py` using `httpx_sse` or JavaScript `EventSource` to print real-time streaming progress",
      "Write automated tests in `tests/test_streaming.py` asserting SSE framing, event sequence correctness, and disconnect cancellation",
      "Document event types, SSE payload schemas, and frontend integration code in `README.md`"
    ],
    failureCases: [
      "Client closes browser tab during run: Generator continues running in background, wasting $0.50 in tokens (disconnect detection must abort task immediately)",
      "Intermediate proxy drops idle connection: Cloudflare / Nginx terminates connection after 30s of silence while tool runs (heartbeat pings must keep socket alive)",
      "Malformed SSE framing: Missing double newline `\\n\\n` causes client `EventSource` to hang without firing onmessage (adapter must enforce strict SSE format)",
      "Unhandled serialization crash in stream: Tool returns raw bytes or non-serializable object (stream serializer must safely convert to string/JSON)",
      "High-frequency token flooding: LLM emits 100 tokens/sec overwhelming slow mobile clients (must support chunk batching when network buffers fill)"
    ],
    deliverables: {
      requiredFiles: [
        "event_schemas.py",
        "stream_adapter.py",
        "api/stream_routes.py",
        "test_client.py",
        "main.py",
        "tests/test_streaming.py",
        "README.md"
      ],
      description: "A production real-time streaming engine for agentic workflows using Server-Sent Events (SSE) with token streaming, superstep events, and client disconnect handling."
    },
    completionCriteria: [
      "`GET /runs/{id}/stream` cleanly streams real-time SSE events with `media_type='text/event-stream'`",
      "Frontend client receives structured lifecycle events (`agent.thinking`, `tool.called`, `token.delta`, `run.completed`) as they happen",
      "Closing the client connection immediately cancels the backend agent task, preventing token waste",
      "Keep-alive pings fire every 15s during long-running tool operations to maintain active proxy sockets",
      "Automated test suite passes verifying event framing and stream termination"
    ],
    activeRecallQuestions: [
      "Why is Server-Sent Events (SSE) generally preferred over WebSockets for AI agent progress streaming?",
      "What is the exact text framing required by the SSE protocol (`event`, `data`, double newline)?",
      "How does LangGraph's `astream_events(..., version='v2')` differentiate between intermediate tool calls and final token streams?",
      "Why must an SSE server detect client disconnects and cancel the underlying agent coroutine?",
      "What is the purpose of sending heartbeat ping comments (`: ping\\n\\n`) during long tool operations?"
    ],
    advancedTopics: [
      "Multiplexed WebSockets: bidirectional interaction allowing users to pause, steer, or inject new instructions mid-stream",
      "Resumable event streams: using Redis Pub/Sub and stream event offsets so reconnected clients catch up without missing messages",
      "End-to-end frontend integration: building an Angular / React streaming hook consuming agent SSE feeds"
    ]
  },
  {
    day: 31,
    title: "Persistence and resumable production runs",
    topic: "Persistence and resumable production runs",
    topicGroup: "Production & Guardrails",
    week: 5,
    date: "December 5, 2026",
    isoDate: "2026-12-05",
    goal: "Architect production persistence for agent workflows using PostgreSQL and MongoDB, storing user sessions, run checkpoints, and execution history to support server crash recovery and resumable runs.",
    prerequisites: [
      "Day 17 LangGraph checkpointers and Day 29 FastAPI service design",
      "Relational database modeling (PostgreSQL) vs Document stores (MongoDB)",
      "Distributed systems durability and process crash recovery"
    ],
    learningChecklist: [
      {
        category: "Enterprise State Persistence Patterns",
        items: [
          "The ephemeral process problem: if a server container restarts, all in-memory agents and active tasks are permanently lost",
          "Dual Storage Architecture: Relational metadata (Users, Tenants, Runs, Billing) in PostgreSQL; Flexible graph state & message logs in MongoDB or Postgres JSONB",
          "Production Checkpointers: configuring `AsyncPostgresSaver` in LangGraph with connection pooling (`asyncpg` / `psycopg3`)",
          "Session Isolation: partitioning checkpoints by `tenant_id`, `user_id`, and `thread_id`"
        ]
      },
      {
        category: "Crash Recovery & Resumption Mechanics",
        items: [
          "The Recovery Lifecycle: on server startup, query for runs in `status = 'running'` that were abruptly terminated by process death",
          "Reconciling interrupted runs: marking zombie runs as `interrupted` or automatically re-queuing them from the latest persistent checkpoint",
          "Idempotent task resumption: ensuring restarted runs do not re-execute already completed tools (relying on Day 26 idempotency keys)"
        ]
      },
      {
        category: "Audit & Run History Queries",
        items: [
          "Historical run inspection: retrieving past agent trajectories, tokens consumed, and execution timelines",
          "Pagination and filtering: querying runs by user ID, status, date range, and tag metadata",
          "Data retention policies: soft deletes and automated archiving of old run logs"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-31/` with Docker Compose for PostgreSQL 16 and MongoDB",
      "Design database schema in `schema.sql`: `tenants`, `users`, `agent_runs`, and `tool_executions`",
      "Implement `db/postgres.py` with async connection pool management and migration scripts",
      "Implement `db/mongo.py` for storing raw multi-turn message history and telemetry payloads",
      "Configure LangGraph `AsyncPostgresSaver` checkpointer in `core/graph_persistence.py`",
      "Build `services/run_manager.py` handling: `create_run()`, `update_run_status()`, `save_checkpoint()`, and `get_run_history()`",
      "Implement `services/recovery_service.py` executed during startup lifespan to identify and heal interrupted runs",
      "Write automated tests in `tests/test_persistence.py` simulating: 1) Normal run persistence, 2) Process crash simulation and state resumption from last checkpoint, 3) Historical run pagination",
      "Document database ER diagrams, migration instructions, and recovery workflows in `README.md`"
    ],
    failureCases: [
      "Database connection pool exhausted: High volume of concurrent agent runs exhausts Postgres connections (must configure pool limits and checkout timeouts)",
      "Process killed mid-step: Server kill -9 while agent is executing (recovery service must detect stale run on reboot and resume from last checkpoint)",
      "State schema migration mismatch: Checkpoint created with old State schema read by updated application code (must implement state schema versioning)",
      "Cross-tenant data leak: Query for run history fails to filter by `tenant_id` (must enforce tenant scoping at repository layer)",
      "Large checkpoint serialization bottleneck: State containing 10MB document causes slow checkpoint writes (must store large documents in S3/blob store and reference by ID)"
    ],
    deliverables: {
      requiredFiles: [
        "docker-compose.yml",
        "schema.sql",
        "db/postgres.py",
        "db/mongo.py",
        "core/graph_persistence.py",
        "services/run_manager.py",
        "services/recovery_service.py",
        "main.py",
        "tests/test_persistence.py",
        "README.md"
      ],
      description: "A production state persistence engine using PostgreSQL and MongoDB featuring async connection pooling, LangGraph PostgresSaver, and automated crash recovery."
    },
    completionCriteria: [
      "All agent runs, checkpoints, and tool executions are durably stored in PostgreSQL / MongoDB",
      "Killing the server process during an active run and restarting cleanly resumes the run from the last checkpoint without data loss",
      "Resumed runs do not duplicate already executed external actions",
      "Historical runs are queryable with pagination, filtering, and latency/token analytics",
      "Unit and integration tests pass 100% demonstrating crash resilience and multi-tenant isolation"
    ],
    activeRecallQuestions: [
      "Why is in-memory state storage unacceptable for enterprise agent deployments?",
      "How does `AsyncPostgresSaver` persist LangGraph supersteps inside a relational database?",
      "How does an automated recovery service detect and heal 'zombie runs' left behind by unexpected container crashes?",
      "Why should large documents or image files be stored in object storage (S3) rather than directly inside graph state checkpoints?",
      "What database indexing strategy is essential for querying agent run histories across millions of records?"
    ],
    advancedTopics: [
      "Distributed locking using Redis Redlock to prevent two worker nodes from resuming the same interrupted run simultaneously",
      "Multi-region database replication for disaster recovery of agent memory stores",
      "Event-driven architecture: publishing run lifecycle events to Apache Kafka / AWS SQS for enterprise data lake ingestion"
    ]
  },
  {
    day: 32,
    title: "Tracing and observability",
    topic: "Tracing and observability",
    topicGroup: "Production & Guardrails",
    week: 5,
    date: "December 6, 2026",
    isoDate: "2026-12-06",
    goal: "Instrument agentic systems with OpenTelemetry and dedicated LLM observability platforms (Langfuse, Arize Phoenix), capturing distributed traces, span attributes, latency waterfalls, token costs, and user feedback.",
    prerequisites: [
      "Distributed tracing concepts (traces, spans, parent-child relationships, span attributes)",
      "OpenTelemetry standards (OTel SDK, exporters)",
      "LLM observability tooling (Langfuse, Arize Phoenix, or LangSmith)"
    ],
    learningChecklist: [
      {
        category: "LLM Observability Primitives",
        items: [
          "The black-box problem: why standard APMs (Datadog, New Relic) fail to provide visibility into multi-step agent reasoning",
          "Hierarchical Tracing: Trace (entire user request) -> Span (LangGraph node) -> Generation Span (LLM call with prompts/completions) -> Tool Span (tool execution)",
          "Capturing OpenInference / OpenTelemetry attributes: `gen_ai.prompt`, `gen_ai.completion`, `gen_ai.usage.prompt_tokens`, `gen_ai.usage.completion_tokens`, `gen_ai.system`",
          "Tracking latency waterfalls: identifying exactly which tool call or model turn caused a 15-second latency spike"
        ]
      },
      {
        category: "Integrating Langfuse / OpenLLMetry",
        items: [
          "Self-hosting Langfuse with Docker Compose or connecting to managed Langfuse Cloud",
          "Initializing Langfuse SDK with `public_key` and `secret_key`",
          "Using decorators (`@observe()`) and LangChain/LangGraph native callbacks (`CallbackHandler`)",
          "Enriching traces with business context: `user_id`, `session_id`, `tags=['production', 'v2-prompt']`, and `metadata`",
          "Tracking real-time token spend and financial cost dashboards"
        ]
      },
      {
        category: "User Feedback & Quality Monitoring",
        items: [
          "Capturing human scores: logging user thumbs-up / thumbs-down ratings (`score=1` or `score=0`) linked directly to trace IDs",
          "Logging guardrail interception events as high-severity trace spans",
          "Setting up alerting: webhooks notifying Slack when error rate exceeds 5% or latency exceeds 20s"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-32/` with Docker Compose for local Langfuse / Phoenix instance",
      "Install `langfuse` and `openllmetry` / `opentelemetry-sdk`",
      "Build `telemetry/tracing.py` configuring tracer providers, resource attributes, and Langfuse callbacks",
      "Instrument LangGraph agent in `agent_instrumented.py` passing callback handlers into `app.ainvoke(..., config={'callbacks': [langfuse_handler]})`",
      "Instrument custom tools with manual span contexts: recording tool parameters, execution duration, and output size",
      "Build `api/feedback_routes.py`: `POST /api/v1/runs/{run_id}/feedback` logging user satisfaction scores directly into the corresponding Langfuse trace",
      "Build demonstration script `run_and_trace.py` executing 5 complex multi-step missions and generating visible trace trees in the dashboard",
      "Write automated tests in `tests/test_tracing.py` asserting spans are created with accurate token counts and metadata",
      "Document observability setup, dashboard screenshots, and trace taxonomy in `README.md`"
    ],
    failureCases: [
      "Tracing network overhead: Tracing service latency slows down agent execution (must use asynchronous background batch exporters)",
      "PII leakage into centralized traces: User credit card or password captured inside raw generation span (must configure telemetry redaction hooks)",
      "Tracing service outage: Langfuse server unreachable (telemetry client must fail-silently and never crash user agent runs)",
      "Missing parent span linkage: Tool execution logged as disconnected trace instead of nested under agent step (must propagate trace context)",
      "Over-instrumentation: Logging thousands of internal loop variables, exceeding telemetry payload quotas (must filter span attributes to high-signal metrics)"
    ],
    deliverables: {
      requiredFiles: [
        "docker-compose.yml",
        "telemetry/tracing.py",
        "agent_instrumented.py",
        "api/feedback_routes.py",
        "run_and_trace.py",
        "main.py",
        "tests/test_tracing.py",
        "README.md"
      ],
      description: "An enterprise observability framework instrumenting agents with OpenTelemetry and Langfuse for distributed tracing, latency analysis, cost tracking, and feedback capture."
    },
    completionCriteria: [
      "Local or cloud Langfuse instance receives full hierarchical traces for every agent execution",
      "Traces accurately display the full waterfall: User Prompt -> Supervisor -> Worker -> Tool Execution -> Generation -> Output",
      "Token usage and financial dollar costs are calculated accurately per span and aggregated per trace",
      "`POST /feedback` endpoint successfully attaches user ratings to specific trace IDs in the dashboard",
      "Telemetry failures do not impact agent execution availability"
    ],
    activeRecallQuestions: [
      "Why do traditional application monitoring tools (APMs) struggle to provide actionable visibility into agentic LLM workflows?",
      "What is the hierarchical relationship between a Trace, a Span, and a Generation in LLM observability?",
      "How do OTel semantic conventions standardize metadata fields like `prompt_tokens` across different model providers?",
      "Why must telemetry exporters operate asynchronously in background threads?",
      "How does linking end-user feedback (thumbs up/down) to trace IDs help engineering teams discover failing prompts?"
    ],
    advancedTopics: [
      "Automated evaluation inside Langfuse: running LLM-as-a-judge scorers asynchronously on 10% of production traces",
      "Exporting OpenTelemetry traces to enterprise backends (Datadog, Honeycomb, Jaeger)",
      "Cost anomaly detection: triggering PagerDuty alerts when an individual user's hourly spend exceeds normal variance by 300%"
    ]
  },
  {
    day: 33,
    title: "Docker and deployment readiness",
    topic: "Docker and deployment readiness",
    topicGroup: "Production & Guardrails",
    week: 5,
    date: "December 7, 2026",
    isoDate: "2026-12-07",
    goal: "Containerize the production agentic service using multi-stage Docker builds, non-root security profiles, comprehensive environment variable configuration, and Docker Compose orchestration.",
    prerequisites: [
      "Docker fundamentals (images, containers, Dockerfiles, caching layers)",
      "Linux container security (non-root users, filesystem permissions)",
      "Container networking and volume persistence"
    ],
    learningChecklist: [
      {
        category: "Production Containerization Best Practices",
        items: [
          "Why single-stage Dockerfiles create bloated (2GB+), insecure containers with unnecessary build toolchains",
          "Multi-stage Docker builds: Builder stage (compiling wheels, installing dependencies) -> Final runtime stage (lean, minimal attack surface)",
          "Base image selection: `python:3.11-slim` vs `alpine` (avoiding Alpine glibc compilation issues with PyTorch/NumPy)",
          "Layer caching optimization: copying `requirements.txt` and installing dependencies BEFORE copying application source code"
        ]
      },
      {
        category: "Container Security Hardening",
        items: [
          "Running as a dedicated non-root user (`appuser` with UID 10001) to prevent container breakout exploits",
          "Setting read-only root filesystems where applicable and configuring explicit writable volumes (`/tmp`, `/app/workspace`)",
          "Stripping dangerous binaries and compilers from the final runtime image",
          "Using `.dockerignore` to prevent leaking `.env`, Git history, test files, and local virtual environments into the image"
        ]
      },
      {
        category: "Orchestration & Health Checks",
        items: [
          "Docker Compose orchestration: assembling `app`, `postgres`, `redis`, and `langfuse` into a unified network",
          "Container Health Checks: implementing `HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:8000/health || exit 1`",
          "Graceful shutdown handling: ensuring `gunicorn` / `uvicorn` intercepts SIGTERM and drains in-flight requests"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-33/`",
      "Write optimized `.dockerignore` excluding `.venv`, `.git`, `.env`, and caches",
      "Create multi-stage `Dockerfile`: Stage 1 `builder` installs packages into a virtualenv; Stage 2 `runner` copies virtualenv to clean `python:3.11-slim`",
      "Configure non-root user `appuser` and set proper directory permissions on `/app` in `Dockerfile`",
      "Add container healthcheck endpoint in `api/health.py`: `GET /health` verifying database connectivity and model API availability",
      "Write comprehensive `docker-compose.yml` linking: `agent-api`, `postgres` (with pgvector), and `redis`",
      "Create `.env.docker.example` documenting all required container environment variables",
      "Build and test image locally: `docker build -t agentic-ai:latest .` and verify image size is < 400MB",
      "Write container verification script in `tests/test_container.py` testing container startup, health checks, and API endpoints",
      "Document container build commands, run instructions, and production deployment flags in `README.md`"
    ],
    failureCases: [
      "Root container vulnerability: Container compromised by exploit runs with host root privileges (must enforce `USER appuser`)",
      "Secret baked into image: API key inadvertently copied into image layer during `docker build` (must inject keys via runtime environment variables only)",
      "Startup crash due to missing dependency: Native C library missing in slim image (builder stage must capture all compiled wheels)",
      "Container fails healthcheck: Database takes 10s to boot while app starts immediately (Compose must use `depends_on` with `condition: service_healthy`)",
      "Zombie process accumulation: Container does not properly reap child processes (must use `tini` or Docker `--init` init system)"
    ],
    deliverables: {
      requiredFiles: [
        "Dockerfile",
        ".dockerignore",
        "docker-compose.yml",
        ".env.docker.example",
        "api/health.py",
        "main.py",
        "tests/test_container.py",
        "README.md"
      ],
      description: "A production-grade, hardened Docker container and Compose stack for the agentic API featuring multi-stage builds, non-root execution, and health monitoring."
    },
    completionCriteria: [
      "Docker image builds cleanly using multi-stage caching with final image size optimized under 450MB",
      "Container runs under an unprivileged non-root user (`appuser`)",
      "`docker-compose up` boots all services (`agent-api`, `postgres`, `redis`) and all reach a healthy state",
      "`/health` endpoint correctly validates service health and responds with 200 OK",
      "No secrets, `.env` files, or git metadata exist within the exported Docker image layers"
    ],
    activeRecallQuestions: [
      "Why are multi-stage Docker builds critical for both security and performance in Python microservices?",
      "Why must production containers NEVER execute processes as the default `root` user?",
      "How does Docker layer caching work with `requirements.txt` and how does ordering statements affect build speeds?",
      "What is the role of a container healthcheck in Kubernetes or Docker Compose orchestration?",
      "Why should secrets and API keys never be passed as Docker `ARG` build arguments?"
    ],
    advancedTopics: [
      "Kubernetes deployment manifests: creating Deployments, Services, ConfigMaps, and Secrets for horizontal agent scaling",
      "Container vulnerability scanning with Trivy / Snyk in CI pipelines",
      "Distroless images: running Python applications without any shell or package manager for maximum security"
    ]
  },
  {
    day: 34,
    title: "Production evaluation, load, and cost review",
    topic: "Production evaluation, load, and cost review",
    topicGroup: "Production & Guardrails",
    week: 5,
    date: "December 8, 2026",
    isoDate: "2026-12-08",
    goal: "Conduct production load testing and financial modeling for the agentic API, benchmarking concurrency limits, p50/p95/p99 latency distributions, and cost per 1,000 requests.",
    prerequisites: [
      "Days 29–33 FastAPI service, persistence, observability, and Docker stack",
      "Performance engineering fundamentals (throughput, latency percentiles, saturation, queuing)",
      "Load testing tools (Locust, k6, or vegeta)"
    ],
    learningChecklist: [
      {
        category: "Agent Performance Engineering",
        items: [
          "The Anatomy of Agent Latency: Network latency (10%) + Provider time-to-first-token (25%) + Generation token velocity (40%) + Tool execution time (25%)",
          "Understanding Latency Percentiles: Why average latency hides catastrophic outliers; measuring p50, p90, p95, and p99",
          "Concurrency Saturation: identifying the bottleneck (FastAPI event loop, database connection pool, provider rate limits, memory)",
          "Rate Limit Tuning: configuring client-side request queues to operate at exactly 90% of provider Tier limits (e.g. 500 RPM)"
        ]
      },
      {
        category: "Load Testing with Locust / k6",
        items: [
          "Writing load test scenarios: User submits complex mission -> polls status -> streams events -> submits feedback",
          "Simulating realistic user behavior: ramp-up periods, think times, and concurrency tiers (5, 25, 50, 100 concurrent agents)",
          "Measuring system breaking points: identifying when error rate crosses 1% or latency degrades exponentially",
          "Resource monitoring during load: tracking container CPU, RAM, and database active connection metrics"
        ]
      },
      {
        category: "Financial Modeling & Unit Economics",
        items: [
          "Calculating Cost per Task: input tokens * input_rate + output tokens * output_rate + external tool fees (web search API)",
          "Designing tiered pricing models: estimating infrastructure and model API margins",
          "Cost Optimization levers: prompt compression, model tier routing (fast models for simple tasks), caching frequent queries"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-34/`",
      "Build `load_testing/locustfile.py` implementing realistic multi-step agent user journeys (Submit -> Stream -> Complete)",
      "Build `load_testing/run_benchmarks.sh` running 3 distinct load tests: Baseline (5 users), Stress (25 users), and Spike (50 users)",
      "Build `cost_analyzer.py` parsing load test execution logs to calculate total token spend, average cost per completed task, and cost per 1,000 requests",
      "Generate performance graphs and percentile latency charts (p50, p95, p99) in `reports/load_test_results.json`",
      "Build `sla_verifier.py` asserting production SLA criteria: p95 latency < 15s, Error rate < 1.0%, Task completion rate > 95%",
      "Write automated benchmark gate in `tests/test_performance_sla.py`",
      "Document performance benchmark results, capacity planning models, and cost optimization recommendations in `README.md`"
    ],
    failureCases: [
      "Provider rate limit exhaustion during peak load: Provider returns 429 to 40% of requests (must implement client-side queue throttling)",
      "Database connection starvation: 50 concurrent agents exhaust Postgres pool of 20 connections (must tune pool sizing and query checkout times)",
      "Memory leak under sustained traffic: Agent state objects retained in memory causing container OOM restart after 1 hour (must profile memory with `tracemalloc`)",
      "Tail latency explosion: 1 out of 50 requests takes 120 seconds due to infinite retry loops (global request timeout must enforce hard cap)",
      "Runaway cost spike: Unoptimized test suite drains $50 in 10 minutes (hard budget limiter must abort test at $5 spend threshold)"
    ],
    deliverables: {
      requiredFiles: [
        "load_testing/locustfile.py",
        "load_testing/run_benchmarks.sh",
        "cost_analyzer.py",
        "sla_verifier.py",
        "reports/load_test_results.json",
        "tests/test_performance_sla.py",
        "README.md"
      ],
      description: "A complete production performance benchmarking and cost analysis suite with Locust load scripts, latency percentile analysis, and financial unit economics modeling."
    },
    completionCriteria: [
      "Load test executes successfully against the containerized agent service with 25 concurrent users",
      "p50, p90, p95, and p99 latency percentiles are accurately measured and recorded",
      "Cost analyzer calculates exact financial spend down to fractions of a cent per task",
      "System maintains < 1% error rate under configured baseline load",
      "Comprehensive performance and unit economics report included in documentation"
    ],
    activeRecallQuestions: [
      "Why is reporting p95 and p99 latency far more critical than reporting average latency in agentic systems?",
      "What is the difference between system throughput (RPS) and concurrency (simultaneous active users) in long-running agent workflows?",
      "How do client-side rate limiters prevent distributed agents from tripping provider 429 HTTP errors?",
      "What are the three largest cost components in an enterprise agentic AI microservice?",
      "How does prompt caching (e.g. Gemini / Anthropic prompt caching) dramatically reduce operational costs for repetitive agent loops?"
    ],
    advancedTopics: [
      "Dynamic model routing with semantic routers to send 70% of low-complexity requests to 10x cheaper lightweight models",
      "Autoscaling agent worker pods based on queue depth metrics in Kubernetes (KEDA)",
      "Prompt caching strategies: structuring prompt prefixes to maximize 90% discount on cached input tokens"
    ]
  },
  {
    day: 35,
    title: "Final capstone review and demo",
    topic: "Final capstone review and demo",
    topicGroup: "Production & Guardrails",
    week: 5,
    date: "December 9, 2026",
    isoDate: "2026-12-09",
    goal: "Ship Milestone Project 5 (Final Capstone): Deploy the complete Enterprise Autonomous Research & Operations Agent Platform featuring fullstack FastAPI, LangGraph multi-agent orchestration, pgvector RAG, MCP tools, guardrails, persistent runs, OpenTelemetry tracing, and Docker Compose deployment.",
    prerequisites: [
      "Mastery of all 34 preceding daily engineering topics",
      "Fullstack architectural synthesis and containerized deployment",
      "Technical communication, demo recording, and portfolio presentation skills"
    ],
    learningChecklist: [
      {
        category: "Capstone System Architecture Synthesis",
        items: [
          "The Grand Synthesis: integrating every architectural component built over the 35-day journey into a single unified platform",
          "Layer 1: FastAPI Gateway with Async 202 Job Queues & Real-Time SSE Progress Streaming",
          "Layer 2: Dual-Layer Guardrails (PII scrubbing, prompt injection shields, schema auto-repair)",
          "Layer 3: LangGraph Orchestration with Supervisor & Specialist Worker Agents",
          "Layer 4: Agentic RAG with pgvector HNSW indexing, Cross-Encoder Reranking, and CRAG self-correction",
          "Layer 5: Tool Execution via Model Context Protocol (MCP) and Sandboxed Local Workers",
          "Layer 6: Operational Reliability with Budgets, Timeouts, Idempotency, and Cryptographic Audit Chains",
          "Layer 7: Persistent Durability with PostgreSQL Checkpointers and Crash Recovery",
          "Layer 8: Observability with OpenTelemetry and Langfuse Tracing"
        ]
      },
      {
        category: "Production Verification & Capstone Demonstration",
        items: [
          "End-to-End Verification: executing 5 diverse, enterprise-grade research and operations scenarios",
          "Scenario 1: Financial market analysis and automated data charting with sandboxed code execution",
          "Scenario 2: Technical document QA with grounded citations and zero hallucinations",
          "Scenario 3: Adversarial attack attempt cleanly neutralized by dual-layer guardrails",
          "Scenario 4: High-impact database mutation triggering Human-in-the-Loop review and approval",
          "Scenario 5: Server process crash simulated and resumed seamlessly from persistent checkpoint"
        ]
      },
      {
        category: "Portfolio Presentation & Engineering Review",
        items: [
          "Structuring the final portfolio repository for technical hiring managers and senior architects",
          "Recording an end-to-end video walkthrough demonstrating the live system, SSE streaming UI, and Langfuse tracing waterfalls",
          "Drafting an executive architecture whitepaper and design rationale"
        ]
      }
    ],
    implementationChecklist: [
      "Assemble final capstone repository `capstone-enterprise-agent/`",
      "Integrate all modular packages: `api/`, `guardrails/`, `orchestration/`, `rag/`, `mcp/`, `resilience/`, `storage/`, and `telemetry/`",
      "Verify unified `docker-compose.yml` launches: `agent-api`, `postgres-pgvector`, `redis`, and `langfuse` with a single command",
      "Deploy interactive frontend demo client (Web UI / CLI) demonstrating real-time SSE progress streaming and Markdown report rendering",
      "Execute the complete automated test suite across all 5 milestone domains with 100% pass rate",
      "Run the full evaluation and chaos suite, saving the definitive verification report in `reports/capstone_audit_report.json`",
      "Record a comprehensive 5-minute video demonstration showcasing live agent execution, streaming, Langfuse trace inspection, and HITL approval",
      "Author an exhaustive, publication-quality `README.md` containing architectural flowcharts, technology stack matrices, setup instructions, and design trade-off deep dives",
      "Publish the complete codebase to GitHub with clean commit history, tagging release `v1.0.0`",
      "Perform final retrospective and celebrate graduation from Zero to Production Agentic AI Engineer!"
    ],
    failureCases: [
      "Any unhandled exception across the full stack: System must maintain 100% graceful degradation",
      "Security regression: Any prompt injection or path traversal bypassing guardrails (must be 100% blocked)",
      "Data loss on container restart: State lost when container stops (Postgres volumes must preserve all data)",
      "Observability disconnect: Spans failing to reach Langfuse (must log clear diagnostic warning without crashing)",
      "Unreproducible build: Another developer unable to boot system via Docker (must verify clean clone on fresh machine)"
    ],
    deliverables: {
      requiredFiles: [
        "Dockerfile",
        "docker-compose.yml",
        "api/main.py",
        "orchestration/graph.py",
        "guardrails/guardrails.py",
        "rag/crag_engine.py",
        "mcp/mcp_hub.py",
        "resilience/reliability.py",
        "telemetry/tracing.py",
        "tests/test_capstone_e2e.py",
        "reports/capstone_audit_report.json",
        "README.md"
      ],
      description: "Milestone Project 5 (Final Capstone): A complete, production-grade Enterprise Autonomous Agent Platform featuring FastAPI, LangGraph, pgvector RAG, MCP tools, guardrails, persistent runs, OpenTelemetry tracing, and Docker deployment."
    },
    completionCriteria: [
      "Complete platform builds and boots with `docker-compose up` with zero errors",
      "Agent autonomously executes complex research, coding, and data synthesis missions",
      "Real-time progress and token streaming stream cleanly to clients via Server-Sent Events",
      "Human-in-the-Loop approval cleanly intercepts high-risk operations and resumes seamlessly",
      "Traces for all runs are captured in Langfuse with complete latency waterfalls and token analytics",
      "All end-to-end integration and chaos tests pass with 100% success rate",
      "Comprehensive README, architecture diagrams, and video walkthrough completed and published to GitHub"
    ],
    activeRecallQuestions: [
      "How do the 8 architectural layers of an enterprise agentic system interact to provide security, reliability, and low latency?",
      "What are the most critical differences between a toy prototype agent built in a Jupyter notebook and a production agent microservice?",
      "How does the combination of LangGraph state graphs and the Model Context Protocol (MCP) enable future-proof AI applications?",
      "Why is automated continuous evaluation and tracing essential for operating LLM agents in production environments?",
      "What are your top three architectural principles for designing safe, deterministic, and cost-effective autonomous AI agents?"
    ],
    advancedTopics: [
      "Production deployment to AWS ECS / EKS or Google Cloud Run with automated Terraform infrastructure-as-code",
      "Fine-tuning open-source models (Llama 3 / Mistral) on domain-specific tool-calling trajectories using LoRA / QLoRA",
      "Designing multi-tenant enterprise architectures with strict tenant data isolation and custom fine-grained permission models"
    ]
  }
];

