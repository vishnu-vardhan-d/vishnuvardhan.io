// Architecture walkthroughs shown from the Projects section.
// Every value here is taken from the project's own code: class names, endpoints, topics, SQL,
// and the example numbers (RaastaPay's TripCostCalculatorTest, KanbanAssist's eval run).

export type Icon = "window" | "server" | "log" | "cube" | "chip" | "db" | "cloud" | "board" | "plug" | "gpu";

export type ArchNode =
  | { id: string; kind?: "icon"; x: number; y: number; icon: Icon; title: string; sub: string }
  | { id: string; kind: "state"; x: number; y: number; title: string; sub: string; tone?: "end" | "warn" };

export type ArchGroup = { x: number; y: number; w: number; h: number; label: string; sub?: string; solid?: boolean };
export type ArchEdge = { id: string; d: string };
export type ArchPill = { x: number; y: number; text: string };
export type ArchStep = {
  title: string;
  body: string;
  code: string;
  nodes: string[];
  path: [string, boolean?][]; // edges the packet travels, in order; true = against the arrow
};
export type ArchView = {
  id: string;
  tab: string;
  intro: string;
  viewBox: [number, number];
  groups: ArchGroup[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  pills: ArchPill[];
  steps: ArchStep[];
};
export type ArchProject = { name: string; tagline: string; views: ArchView[]; decisions: { q: string; a: string }[] };

/* ------------------------------------------------------------------ RaastaPay */

const raastaTrip: ArchView = {
  id: "trip",
  tab: "Trip analysis",
  intro: "One trip, from the owner's quote to the advisor's verdict.",
  viewBox: [960, 650],
  groups: [
    { x: 690, y: 15, w: 255, h: 178, label: "MODEL PROVIDER", sub: "cloud API" },
    { x: 18, y: 240, w: 168, h: 200, label: "CLIENT", solid: true },
    { x: 215, y: 228, w: 730, h: 410, label: "RAASTAPAY", sub: "docker compose · java 25" },
  ],
  nodes: [
    { id: "client", x: 102, y: 330, icon: "window", title: "Owner", sub: "app or API client" },
    { id: "api", x: 330, y: 330, icon: "server", title: "Trip API", sub: "TripController" },
    { id: "kafka", x: 575, y: 330, icon: "log", title: "Kafka", sub: "KRaft · 2 topics" },
    { id: "consumer", x: 820, y: 330, icon: "cube", title: "Advisor", sub: "TripEventConsumer" },
    { id: "claude", x: 820, y: 92, icon: "chip", title: "Claude", sub: "via Spring AI" },
    { id: "db", x: 575, y: 548, icon: "db", title: "PostgreSQL", sub: "Flyway · 24 migrations" },
  ],
  edges: [
    { id: "ca", d: "M150 330 H282" },
    { id: "ak", d: "M378 330 H527" },
    { id: "kc", d: "M623 316 H772" },
    { id: "cv", d: "M772 346 H623" },
    { id: "cl", d: "M820 284 V193" },
    { id: "adb", d: "M330 420 V548 H527" },
    { id: "cdb", d: "M820 420 V548 H623" },
  ],
  pills: [
    { x: 216, y: 330, text: "HTTP" },
    { x: 452, y: 330, text: "trip.events" },
    { x: 697, y: 302, text: "trip.events" },
    { x: 697, y: 360, text: "trip.verdict" },
    { x: 820, y: 210, text: "Spring AI" },
  ],
  steps: [
    {
      title: "Quote",
      body: "An owner submits a load he has been offered: the lane, the distance and the shipper's price, plus his own diesel, toll, bhatta and hamali costs.",
      code: 'POST /api/trips  { "ownerId": 1, "originCity": "Anantapur", "destinationCity": "Chennai", "distanceKm": 840, "quotedPrice": 25000, "dieselPerKm": 21, "tolls": 1200, "bhatta": 1500, "hamali": 1000, "paymentDays": 45 }',
      nodes: ["client", "api"],
      path: [["ca"]],
    },
    {
      title: "Price it in Java",
      body: "TripCostCalculator does the arithmetic with BigDecimal before any model is involved. The model will judge these numbers; it is never asked to calculate them.",
      code: "diesel 840 × 21 = 17,640  ·  total 21,340  ·  profit 3,660  ·  margin 14.64%  ·  ₹4.36 per km",
      nodes: ["api"],
      path: [],
    },
    {
      title: "Save and answer now",
      body: "The trip is saved with status PENDING and the owner gets the full cost breakdown straight away. He never waits on a model call to see his margin.",
      code: '201 Created  { "profit": 3660.00, "profitMargin": 14.64, "status": "PENDING", "verdict": null }',
      nodes: ["api", "db", "client"],
      path: [["adb"], ["ca", true]],
    },
    {
      title: "Publish after commit",
      body: "The event is sent only once the database transaction has committed, so a consumer can never read a trip that was rolled back. The trip id is the message key.",
      code: "@TransactionalEventListener(phase = AFTER_COMMIT)  →  kafkaTemplate.send(\"trip.events\", tripId, event)",
      nodes: ["api", "kafka"],
      path: [["ak"]],
    },
    {
      title: "Consume once",
      body: "The advisor listens on trip.events. Kafka can deliver a message twice, so a trip that already has a verdict is skipped instead of being judged again.",
      code: '@KafkaListener(topics = "trip.events")  ·  if (trip.getVerdict() != null) return;',
      nodes: ["kafka", "consumer"],
      path: [["kc"]],
    },
    {
      title: "Add the owner's history",
      body: "The advisor looks up how this owner has done on this exact lane before, so the model compares today's margin with his usual one instead of judging it in isolation.",
      code: "SELECT count(*) AS trip_count, avg(profit_margin) AS avg_margin FROM trip WHERE owner_id = :ownerId AND origin_city = :originCity AND destination_city = :destinationCity",
      nodes: ["consumer", "db"],
      path: [["cdb"], ["cdb", true]],
    },
    {
      title: "Judge",
      body: "The prompts are versioned rows in the prompt_template table, not strings in Java. Spring AI sends them to Claude and maps the reply straight onto a Java record.",
      code: "chatClient.prompt().system(…).user(…).call().entity(AdvisorVerdict.class)  →  AdvisorVerdict(TAKE | SKIP | CLARIFY, reason, caution)",
      nodes: ["consumer", "claude"],
      path: [["cl"], ["cl", true]],
    },
    {
      title: "Record and announce",
      body: "The verdict is saved and the trip moves to COMPLETE. If the model call fails, the trip is marked FAILED and the offset still commits, so one bad message can never block the topic.",
      code: "trip.applyVerdict(verdict, reason, caution)  →  status COMPLETE  ·  on error: FAILED  ·  then send(\"trip.verdict\", tripId)",
      nodes: ["consumer", "db", "kafka"],
      path: [["cdb"], ["cv"]],
    },
    {
      title: "Read the verdict",
      body: "The owner's screen asks for the trip again and now gets the advice next to the numbers it was based on. That is the whole loop.",
      code: 'GET /api/trips/{id}  →  TripResponse(profit, profitMargin, status COMPLETE, verdict, verdictReason, verdictCaution)',
      nodes: ["client", "api"],
      path: [["ca"], ["ca", true]],
    },
  ],
};

const raastaAgent: ArchView = {
  id: "agent",
  tab: "Owner agent and labels",
  intro: "Simulated owners act on the advice, and every trip earns a realized-profit label.",
  viewBox: [960, 650],
  groups: [
    { x: 18, y: 25, w: 168, h: 200, label: "OPERATOR", solid: true },
    { x: 215, y: 25, w: 730, h: 245, label: "SIMULATION", sub: "OwnerAgent" },
    { x: 215, y: 375, w: 730, h: 262, label: "LABELING", sub: "LabelingService" },
  ],
  nodes: [
    { id: "op", x: 102, y: 125, icon: "window", title: "Operator", sub: "runs a batch" },
    { id: "inbox", x: 330, y: 125, icon: "db", title: "Load inbox", sub: "incoming_load" },
    { id: "owner", x: 575, y: 125, icon: "cube", title: "Owner agent", sub: "OwnerAgent" },
    { id: "pipe", x: 820, y: 125, icon: "server", title: "Trip pipeline", sub: "same as tab one" },
    { id: "outcome", x: 330, y: 480, icon: "db", title: "Outcomes", sub: "trip_outcome" },
    { id: "labeler", x: 575, y: 480, icon: "cube", title: "Labeler", sub: "POST /api/label/agentic" },
    { id: "lanes", x: 820, y: 480, icon: "db", title: "Lane profiles", sub: "lane_profile" },
  ],
  edges: [
    { id: "oi", d: "M150 125 H282" },
    { id: "io", d: "M378 125 H527" },
    { id: "op", d: "M623 111 H772" },
    { id: "po", d: "M772 141 H623" },
    { id: "pl", d: "M820 215 V318 H575 V432" },
    { id: "ll", d: "M772 480 H623" },
    { id: "lo", d: "M527 480 H378" },
  ],
  pills: [
    { x: 216, y: 125, text: "HTTP" },
    { x: 697, y: 97, text: "AGENT trip" },
    { x: 697, y: 155, text: "trip.verdict" },
    { x: 697, y: 318, text: "trips with no outcome" },
  ],
  steps: [
    {
      title: "Release a batch",
      body: "Seeded loads wait in an inbox, switched off. The operator releases them and asks the agent to work through a batch.",
      code: "POST /api/simulation/run?count=5",
      nodes: ["op", "inbox"],
      path: [["oi"]],
    },
    {
      title: "Read the inbox",
      body: "The owner agent takes active loads it has not read yet and marks each one read as it goes, so a load is never submitted twice.",
      code: 'loads.findActiveLoads("Y", "N", Limit.of(5))  →  load.markRead(tripId)',
      nodes: ["inbox", "owner"],
      path: [["io"]],
    },
    {
      title: "Use the real pipeline",
      body: "Each load becomes a trip through the same TripService a real owner uses, tagged AGENT. The simulation tests production code, not a copy of it.",
      code: "trips.create(request, TripSource.AGENT)  →  priced, saved, published on trip.events",
      nodes: ["owner", "pipe"],
      path: [["op"]],
    },
    {
      title: "Hear the verdict",
      body: "A second consumer group, owner, listens on trip.verdict. It ignores trips from real owners and acts only on the agent's own trips.",
      code: '@KafkaListener(topics = "trip.verdict", groupId = "owner")  ·  if (trip.getSource() != TripSource.AGENT) return;',
      nodes: ["pipe", "owner"],
      path: [["po"]],
    },
    {
      title: "Decide like an owner",
      body: "Each owner has a minimum margin he will accept. The decision is saved once per trip, whatever the advisor said, so advice and behaviour can be compared later.",
      code: "margin 14.64% ≥ minimum 9.00%  →  ACCEPT  ·  saved to trip_decision",
      nodes: ["owner"],
      path: [],
    },
    {
      title: "Find the empty-return risk",
      body: "A truck that comes home empty burns diesel for nothing. Each lane's empty-return rate is a versioned row, and a partial unique index allows only one active version per lane.",
      code: "SELECT lp.emptyReturnRate FROM LaneProfile lp WHERE lp.originCity = :origin AND lp.destinationCity = :destination AND lp.active = true",
      nodes: ["pipe", "labeler", "lanes"],
      path: [["pl"], ["ll"]],
    },
    {
      title: "Label what really happened",
      body: "The planned profit is reduced by the expected cost of the empty return. With no lane profile the labeler falls back to a rate of 0.5, which turns this trip into a loss.",
      code: "realized = 3,660 − 0.5 × 17,640 = −5,160  →  saved to trip_outcome",
      nodes: ["labeler", "outcome"],
      path: [["lo"]],
    },
  ],
};

export const raastapayArchitecture: ArchProject = {
  name: "RaastaPay",
  tagline: "Event-driven trip advisor for small truck owners in India",
  views: [raastaTrip, raastaAgent],
  decisions: [
    {
      q: "Why does Java do the maths and not the model?",
      a: "Money has to be exact and repeatable. TripCostCalculator works in BigDecimal and is unit tested; the model only judges numbers it is given, and its prompt says so.",
    },
    {
      q: "Why Kafka instead of calling Claude inside the request?",
      a: "The owner gets his margin in milliseconds whatever the model is doing. A slow or failed model call delays only the verdict, and new listeners such as the owner agent join a topic without touching the API.",
    },
    {
      q: "Why publish after commit?",
      a: "Sending inside the transaction could announce a trip that is then rolled back. AFTER_COMMIT means every event points at a row that exists.",
    },
    {
      q: "Why mark a trip FAILED instead of retrying?",
      a: "A message that keeps failing would be redelivered forever and stall the partition behind it. Recording the failure keeps the topic moving and leaves the trip visible for a retry.",
    },
    {
      q: "Why keep prompts and lane rates in tables?",
      a: "Both get tuned often. A versioned row gives history, rollback and an answer to which version produced a verdict, and changing one needs no redeploy.",
    },
  ],
};

/* --------------------------------------------------------------- KanbanAssist */

const kanbanSync: ArchView = {
  id: "sync",
  tab: "Ticket sync",
  intro: "How a change in Azure DevOps becomes a searchable row on the laptop.",
  viewBox: [960, 650],
  groups: [
    { x: 18, y: 240, w: 168, h: 200, label: "AZURE DEVOPS", solid: true },
    { x: 238, y: 240, w: 184, h: 200, label: "CLOUDFLARE" },
    { x: 452, y: 15, w: 493, h: 623, label: "LAPTOP", sub: "docker compose · gpu" },
  ],
  nodes: [
    { id: "ado", x: 102, y: 330, icon: "board", title: "Work items", sub: "service hook" },
    { id: "tunnel", x: 330, y: 330, icon: "cloud", title: "Tunnel", sub: "hooks subdomain" },
    { id: "app", x: 575, y: 330, icon: "server", title: "KanbanAssist", sub: "spring boot 4.1" },
    { id: "mcp", x: 575, y: 105, icon: "plug", title: "ADO MCP server", sub: "npx child process" },
    { id: "ollama", x: 820, y: 330, icon: "gpu", title: "Ollama", sub: "nomic-embed-text" },
    { id: "db", x: 575, y: 548, icon: "db", title: "pgvector", sub: "PostgreSQL 16" },
  ],
  edges: [
    { id: "at", d: "M150 330 H282" },
    { id: "tw", d: "M378 330 H527" },
    { id: "wm", d: "M575 284 V200" },
    { id: "ma", d: "M527 105 H102 V284" },
    { id: "wo", d: "M623 330 H772" },
    { id: "wd", d: "M575 420 V500" },
  ],
  pills: [
    { x: 212, y: 330, text: "HTTPS" },
    { x: 452, y: 330, text: "HTTPS" },
    { x: 575, y: 238, text: "stdio · JSON-RPC" },
    { x: 300, y: 105, text: "ADO REST" },
  ],
  steps: [
    {
      title: "A ticket changes",
      body: "Azure DevOps fires a service hook whenever a work item is created or updated. The hook calls a public address on the vishnuvardhan.io domain.",
      code: "work item created / updated  →  POST https://hooks.vishnuvardhan.io/webhooks/ado",
      nodes: ["ado", "tunnel"],
      path: [["at"]],
    },
    {
      title: "Through the tunnel",
      body: "A Cloudflare Tunnel forwards the call to the laptop without opening a router port. The controller rejects any call that lacks the shared secret.",
      code: '@PostMapping("/webhooks/ado")  ·  wrong X-Webhook-Secret  →  403',
      nodes: ["tunnel", "app"],
      path: [["tw"]],
    },
    {
      title: "Read the full ticket",
      body: "The hook carries only an id. The app asks Microsoft's Azure DevOps MCP server for the work item; Spring starts that server as a child process and talks to it over stdio.",
      code: 'mcpClient.callTool(new CallToolRequest("wit_work_item", { "id": 589 }, null))',
      nodes: ["app", "mcp", "ado"],
      path: [["wm"], ["ma"], ["ma", true], ["wm", true]],
    },
    {
      title: "Keep the problem",
      body: "HTML is stripped and the title and description become problem_text. Root cause and resolution are stored beside it but not embedded, because a new ticket has a problem and no fix yet.",
      code: "problem_text = title + description  ·  root_cause, resolution, state, revision kept as columns",
      nodes: ["app"],
      path: [],
    },
    {
      title: "Turn it into numbers",
      body: "A local embedding model on the laptop's GPU turns the problem into 768 numbers that capture its meaning. No ticket text leaves the machine.",
      code: 'embeddingModel.embed(problemText)  →  float[768]  ·  about 50 ms on a 4 GB Quadro T1000',
      nodes: ["app", "ollama"],
      path: [["wo"], ["wo", true]],
    },
    {
      title: "Store it",
      body: "The row is saved with its vector. The column is VECTOR(768), so a model that returns any other length fails loudly on insert. A ticket seen for the first time is queued for the agent.",
      code: "embedding VECTOR(768) NOT NULL  ·  first sighting  →  agent_status = 'pending'",
      nodes: ["app", "db"],
      path: [["wd"]],
    },
    {
      title: "Fail safely",
      body: "If the MCP server or Ollama is down, the controller answers 503. Azure DevOps treats that as temporary and sends the hook again later, so no change is lost.",
      code: "sync failed  →  503 Service Unavailable  →  Azure DevOps retries",
      nodes: ["app", "tunnel", "ado"],
      path: [["tw", true], ["at", true]],
    },
  ],
};

const kanbanRca: ArchView = {
  id: "rca",
  tab: "Root-cause search",
  intro: "A real evaluation case: a trip verdict stuck on 'analysing'.",
  viewBox: [960, 650],
  groups: [
    { x: 18, y: 240, w: 168, h: 200, label: "UI", solid: true, sub: "react" },
    { x: 238, y: 15, w: 245, h: 623, label: "LAPTOP", sub: "docker compose" },
    { x: 690, y: 240, w: 255, h: 200, label: "CHAT MODEL", sub: "CHAT_PROVIDER" },
  ],
  nodes: [
    { id: "ui", x: 102, y: 330, icon: "window", title: "Engineer", sub: "Investigate button" },
    { id: "inv", x: 360, y: 330, icon: "cube", title: "Investigator", sub: "RootCauseInvestigator" },
    { id: "emb", x: 360, y: 105, icon: "gpu", title: "Ollama", sub: "nomic-embed-text" },
    { id: "pg", x: 360, y: 548, icon: "db", title: "pgvector", sub: "cosine distance" },
    { id: "llm", x: 818, y: 330, icon: "chip", title: "Claude or Qwen3", sub: "anthropic | ollama" },
  ],
  edges: [
    { id: "ui", d: "M150 330 H312" },
    { id: "emb", d: "M360 284 V200" },
    { id: "pg", d: "M360 420 V500" },
    { id: "llm", d: "M408 330 H770" },
  ],
  pills: [
    { x: 214, y: 330, text: "HTTP" },
    { x: 590, y: 330, text: "structured output" },
  ],
  steps: [
    {
      title: "Describe the problem",
      body: "An engineer pastes a new ticket. beforeId hides every ticket filed after it, so an evaluation can never peek at the answer.",
      code: 'POST /api/tickets/investigate  { "problem": "Trip verdict stuck on analysing. Consumer log shows ADV-KAFKA-500" }  ·  optional beforeId  →  WHERE id < :beforeId',
      nodes: ["ui", "inv"],
      path: [["ui"]],
    },
    {
      title: "Embed the question",
      body: "The problem goes through the same embedding model as the stored tickets, so the question and the history are measured in the same space.",
      code: "embeddingModel.embed(problem)  →  float[768]",
      nodes: ["inv", "emb"],
      path: [["emb"], ["emb", true]],
    },
    {
      title: "Find the five closest solved tickets",
      body: "Postgres ranks every solved ticket by cosine distance in a single query. At this size an exact scan answers in milliseconds, so no vector index is needed yet.",
      code: "ORDER BY embedding <=> ?::vector LIMIT 5  →  #589 0.996 · #785 0.981 · #1035 0.973 · #421 0.971 · #976 0.970",
      nodes: ["inv", "pg"],
      path: [["pg"], ["pg", true]],
    },
    {
      title: "Reason over the evidence",
      body: "The model is told a past ticket counts only if it shares the same trigger, not just similar words, and must answer in a fixed shape. The provider is one line of configuration.",
      code: "RootCauseAnswer { confident, rootCause, suggestedFix, verify, basedOn }  ·  spring.ai.model.chat = ${CHAT_PROVIDER}",
      nodes: ["inv", "llm"],
      path: [["llm"], ["llm", true]],
    },
    {
      title: "Check every citation",
      body: "Ids the model cites are kept only if they were among the five retrieved. If none survive, the answer is reported as not confident, whatever the model said.",
      code: "basedOn = modelIds ∩ retrievedIds  →  [589, 785, 1035, 421, 976]  ·  confident = model.confident && !basedOn.isEmpty()",
      nodes: ["inv"],
      path: [],
    },
    {
      title: "Answer with sources",
      body: "The engineer sees the cause, the fix and one check that would confirm it, each linked to the past tickets it came from.",
      code: '"rootCause": "The consumer crashed on a parse error and kept skipping messages, so every trip after it stayed without a verdict."',
      nodes: ["inv", "ui"],
      path: [["ui", true]],
    },
  ],
};

const kanbanLifecycle: ArchView = {
  id: "life",
  tab: "Ticket lifecycle",
  intro: "agent_status: what KanbanAssist has done with each ticket, enforced by Postgres.",
  viewBox: [960, 560],
  groups: [
    { x: 18, y: 60, w: 927, h: 210, label: "AUTOMATED" },
    { x: 18, y: 320, w: 927, h: 220, label: "EXITS AND RECOVERY" },
  ],
  nodes: [
    { kind: "state", id: "hook", x: 115, y: 165, title: "webhook", sub: "first sighting" },
    { kind: "state", id: "pending", x: 340, y: 165, title: "pending", sub: "queued for the agent" },
    { kind: "state", id: "running", x: 565, y: 165, title: "running", sub: "claimed" },
    { kind: "state", id: "done", x: 815, y: 165, title: "done", sub: "analysis posted", tone: "end" },
    { kind: "state", id: "manual", x: 115, y: 430, title: "manual", sub: "a person handles it", tone: "end" },
    { kind: "state", id: "skipped", x: 340, y: 430, title: "skipped", sub: "excluded on purpose", tone: "end" },
    { kind: "state", id: "failed", x: 565, y: 430, title: "failed", sub: "could not finish", tone: "warn" },
    { kind: "state", id: "review", x: 815, y: 430, title: "Human Review", sub: "Azure DevOps state", tone: "end" },
  ],
  edges: [
    { id: "hp", d: "M190 165 H265" },
    { id: "pr", d: "M415 165 H490" },
    { id: "rd", d: "M640 165 H740" },
    { id: "dr", d: "M815 193 V402" },
    { id: "rf", d: "M565 193 V402" },
    { id: "fp", d: "M490 430 C 452 430 430 300 380 193" },
    { id: "pm", d: "M300 193 C 260 300 160 330 115 402" },
    { id: "ps", d: "M340 193 V402" },
  ],
  pills: [
    { x: 690, y: 165, text: "posts RCA" },
    { x: 452, y: 310, text: "retry" },
  ],
  steps: [
    {
      title: "Queued on arrival",
      body: "A ticket seen for the first time by the webhook is set to pending. Tickets loaded in bulk from history keep NULL, and agents ignore them.",
      code: "ticketRepository.setAgentStatus(id, \"pending\")  ·  backfill rows: agent_status IS NULL",
      nodes: ["hook", "pending"],
      path: [["hp"]],
    },
    {
      title: "Claimed",
      body: "An agent takes the next pending ticket and moves it to running, which takes it out of every other agent's queue.",
      code: "WHERE agent_status = 'pending' ORDER BY id",
      nodes: ["pending", "running"],
      path: [["pr"]],
    },
    {
      title: "Handed to a person",
      body: "Once the analysis is posted the ticket is done, and the agent moves the work item to Human Review in Azure DevOps. A person makes the final call, and that state stays in Azure DevOps, never duplicated here.",
      code: "agent_status = 'done'  ·  state = 'Human Review'  (owned by Azure DevOps)",
      nodes: ["running", "done", "review"],
      path: [["rd"], ["dr"]],
    },
    {
      title: "Recover from failure",
      body: "A run that cannot finish is marked failed, stays visible on the board, and can be set back to pending to try again.",
      code: "running  →  failed  →  pending",
      nodes: ["running", "failed", "pending"],
      path: [["rf"], ["fp"]],
    },
    {
      title: "Opt out",
      body: "A person can take a ticket over or exclude it, and agents skip both. The ticket's own state in Azure DevOps is untouched either way.",
      code: "pending  →  manual  |  skipped",
      nodes: ["pending", "manual", "skipped"],
      path: [["pm"], ["ps"]],
    },
    {
      title: "Enforced by the database",
      body: "A CHECK constraint accepts only these seven values, so a typo such as 'pendng' fails on write instead of leaving a ticket that no agent will ever pick up.",
      code: "CHECK (agent_status IN ('new', 'pending', 'running', 'done', 'failed', 'manual', 'skipped'))",
      nodes: ["hook", "pending", "running", "done", "manual", "skipped", "failed", "review"],
      path: [],
    },
  ],
};

export const kanbanAssistArchitecture: ArchProject = {
  name: "KanbanAssist",
  tagline: "Local-first root-cause analysis over an Azure DevOps board",
  views: [kanbanSync, kanbanRca, kanbanLifecycle],
  decisions: [
    {
      q: "Why local models by default?",
      a: "Ticket text is internal data. With Ollama on the laptop's GPU nothing leaves the machine and no API key is needed; Claude is a profile switched on for comparison (ADR 0002).",
    },
    {
      q: "Why MCP for Azure DevOps?",
      a: "MCP gives the agent every tool through one protocol, and the same tools work from any MCP client. Calls whose shape never changes can use plain REST instead (ADRs 0001 and 0003).",
    },
    {
      q: "Why embed only the problem?",
      a: "A new ticket has a symptom and no fix. Matching symptom against symptom finds the closest past cases, and their stored root causes are what the engineer reads.",
    },
    {
      q: "Why pgvector and not a vector database?",
      a: "Tickets and their vectors live in one Postgres, under one transaction and one Flyway history. At the current size an exact scan is fast enough that an index would only add upkeep.",
    },
    {
      q: "Why check citations in Java?",
      a: "A model can name ids it never saw. Intersecting its citations with the retrieved ids turns an unsupported answer into an honest not confident.",
    },
  ],
};
