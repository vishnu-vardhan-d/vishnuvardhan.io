# Kasongo: Project Brief

Kasongo is Vishnu Vardhan's personal AI assistant, built from scratch in Java. It does real work for him over time, safely, and proves with published measurements that it works. Its public face is linked from LinkedIn and vishnuvardhan.io as "my AI assistant", so it doubles as a portfolio piece that demonstrates senior AI engineering.

## Ground rules

- **Kasongo prepares Vishnu; it never stands in for him.** It can draft recruiter replies, prepare him for interviews and schedule calls. It never answers live interviews or assessments on his behalf.
- **Kasongo writes only from verified facts.** CV tailoring rewords and reorders lines from a facts file that Vishnu owns, and never invents experience, titles or dates.
- **Anything that sends, submits or books waits for Vishnu's approval.**
- **Kasongo's own code is written by Vishnu.** The agent loop, orchestration, memory and approval flow are his. Libraries such as Spring AI, pgvector and the Claude API are building blocks, not copied code.

## Three agents on one platform

| Agent | What it does | What it proves |
|---|---|---|
| Career agent | Runs nightly: finds matching jobs, scores each against the facts file, drafts a tailored CV and cover note, queues them for morning approval, and tracks every application and follow-up | Long-running background workflows, multi-step planning, approval steps, and no duplicate actions after a crash or retry |
| Learning agent | Builds study plans, quizzes at increasing intervals, reads GitHub commits to see what was actually built, and runs interview-style checks on weak spots | A hand-designed memory model, personalization, and measuring whether the teaching worked |
| Dev agent | Reviews pull requests on KanbanAssist and other repos, runs tests in a sandbox, explains failures, and opens fix PRs for review | Code agents, safe code execution, GitHub tools, and the limits of trusting AI-written code |

## The platform underneath

- **Orchestration written in Java.** A planner hands work to specialist agents, and an evaluator agent checks results before anything is acted on. The loop, the shared state and the stopping rules are all hand-written; no LangGraph or similar framework.
- **Durable execution.** Every step is saved, so a crash halfway through a task resumes instead of restarting or repeating an action.
- **Permission tiers.** Every tool is graded read, draft or act. Act-level tools always need approval.
- **Public and private modes.** Public visitors reach only read-level tools on public facts and articles. Private mode, behind Vishnu's login, holds email, CVs and applications. Because the public chat can never reach the private tools, a prompt-injection attack hidden in a job description or email has nothing to grab.
- **MCP in both directions.** Kasongo uses MCP servers (Gmail, GitHub, Calendar) and also exposes its own tools as an MCP server.
- **An evaluation set that runs in CI.** Every change reruns a few hundred test cases, so a prompt or model change that quietly breaks something fails the build.
- **Tracing and cost.** Every run records its steps, tokens, time and dollars. Easy work goes to small, cheap models, and embeddings stay local, which reuses the Ollama findings from the GPU article.
- **Pull APIs become events.** For services that only answer when asked, such as an official case-status API with no webhooks, a scheduled poller saves the last status it saw and publishes an internal event only when something changes. The agents react to that event exactly as they would to a webhook.

## Flagship public demo

A recruiter opens Kasongo from LinkedIn and asks about Vishnu's experience. Kasongo answers from verified facts with citations, and can book a call on his real calendar, but the booking waits for his approval. A live panel beside the chat streams each step, tool call, token count and cost. In one minute that shows retrieval, agents, tools, safety and observability.

## What already exists, and where Kasongo stands out

- **OpenClaw** (Peter Steinberger, 2025) is an open-source assistant that manages calendars, sends messages and browses the web through WhatsApp and iMessage. It led to OpenAI hiring its creator in February 2026, and it drew criticism after simple attacks exposed personal data.
- **Kai** (Daniel Miessler) is a modular personal AI system built on top of Claude Code. It pulls context from calendars, email and code repositories.
- **Wiz, Doris and MARVIN** are individual engineers' multi-agent assistants. Their recurring lessons: scheduled agents that draft work for approval, and memory as the hardest part.
- **"Chat with my résumé" portfolio bots** number in the thousands. Most are a résumé pasted into a prompt.

Kasongo's openings are the three things this landscape lacks: an agent platform written in Java from scratch, security as the defining feature with a public "try to break it" page, and a published evaluation page showing measured accuracy, speed and cost.

## Build order

1. **Platform core with the career agent.** The orchestration loop, durable state, permission tiers and approval flow, proved end to end on one agent that is useful today.
2. **Proof.** The tracing panel, the evaluation set in CI, and the public evaluation page.
3. **Public mode.** The recruiter chat linked from LinkedIn, with the injection defenses and the "try to break it" page.
4. **More agents.** The learning agent and the dev agent, each far cheaper to add once the platform exists.

## Next step

Write the architecture decision record for the orchestration loop: how a task becomes steps, where state is saved, how retries avoid repeat actions, and where the approval step sits. It is the foundation for the whole platform and the first article in a "Building Kasongo" series.

## Sources

- [OpenAI hires OpenClaw creator (The Neuron)](https://www.theneuron.ai/explainer-articles/openai-hires-openclaw-peter-steinberger-personal-agents/)
- [OpenAI grabs OpenClaw creator (The Register)](https://www.theregister.com/2026/02/16/open_ai_grabs_openclaw)
- [Daniel Miessler: Building a Personal AI Infrastructure](https://danielmiessler.com/blog/personal-ai-infrastructure)
- [I Built a Personal AI Agent Called Wiz](https://dev.to/joozio/i-built-a-personal-ai-agent-called-wiz-heres-what-happened-2026-42ef)
- [USCIS Developer Portal](https://developer.uscis.gov/)
