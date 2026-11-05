// Week 3: State Graphs, MCP, and Multi-Agent Orchestration (Days 15–21)
module.exports = [
  {
    day: 15,
    title: "LangGraph state, nodes, and edges",
    topic: "LangGraph state, nodes, and edges",
    topicGroup: "LangGraph & Workflows",
    week: 3,
    date: "November 19, 2026",
    isoDate: "2026-11-19",
    goal: "Model agentic workflows as explicit directed computation graphs using LangGraph, defining shared state schemas, pure node functions, deterministic edges, and compiling executable graphs.",
    prerequisites: [
      "Week 1 agent loops and tool calling mechanisms",
      "Python type annotations (`TypedDict`, `Annotated`, Pydantic models)",
      "Graph theory fundamentals (directed graphs, nodes, edges, cycles, DAGs)"
    ],
    learningChecklist: [
      {
        category: "Graph-Based Agent Architectures",
        items: [
          "Why monolithic while-loops break down in complex, non-linear, multi-step agent applications",
          "The core primitives of LangGraph: `StateGraph`, Nodes, Edges, and Compilers",
          "Shared State: defining application state as a single typed dictionary or Pydantic model accessible across all nodes",
          "State Reducers: using `Annotated[list, add_messages]` or custom reducer functions to control how node returns are merged into state",
          "Pure Node functions: `node(state: State) -> dict`: functions that receive state and return incremental updates"
        ]
      },
      {
        category: "Graph Construction & Execution",
        items: [
          "Instantiating `StateGraph(StateSchema)`",
          "Adding computation nodes: `workflow.add_node('node_name', func)`",
          "Adding static edges: `workflow.add_edge('node_a', 'node_b')`",
          "Setting entry point (`START`) and finish point (`END`)",
          "Compiling the graph: `app = workflow.compile()`",
          "Graph invocation: `app.invoke(initial_state)` and streaming events: `app.stream()`",
          "Visualizing graphs: exporting Mermaid syntax or rendering Ascii/PNG diagrams via `app.get_graph().draw_ascii()`"
        ]
      },
      {
        category: "State Management Best Practices",
        items: [
          "Immutability in nodes: avoiding mutating incoming state dictionaries directly in-place",
          "Partial updates: nodes only return the specific fields they modify",
          "Handling error states: passing structured error signals through state rather than unhandled Python exceptions"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-15/` and install `langgraph`, `langchain-core`, and provider SDK",
      "Define `state.py` containing `AgentState` using `TypedDict` and `Annotated[list[BaseMessage], add_messages]`",
      "Implement nodes in `nodes.py`: `generate_plan(state)`, `execute_research(state)`, and `synthesize_summary(state)`",
      "Build `workflow.py` assembling the 3-step sequential linear graph connecting `START -> plan -> research -> synthesize -> END`",
      "Compile the graph and render its Mermaid diagram representation to `architecture.md`",
      "Implement `runner.py` invoking the graph with sample inputs and printing intermediate state transitions",
      "Implement streaming execution using `for event in app.stream(initial_input):` to display node progress in real time",
      "Write unit tests in `tests/test_graph.py` verifying state accumulation and valid reducer behavior",
      "Document setup instructions and state lifecycle in `README.md`"
    ],
    failureCases: [
      "State schema mutation bug: Node directly mutates `state['messages'].append(...)` instead of returning `{ 'messages': [...] }` (must enforce reducer pattern)",
      "Missing entry point: Compiling graph without setting entry point or START edge (LangGraph compiler raises GraphValidationError)",
      "Unregistered node edge: Adding an edge targeting a node name not registered in `add_node` (must validate node registry)",
      "Reducer crash on none: Node returns `None` instead of dictionary, causing reducer unpacking error (must return empty dict `{}` on no-op)",
      "Invalid return field: Node returns key not defined in State schema (schema must catch extraneous keys in strict mode)"
    ],
    deliverables: {
      requiredFiles: [
        "state.py",
        "nodes.py",
        "workflow.py",
        "runner.py",
        "architecture.md",
        "tests/test_graph.py",
        "README.md"
      ],
      description: "A foundational LangGraph workflow implementing structured state, message reducers, multi-node execution, and real-time streaming."
    },
    completionCriteria: [
      "Graph compiles cleanly with zero validation errors",
      "`add_messages` reducer accurately appends new turns to message history without overwriting earlier turns",
      "State transitions cleanly through START -> plan -> research -> synthesize -> END",
      "Streaming execution displays each node's output as it executes",
      "Generated Mermaid diagram accurately reflects the graph topology in documentation"
    ],
    activeRecallQuestions: [
      "Why does LangGraph use State Reducers (such as `add_messages`) rather than simply overwriting state variables?",
      "What is the mathematical difference between a DAG (Directed Acyclic Graph) and a cyclic StateGraph?",
      "Why must node functions in LangGraph remain pure and return only the dictionary of modified state keys?",
      "How does streaming execution (`app.stream()`) in LangGraph improve frontend user experience compared to `app.invoke()`?",
      "What prevents two parallel nodes from clobbering each other's state updates when using typed reducers?"
    ],
    advancedTopics: [
      "Parallel node execution: using fan-out edges to run multiple research nodes concurrently and fan-in reducers to merge findings",
      "Custom reducer functions: writing custom arithmetic or set-union state reducers for complex metadata",
      "Dynamic state schema switching based on user authentication level"
    ]
  },
  {
    day: 16,
    title: "Conditional edges and cyclic workflows",
    topic: "Conditional edges and cyclic workflows",
    topicGroup: "LangGraph & Workflows",
    week: 3,
    date: "November 20, 2026",
    isoDate: "2026-11-20",
    goal: "Build cyclic agent workflows with dynamic conditional branching, router nodes, tool execution loops, and hard recursion bounds using LangGraph.",
    prerequisites: [
      "Day 15 LangGraph state, nodes, and static edges",
      "Day 3 & 4 tool calling schemas and execution loops",
      "Finite state machines and termination condition theory"
    ],
    learningChecklist: [
      {
        category: "Conditional Routing Mechanics",
        items: [
          "Conditional edges: `workflow.add_conditional_edges(source_node, router_func, path_map)`",
          "Router functions: inspect current state and return target node string (e.g. `'call_tool'` vs `'end'` vs `'ask_user'`)",
          "Path mapping: explicitly mapping router return strings to node names or `END`",
          "Designing the classic Agent-Tool Loop: `agent -> (conditional: has tool calls?) -> [True -> tools_node -> agent] OR [False -> END]`"
        ]
      },
      {
        category: "Cyclic Workflows & Safety Limits",
        items: [
          "Cycles in agent graphs: iterating between reasoning, action, and reflection",
          "The danger of infinite loops: model repeatedly calling defective tools or failing to produce termination tokens",
          "LangGraph recursion limits: configuring `recursion_limit` (e.g. `config={'recursion_limit': 15}`) to prevent infinite execution traps",
          "Catching `GraphRecursionError` and executing graceful emergency fallbacks"
        ]
      },
      {
        category: "Prebuilt ToolNodes & Custom Tool Wrappers",
        items: [
          "Using LangGraph prebuilt `ToolNode` vs writing custom tool execution nodes",
          "Parallel tool dispatch inside a single tool node invocation",
          "Wrapping tool execution in defensive try-except blocks that return error strings as `ToolMessage` payloads rather than crashing graph execution"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-16/`",
      "Define `state.py` with `MessagesState` containing conversational messages and loop counters",
      "Define 3 safe tools in `tools.py` (e.g. `calculate`, `search_knowledge_base`, `check_weather`)",
      "Build `nodes.py`: `call_model` (invoking model with tool bindings) and `execute_tools` (executing requested tool calls)",
      "Build `router.py` implementing `should_continue(state)` routing to `'tools'` if model emitted tool calls, else `'__end__'`",
      "Assemble cyclic graph in `graph.py` with conditional edge connecting `call_model -> should_continue -> tools -> call_model`",
      "Configure invocation runner with strict `recursion_limit=10` and wrap in try-catch handling `GraphRecursionError`",
      "Write test cases in `tests/test_cycles.py` verifying: single-turn answers, 3-step tool loop resolution, and recursion limit triggering",
      "Document state flow diagram and cycle termination proofs in `README.md`"
    ],
    failureCases: [
      "Infinite tool calling loop: Model gets stuck calling the same tool with identical inputs (must detect repetition or hit recursion limit)",
      "Unmapped router output: Router function returns a string not present in the conditional edge path map (must raise explicit configuration error)",
      "Uncaught tool exception inside graph: Tool raises `ZeroDivisionError` crashing the entire graph (must catch inside tool node and return error message)",
      "Missing ToolMessage response: Graph routes back to model without returning tool role messages matching `tool_call_id` (provider API rejects call)",
      "Recursion limit reached unhandled: Graph raises `GraphRecursionError` without producing a partial answer for the user"
    ],
    deliverables: {
      requiredFiles: [
        "state.py",
        "tools.py",
        "nodes.py",
        "router.py",
        "graph.py",
        "main.py",
        "tests/test_cycles.py",
        "README.md"
      ],
      description: "A cyclic LangGraph ReAct agent featuring dynamic conditional edge routing, tool execution nodes, and bounded recursion safety."
    },
    completionCriteria: [
      "Agent autonomously decides whether to call tools or terminate based on user prompts",
      "Cyclic transitions (`call_model -> tools -> call_model`) execute cleanly across multiple tool turns",
      "Graph terminates immediately at `END` when no further tool calls are requested",
      "`GraphRecursionError` is handled gracefully when recursion limit is exceeded, returning a safe failure summary",
      "Mermaid diagram clearly illustrates the cyclic loop and conditional branch conditions"
    ],
    activeRecallQuestions: [
      "How do conditional edges differ from standard static edges in LangGraph?",
      "What is the function of the path map dictionary in `add_conditional_edges`?",
      "What happens when a LangGraph run exceeds the configured `recursion_limit` parameter?",
      "Why must tool execution exceptions be wrapped and returned as `ToolMessage` instances rather than raised as Python exceptions?",
      "How can an agent cycle be designed to detect and break semantic loops where the model repeats identical tool parameters?"
    ],
    advancedTopics: [
      "Loop detection heuristics: tracking MD5 hashes of tool call arguments in state to detect and abort infinite loops early",
      "Dynamic prompt adjustments across cycles: injecting reminder prompts when loop iteration count exceeds 5",
      "Multi-conditional branching: routing to 4+ specialized downstream branches (Tool, Ask Clarification, Self-Reflect, Finalize)"
    ]
  },
  {
    day: 17,
    title: "Checkpointing and persistent graph state",
    topic: "Checkpointing and persistent graph state",
    topicGroup: "LangGraph & Workflows",
    week: 3,
    date: "November 21, 2026",
    isoDate: "2026-11-21",
    goal: "Implement state persistence and session isolation in LangGraph using checkpointers (SqliteSaver, PostgresSaver), enabling multi-turn conversations, state replay, and time-travel debugging.",
    prerequisites: [
      "Day 16 cyclic graphs and conditional routing",
      "SQL database storage and transaction isolation",
      "Thread identification and session management concepts"
    ],
    learningChecklist: [
      {
        category: "LangGraph Checkpointing Architecture",
        items: [
          "What a Checkpointer is: an interface that automatically writes state snapshots after every graph superstep",
          "Checkpointer implementations: `MemorySaver` (in-memory, ephemeral), `SqliteSaver` (embedded local persistence), `PostgresSaver` (enterprise production persistence)",
          "Thread IDs: configuring `config = {'configurable': {'thread_id': 'session-123'}}` to isolate independent user sessions",
          "Supersteps and checkpoint IDs: monotonic versioning of graph states at every execution boundary"
        ]
      },
      {
        category: "State Inspection & Time-Travel Debugging",
        items: [
          "Inspecting current state: `app.get_state(config)` returning current values, next pending nodes, and checkpoint metadata",
          "Browsing state history: `app.get_state_history(config)` iterating through every previous state snapshot",
          "Time travel / Replay: rewinding an agent to checkpoint N and re-running execution along a new trajectory",
          "Forking execution paths from historical checkpoints for comparative evaluation"
        ]
      },
      {
        category: "Production State Considerations",
        items: [
          "Data privacy and TTL: purging old thread checkpoints to satisfy GDPR / compliance policies",
          "Handling schema migrations in persistent checkpointers when State definition evolves",
          "Connection pooling and database indexes on checkpoint tables"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-17/`",
      "Install `langgraph-checkpoint-sqlite` and `langgraph-checkpoint-postgres`",
      "Define state schema and agent nodes in `graph_definition.py`",
      "Implement `checkpoint_manager.py` setting up `SqliteSaver.from_conn_string('checkpoints.db')`",
      "Compile the graph with checkpointer: `app = workflow.compile(checkpointer=checkpointer)`",
      "Build `session_runner.py` allowing interactive CLI chat where user conversations resume seamlessly across separate terminal runs using `--thread-id`",
      "Build `time_travel.py` CLI utility demonstrating: 1) Listing past checkpoints, 2) Inspecting state at checkpoint X, 3) Rewinding and branching execution",
      "Write unit tests in `tests/test_checkpointing.py` verifying state persists across process restarts and distinct thread IDs remain strictly isolated",
      "Document checkpoint schema, database tables, and time-travel commands in `README.md`"
    ],
    failureCases: [
      "Missing thread ID: Invoking a checkpointed graph without passing `thread_id` in config (LangGraph raises ValueError)",
      "Cross-thread state leakage: Thread B accidentally reads or overwrites state belonging to Thread A (must verify strict thread partitioning)",
      "Database lock contention: SQLite database locked under concurrent agent threads (must configure WAL mode or switch to Postgres)",
      "Unserializable state object: Node places unpicklable object (e.g. open socket or raw file handle) into state (checkpointer serialization fails)",
      "Corrupt checkpoint database: Database file gets corrupted during unexpected crash (must implement recovery / safe recreate mode)"
    ],
    deliverables: {
      requiredFiles: [
        "graph_definition.py",
        "checkpoint_manager.py",
        "session_runner.py",
        "time_travel.py",
        "main.py",
        "tests/test_checkpointing.py",
        "README.md"
      ],
      description: "A persistent LangGraph application using SqliteSaver checkpointers supporting thread-isolated multi-turn sessions and time-travel replay."
    },
    completionCriteria: [
      "State snapshots are written to SQLite database after every node execution",
      "Starting the CLI with an existing `thread_id` instantly recalls full conversation history without in-memory state",
      "Different `thread_id` values maintain completely separate, unpolluted conversation threads",
      "`time_travel.py` successfully rewinds state to a historical checkpoint and branches into a new valid outcome",
      "Unit tests pass 100% asserting persistence, isolation, and rewind capabilities"
    ],
    activeRecallQuestions: [
      "What is the function of a Checkpointer in LangGraph and at what point in execution does it fire?",
      "Why is `thread_id` required in the configuration dictionary when compiling a graph with a checkpointer?",
      "How does LangGraph's state history enable 'time travel' and what are the debugging benefits?",
      "What data types can safely be stored in a checkpointed LangGraph state, and what types cause serialization crashes?",
      "How does `PostgresSaver` differ from `SqliteSaver` in terms of concurrency and production scalability?"
    ],
    advancedTopics: [
      "PostgresSaver setup with async connection pooling (`AsyncPostgresSaver`) for microservices",
      "State diffing: computing visual diffs between adjacent checkpoints to pinpoint exact node mutations",
      "Automated checkpoint pruning: implementing cron cleanup for threads inactive for > 30 days"
    ]
  },
  {
    day: 18,
    title: "Interrupts and human approval",
    topic: "Interrupts and human approval",
    topicGroup: "LangGraph & Workflows",
    week: 3,
    date: "November 22, 2026",
    isoDate: "2026-11-22",
    goal: "Implement Human-in-the-Loop (HITL) workflows in LangGraph using interrupts and state updates, pausing autonomous execution before critical actions to seek human review, approval, or parameter edits.",
    prerequisites: [
      "Day 17 checkpointers and persistent graph state",
      "Authorization and principle of least privilege",
      "Asynchronous webhook and CLI interaction patterns"
    ],
    learningChecklist: [
      {
        category: "Human-in-the-Loop (HITL) Concepts",
        items: [
          "Why fully autonomous agents are dangerous in production when executing irreversible actions (payments, database drops, sending public emails)",
          "Read-only autonomy vs Action-level authorization",
          "Static interrupts: `interrupt_before=['sensitive_node']` and `interrupt_after=['draft_node']` during graph compilation",
          "Dynamic interrupts: calling `interrupt({'action': 'confirm_transfer', 'amount': 500})` inside node logic to pause execution dynamically based on runtime risk thresholds"
        ]
      },
      {
        category: "Resumption & State Updates",
        items: [
          "How LangGraph suspends execution: graph execution halts, state is saved to checkpointer, and `app.invoke()` returns control",
          "Inspecting pending nodes: `state.next` indicates which node is blocked waiting for human approval",
          "Updating state before resumption: `app.update_state(config, {'approved': True, 'feedback': 'Reduce amount to 250'})`",
          "Resuming execution: invoking graph with `app.invoke(None, config)` to continue from the exact point of interruption",
          "Rejecting or aborting blocked runs: routing to an abort node or clearing pending steps"
        ]
      },
      {
        category: "Approval Interface Design",
        items: [
          "Structuring the Human Review Payload: action name, target resource, proposed parameters, estimated cost, and risk score",
          "Designing CLI review dialogues vs Webhook / API approval triggers",
          "Audit logging: recording who approved the action, timestamp, and modified parameters"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-18/` with persistent checkpointer",
      "Define `state.py` containing `ApprovalState` with fields: `action_proposal`, `is_approved`, `human_feedback`, and `execution_result`",
      "Implement tools in `tools.py` with tiered risk levels: Safe (read data) vs Dangerous (execute bank transfer / delete file)",
      "Build `nodes.py`: `propose_action`, `sensitive_action_node`, and `rejected_action_node`",
      "Configure dynamic interrupt using `interrupt()` inside `propose_action` when action risk is classified as HIGH",
      "Build `hitl_manager.py` providing methods: `trigger_workflow()`, `check_pending_approvals()`, `submit_approval(approved=True/False, edits=...)`",
      "Build interactive CLI in `cli_approver.py` that pauses when a high-risk action is proposed, displays formatted review card, and waits for user input `[Y/N/Edit]`",
      "Write automated tests in `tests/test_hitl.py` verifying: 1) Safe actions run without pause, 2) Dangerous actions trigger interrupt, 3) Resuming with approval executes successfully, 4) Resuming with rejection aborts cleanly",
      "Document HITL lifecycle diagrams and resumption sequences in `README.md`"
    ],
    failureCases: [
      "Interrupt without checkpointer: Compiling graph with interrupts but forgetting checkpointer (LangGraph raises ValueError; checkpointer is mandatory for HITL)",
      "Hanging resumption: Attempting to resume graph by passing new inputs instead of `None` (must pass `None` to continue existing thread execution)",
      "Parameter tampering bypass: Human edits parameters to values that fail Pydantic validation (must re-validate updated state before proceeding)",
      "Zombie interrupted runs: An interrupted workflow remains frozen indefinitely because user never responded (must support timeout expiration / auto-rejection)",
      "Unauthorized approval: Approval submitted without verifying user identity/token (must enforce approver role check)"
    ],
    deliverables: {
      requiredFiles: [
        "state.py",
        "tools.py",
        "nodes.py",
        "graph.py",
        "hitl_manager.py",
        "cli_approver.py",
        "main.py",
        "tests/test_hitl.py",
        "README.md"
      ],
      description: "A production Human-in-the-Loop workflow with dynamic interrupts, parameter editing, state updates, and secure resumption."
    },
    completionCriteria: [
      "Dangerous tool calls trigger an immediate graph execution pause and save checkpoint",
      "Pending approval payload clearly presents proposed parameters and risk warnings to the reviewer",
      "Submitting approval with modified arguments updates state and executes with edited parameters",
      "Submitting rejection cleanly redirects workflow to cancellation node without touching the sensitive tool",
      "All unit tests pass validating approval, rejection, parameter overrides, and state consistency"
    ],
    activeRecallQuestions: [
      "Why is a persistent checkpointer strictly mandatory when implementing Human-in-the-Loop in LangGraph?",
      "What is the difference between static `interrupt_before` and dynamic `interrupt()` calls inside node code?",
      "How does the caller resume a paused LangGraph execution after human approval has been granted?",
      "How does `app.update_state()` allow a human reviewer to modify tool arguments before execution?",
      "What happens to a paused graph if the underlying server process restarts before approval is received?"
    ],
    advancedTopics: [
      "Slack / Discord approval bot: sending interactive approval buttons to a team channel and resuming via webhook callback",
      "Multi-signature approvals: requiring 2 separate human approvals for actions with financial impact > $1,000",
      "Time-limited approvals with auto-rejection: scheduled background task that rejects interrupts older than 24 hours"
    ]
  },
  {
    day: 19,
    title: "Multi-agent patterns and supervisor design",
    topic: "Multi-agent patterns and supervisor design",
    topicGroup: "Multi-Agent Systems",
    week: 3,
    date: "November 23, 2026",
    isoDate: "2026-11-23",
    goal: "Architect multi-agent systems using the Supervisor pattern, delegating specialized subtasks to domain-specific worker agents and synthesizing results into a cohesive final outcome.",
    prerequisites: [
      "Day 15–18 LangGraph graphs, routers, and checkpointers",
      "Separation of concerns and domain-driven design principles",
      "Structured output classification and agent handoffs"
    ],
    learningChecklist: [
      {
        category: "Multi-Agent Architecture Patterns",
        items: [
          "Why multi-agent systems: single prompt degradation when handling 10+ unrelated tools vs focused domain specialists",
          "Architectural patterns: Network (peer-to-peer collaboration), Supervisor (hierarchical manager-worker), and Sequential Pipeline (assembly line)",
          "The Supervisor Pattern: a central orchestrator analyzes user requests, selects the best specialist, evaluates their work, and coordinates final synthesis",
          "Agent Handoffs: passing control and conversation context between distinct agent nodes cleanly"
        ]
      },
      {
        category: "Designing Specialist Agents",
        items: [
          "Specialist 1: Research Agent (web search, document retrieval, fact verification)",
          "Specialist 2: Code Agent (Python interpreter, code writing, syntax verification)",
          "Specialist 3: Quality Assurance / Critic Agent (evaluating outputs against rubric, finding bugs)",
          "Isolating agent prompt spaces: giving each specialist a lean system prompt containing only their domain tools"
        ]
      },
      {
        category: "Supervisor Routing Mechanics",
        items: [
          "Using structured outputs in the Supervisor: returning `next_agent: Literal['researcher', 'coder', 'critic', 'FINISH']` and `instructions_for_worker: str`",
          "Preventing ping-pong loops: tracking delegation history and capping total agent handoffs",
          "State partitioning: global state (shared findings) vs local worker state (scratchpad tokens)"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-19/`",
      "Define `state.py` containing `MultiAgentState` with: `user_goal`, `messages`, `next_worker`, `research_notes`, `code_artifacts`, and `iteration_count`",
      "Build `supervisor.py` implementing the central router with a Pydantic schema enforcing routing decisions across `['researcher', 'coder', 'FINISH']`",
      "Build `agents/researcher.py` equipped with search and document tools",
      "Build `agents/coder.py` equipped with Python execution and file writing tools",
      "Assemble the multi-agent graph in `graph.py` with conditional routing connecting `Supervisor -> Worker -> Supervisor`",
      "Implement iteration guard in supervisor routing logic enforcing `max_iterations = 6`",
      "Build `main.py` executing a complex prompt (e.g. 'Research Bitcoin historical volatility, write a Python script to plot it, and save the chart')",
      "Write test suite in `tests/test_multi_agent.py` verifying accurate delegation, state preservation, and finish criteria",
      "Document architectural sequence diagrams and handoff flows in `README.md`"
    ],
    failureCases: [
      "Supervisor delegation deadlock: Supervisor repeatedly delegates back and forth between two agents without making progress (must enforce iteration limit)",
      "Worker hallucinating handoff: Worker agent attempts to call another worker directly in a hierarchical supervisor architecture (must route strictly through supervisor)",
      "Shared state bloat: Workers append hundreds of raw scratchpad messages into shared state, overflowing context (must summarize worker findings into clean state notes)",
      "Invalid supervisor routing string: Supervisor returns non-existent agent name (Pydantic Literal validation must reject invalid keys)",
      "Worker tool crash: One worker crashes during tool execution, bringing down the entire multi-agent swarm (must isolate worker errors in local node return)"
    ],
    deliverables: {
      requiredFiles: [
        "state.py",
        "supervisor.py",
        "agents/researcher.py",
        "agents/coder.py",
        "graph.py",
        "main.py",
        "tests/test_multi_agent.py",
        "README.md"
      ],
      description: "A hierarchical multi-agent system featuring a centralized Supervisor orchestrating specialized Researcher and Coder agents with bounded iterations."
    },
    completionCriteria: [
      "Supervisor accurately decomposes complex user goals and delegates subtasks to the appropriate specialist",
      "Researcher agent completes data gathering and stores distilled findings in shared state",
      "Coder agent consumes research findings and generates validated code artifacts",
      "Supervisor recognizes when the goal is satisfied and cleanly outputs `FINISH`",
      "System executes end-to-end within bounded iteration limits without infinite handoff loops"
    ],
    activeRecallQuestions: [
      "When is a multi-agent system genuinely superior to a single agent with multiple tools?",
      "What is the role of the Supervisor agent in a hierarchical multi-agent architecture?",
      "Why should worker agents return distilled findings to shared state rather than dumping their entire raw scratchpad history?",
      "How does structured output with `Literal` types guarantee safe routing in a multi-agent graph?",
      "What mechanisms prevent two specialized agents from entering an infinite ping-pong delegation loop?"
    ],
    advancedTopics: [
      "Decentralized peer-to-peer agent swarms using direct handoffs without a central supervisor",
      "Dynamic team composition: Supervisor dynamically spawning ephemeral specialist sub-graphs based on task complexity",
      "Competitive multi-agent debates: two agents arguing opposing hypotheses with a judge agent deciding the verdict"
    ]
  },
  {
    day: 20,
    title: "MCP server and client fundamentals",
    topic: "MCP server and client fundamentals",
    topicGroup: "Multi-Agent Systems",
    week: 3,
    date: "November 24, 2026",
    isoDate: "2026-11-24",
    goal: "Master Anthropic's Model Context Protocol (MCP), building a custom Python MCP server exposing typed tools/resources and an MCP client that dynamically discovers and executes them.",
    prerequisites: [
      "Day 3 & 4 tool calling definitions and JSON Schema",
      "Inter-process communication (IPC) basics: standard input/output (stdio) and HTTP Server-Sent Events (SSE)",
      "JSON-RPC 2.0 protocol specifications"
    ],
    learningChecklist: [
      {
        category: "Model Context Protocol (MCP) Architecture",
        items: [
          "The open standard for AI connectivity: why MCP replaces proprietary bespoke tool integrations",
          "MCP Core Primitives: Tools (callable actions), Resources (readable data/files), and Prompts (reusable templates)",
          "Client-Server model: MCP Host (the agent/IDE) connects to multiple independent MCP Servers (database server, GitHub server, file server)",
          "Transports: `stdio` (standard input/output subprocess communication for local tools) vs `SSE` (Server-Sent Events over HTTP for remote services)",
          "JSON-RPC 2.0 message format: `jsonrpc`, `id`, `method`, `params`, and `result`/`error`"
        ]
      },
      {
        category: "Building an MCP Server in Python",
        items: [
          "Using the official Python `mcp` SDK (`mcp.server.fastmcp`)",
          "Creating FastMCP server instance: `mcp = FastMCP('SystemTools')`",
          "Exposing tools with decorators: `@mcp.tool()` with automatic type inference from Python type hints and docstrings",
          "Exposing resources: `@mcp.resource('system://info')` for static or streaming state access",
          "Input validation and error reporting according to the MCP specification"
        ]
      },
      {
        category: "Building an MCP Client",
        items: [
          "Connecting to an MCP server subprocess via `stdio_client`",
          "Tool Discovery: `session.list_tools()` dynamically retrieving server tool schemas",
          "Converting MCP tool definitions into LangChain / OpenAI / Gemini function calling formats",
          "Tool Execution: invoking `session.call_tool(name, arguments)` across the IPC boundary and receiving structured content blocks"
        ]
      }
    ],
    implementationChecklist: [
      "Create project directory `day-20/` and install `mcp` SDK",
      "Build custom MCP server in `mcp_server.py` exposing: 1) `query_sqlite(query: str)`, 2) `read_log_file(filepath: str)`, 3) `get_system_stats()`",
      "Implement a resource endpoint `@mcp.resource('logs://agent.log')` returning recent log streams",
      "Build `mcp_client.py` using `mcp.client.stdio` to spawn the server process and establish a JSON-RPC session",
      "Implement `adapter.py` converting MCP tool schemas into standard provider function definitions",
      "Build `agent_with_mcp.py` connecting the MCP client to an LLM agent loop: Discover MCP Tools -> Bind to Model -> Execute Model Requests via MCP -> Return Results",
      "Write unit tests in `tests/test_mcp.py` verifying tool discovery, schema translation, and tool execution across the stdio transport",
      "Document server configuration, transport options, and client connection examples in `README.md`"
    ],
    failureCases: [
      "Subprocess death: MCP server subprocess crashes due to unhandled exception (client must catch broken pipe and report error)",
      "Transport timeout: Tool execution hangs indefinitely over stdio (client must enforce call timeout on `session.call_tool`)",
      "Schema conversion mismatch: MCP tool schema contains unsupported JSON Schema keywords that break provider API (adapter must sanitize schemas)",
      "Security traversal vulnerability: Client requests file outside allowed sandbox via MCP file tool (server must enforce strict path boundary checks)",
      "Server startup stderr pollution: Server writes non-JSON debug logs to `stdout`, corrupting stdio JSON-RPC framing (must direct all logging strictly to `stderr`)"
    ],
    deliverables: {
      requiredFiles: [
        "mcp_server.py",
        "mcp_client.py",
        "adapter.py",
        "agent_with_mcp.py",
        "main.py",
        "tests/test_mcp.py",
        "README.md"
      ],
      description: "A complete Model Context Protocol (MCP) implementation featuring a FastMCP server, an async stdio client, schema translation, and agent integration."
    },
    completionCriteria: [
      "FastMCP server initializes and exposes typed tools and resources over stdio",
      "MCP client successfully launches server as a child process and completes JSON-RPC handshake",
      "`session.list_tools()` dynamically fetches all available tools with accurate parameters and docstrings",
      "Agent autonomously invokes server tools over MCP transport and consumes output blocks correctly",
      "Server logs are cleanly routed to `stderr` without interfering with stdio JSON-RPC messages"
    ],
    activeRecallQuestions: [
      "What problem does the Model Context Protocol (MCP) solve in agent development?",
      "What are the three core primitives exposed by an MCP server (Tools, Resources, Prompts)?",
      "Why must MCP servers running over stdio write debug logs strictly to `stderr` rather than `stdout`?",
      "How does dynamic tool discovery via MCP decouple agent code from tool implementation details?",
      "What is the difference between an `stdio` transport and an `SSE` (Server-Sent Events) transport in MCP?"
    ],
    advancedTopics: [
      "Building remote MCP servers using HTTP SSE transport for cloud-hosted microservices",
      "OAuth 2.0 authentication and token pass-through in remote MCP server architectures",
      "Connecting local LangGraph agents to existing enterprise MCP servers (GitHub MCP, Postgres MCP, Brave Search MCP)"
    ]
  },
  {
    day: 21,
    title: "Integrate LangGraph, MCP, and specialist agents",
    topic: "Integrate LangGraph, MCP, and specialist agents",
    topicGroup: "Multi-Agent Systems",
    week: 3,
    date: "November 25, 2026",
    isoDate: "2026-11-25",
    goal: "Ship Milestone Project 3: Build an Autonomous Multi-Agent Research & Execution Platform combining LangGraph state graph orchestration, MCP tool integration, and Human-in-the-Loop review for sensitive actions.",
    prerequisites: [
      "Days 15–20 complete implementations (LangGraph, Checkpointing, HITL, Multi-Agent Supervisor, MCP Server/Client)",
      "Async Python programming and multi-process architecture",
      "Enterprise software integration patterns"
    ],
    learningChecklist: [
      {
        category: "End-to-End Orchestration Architecture",
        items: [
          "Architectural synthesis: LangGraph State Machine as the central brain orchestrating multi-agent collaboration",
          "External Tool integration via MCP: decoupling tools into independent MCP microservices connecting over stdio/SSE",
          "Human Oversight: intercepting high-impact actions (e.g. database updates, file writing) with LangGraph interrupts",
          "Fault Tolerance: session checkpoints stored in persistent SQLite/Postgres ensuring full crash recovery"
        ]
      },
      {
        category: "Specialist Team Composition",
        items: [
          "Supervisor Agent: parses user mission, drafts high-level execution plan, assigns subtasks, and reviews work products",
          "Research Specialist: interacts with Local Document RAG MCP Server and Web Search MCP Server",
          "Engineer Specialist: interacts with Code Sandbox MCP Server to run Python scripts and generate visualization charts",
          "Writer Specialist: aggregates verified research and charts into a polished publication report"
        ]
      },
      {
        category: "Production Hardening & Verification",
        items: [
          "End-to-end tracing: logging every inter-agent message, tool call, and state transition",
          "Testing complex real-world workflows: autonomous data analysis with human checkpoint approval",
          "Packaging the project: clean CLI interface with configuration flags and Docker Compose setup"
        ]
      }
    ],
    implementationChecklist: [
      "Create project repository `milestone-03-multiagent-platform/`",
      "Build two dedicated MCP servers in `mcp_servers/`: 1) `rag_server.py` (document search), 2) `tools_server.py` (file operations & calculations)",
      "Implement `core/mcp_hub.py` managing lifecycle and client connections to all MCP servers",
      "Define unified state in `core/state.py` tracking multi-agent progress, artifacts, and approval flags",
      "Implement specialist agent nodes in `agents/`: Supervisor, Researcher, Engineer, and Writer",
      "Implement LangGraph workflow in `core/graph.py` connecting agents with conditional edges and persistent `SqliteSaver` checkpointer",
      "Add dynamic human approval interrupt before any destructive file write or script execution",
      "Build CLI application `app.py` with rich interactive terminal output, displaying active agent badges and review prompts",
      "Write comprehensive end-to-end integration tests in `tests/test_milestone_03.py` verifying full pipeline execution",
      "Document architectural design, MCP server protocol diagrams, and usage walkthrough in `README.md`"
    ],
    failureCases: [
      "MCP server crashes during multi-agent run: Client detects connection drop, attempts auto-restart, and informs supervisor node",
      "Supervisor infinite re-planning: Supervisor continuously modifies plan without executing (must limit planning iterations to 2)",
      "Human rejection handling: Reviewer rejects engineer's script execution (workflow must route back to engineer with reviewer feedback)",
      "State payload serialization error: Non-serializable MCP response object placed directly in state (must convert to typed Pydantic/dict)",
      "Concurrent tool execution race condition: Multiple agents attempt to write to the same output file simultaneously (must enforce atomic file locking)"
    ],
    deliverables: {
      requiredFiles: [
        "mcp_servers/rag_server.py",
        "mcp_servers/tools_server.py",
        "core/mcp_hub.py",
        "core/state.py",
        "core/graph.py",
        "agents/supervisor.py",
        "agents/specialists.py",
        "app.py",
        "tests/test_milestone_03.py",
        "README.md"
      ],
      description: "Milestone Project 3: An autonomous Multi-Agent Research & Execution Platform featuring LangGraph orchestration, distributed MCP tool servers, Human-in-the-Loop review, and checkpointed persistence."
    },
    completionCriteria: [
      "Supervisor successfully orchestrates Researcher, Engineer, and Writer specialists to fulfill complex multi-step missions",
      "All external tools are consumed cleanly through decoupled MCP servers over stdio transports",
      "Dangerous actions (code execution, file writing) reliably trigger Human-in-the-Loop interrupts for review and approval",
      "Conversations and agent state are 100% persisted across process restarts using SQLite checkpointer",
      "Milestone project passes all automated integration tests and is committed to Git with comprehensive architecture documentation"
    ],
    activeRecallQuestions: [
      "How does combining LangGraph with the Model Context Protocol (MCP) provide modularity and scalability?",
      "In what order do state transitions occur when a worker agent triggers a Human-in-the-Loop interrupt via MCP?",
      "How do you ensure that specialist agents only have access to tools relevant to their specific domain?",
      "What role does state checkpointing play in allowing human reviewers to inspect and edit pending agent actions?",
      "What are the key differences in failure recovery between a monolithic agent and a decoupled multi-agent architecture?"
    ],
    advancedTopics: [
      "Web-based visual control plane: building a real-time web UI (React / WebSocket) to monitor multi-agent graph execution live",
      "Distributed MCP over WebSocket/SSE: running MCP tool servers across distinct cloud containers",
      "Dynamic prompt optimization: agents updating their own instructions based on post-task self-critique"
    ]
  }
];

