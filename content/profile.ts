export const profile = {
  name: "Vishnu Vardhan",
  tagline: "Building AI where the enterprise already runs.",
  location: "Dallas–Fort Worth, Texas",
  email: "vishnu.vardhan.darshi@gmail.com",
  links: [
    { label: "Twitter", icon: "x", href: "https://x.com/DipEngineer" },
    { label: "GitHub", icon: "github", href: "https://github.com/vishnu-vardhan-d" },
    { label: "LinkedIn", icon: "linkedin", href: "https://www.linkedin.com/in/vishnu-vardhan-94832b53" },
  ] as const,
};

// Shown as logo chips under Skills, in this order.
export const skills = [
  { name: "Java", icon: "java" },
  { name: "Spring Boot", icon: "springboot" },
  { name: "Spring AI", icon: "spring" },
  { name: "Apache Kafka", icon: "kafka" },
  { name: "PostgreSQL", icon: "postgresql" },
  { name: "React", icon: "react" },
  { name: "Docker", icon: "docker" },
  { name: "AWS", icon: "aws" },
  { name: "Ollama", icon: "ollama" },
] as const;

export type Project = {
  date: string; // TODO: confirm real start dates
  name: string;
  summary: string;
  links: { label: string; href: string }[];
  status?: string;                              // shown as a pill beside the name
  stack: string[];                              // every technology the project uses, from its build files
  architecture?: "raastapay" | "kanbanassist";  // adds a "View architecture" button
};

export const projects: Project[] = [
  {
    date: "Soon",
    name: "KanbanAssist",
    summary: "An AI assistant that finds similar past tickets and drafts a root-cause\u00A0summary.",
    links: [],
    status: "In development",
    architecture: "kanbanassist",
    stack: [
      "Java 25", "Spring Boot 4.1", "Spring AI 2.0", "Spring AI MCP Client", "Model Context Protocol",
      "Azure DevOps MCP Server", "Azure DevOps Service Hooks", "Ollama", "Qwen3 4B", "nomic-embed-text",
      "Anthropic Claude", "PostgreSQL 16", "pgvector", "Hibernate Vector", "Spring Data JPA", "Spring JDBC",
      "Flyway", "Apache Kafka 4 (KRaft)", "OpenTelemetry", "Langfuse", "Spring Boot Actuator",
      "Cloudflare Tunnel", "Docker Compose", "NVIDIA GPU (WSL2)", "React 19", "TypeScript", "Vite",
      "Tailwind CSS", "shadcn/ui", "assistant-ui", "Zustand", "Maven", "JUnit 5", "Python",
    ],
  },
  {
    date: "Mar 2026",
    name: "jamna.nn",
    summary: "A small transformer language model, built from scratch in pure\u00A0Java.",
    links: [
      { label: "GitHub", href: "https://github.com/vishnu-vardhan-d/jamna.nn" },
      { label: "Docs", href: "https://vishnu-vardhan-d.github.io/jamna.nn/" },
    ],
    stack: ["Java 11", "Pure Java, no libraries", "JUnit 5", "Maven", "GitHub Actions", "GitHub Pages"],
  },
  {
    date: "Nov 2025",
    name: "options-wall-street",
    summary: "Personal tooling for options\u00A0analysis.",
    links: [{ label: "GitHub", href: "https://github.com/vishnu-vardhan-d/options-wall-street" }],
    stack: [
      "Java 25", "Spring Boot 4.0", "Spring WebFlux", "Spring Security", "OAuth 2.0", "Spring Data JPA",
      "Flyway", "PostgreSQL", "H2", "Apache Kafka", "Spring AI", "Anthropic Claude", "Spring AI MCP Server",
      "Robinhood MCP", "JDA (Discord)", "ArchUnit", "Next.js 16", "React 18", "TypeScript", "Tailwind CSS",
      "Lightweight Charts", "Pine Script", "Docker", "Azure", "Bicep", "Maven", "GitHub Actions",
    ],
  },
  {
    date: "2023",
    name: "RaastaPay",
    summary: "An AI advisory platform for small trucking operators in\u00A0India.",
    links: [
      { label: "Website", href: "https://raastapay.in" },
      { label: "Docs", href: "https://raastapay.in/docs" },
    ],
    status: "MVP",
    architecture: "raastapay",
    stack: [
      "Java 25", "Spring Boot 4.1", "Spring AI 2.0", "Anthropic Claude", "Spring for Apache Kafka",
      "Apache Kafka 4.3 (KRaft)", "Kafdrop", "PostgreSQL 16", "pgAdmin", "Spring Data JPA", "Hibernate",
      "Spring JDBC", "Flyway", "Spring Security", "Docker Compose", "Maven", "JUnit 5", "GitHub Actions",
      "GitHub Pages",
    ],
  },
];

// Add an entry here for each published article. href can point to a page on this site or an external post.
export const articles: { title: string; href: string; date: string; summary: string }[] = [
  {
    title: "Ollama on a 4 GB GPU vs Claude: When a Local Model Stops Being Enough",
    href: "/blog/ollama-or-claude",
    date: "Oct 2026",
    summary: "I ran my RCA assistant with Ollama on a 4 GB laptop GPU, measured where it ran out, and moved its reasoning to Claude while keeping embeddings\u00A0local.",
  },
  {
    title: "Counting Visitors on a Static Site",
    href: "/blog/counting-visitors-on-a-static-site",
    date: "Oct 2026",
    summary: "Why a site on GitHub Pages can't count its own readers, and how a Cloudflare Worker and a key-value store count them without storing a single IP address.",
  },
  {
    title: "Running an Open-Source LLM on My Own GPU",
    href: "/blog/run-an-llm-on-your-own-gpu",
    date: "Oct 2026",
    summary: "A 4-billion-parameter evaluator model on a 4 GB laptop GPU with Ollama, Docker and Spring Boot: why only 80% of it fit, and where each of the 9.8 seconds of one answer went.",
  },
  {
    title: "Publishing a Home Server Through a Cloudflare Tunnel",
    href: "/blog/publishing-a-home-server",
    date: "Oct 2026",
    summary: "How an application on a home computer became reachable from the internet without opening a router\u00A0port, and every error met along the way with its\u00A0fix.",
  },
  {
    title: "Why @Service on a method won't compile",
    href: "/blog/spring-service-annotation",
    date: "Aug 2026",
    summary: "Spring from first principles, part\u00A01: what a stereotype annotation really is, and the five steps from a class file to a\u00A0bean.",
  },
  {
    title: "Attention in pure Java, with real numbers",
    href: "/blog/attention-in-pure-java",
    date: "Jul 2026",
    summary: "The formula from \"Attention Is All You Need\", computed by hand for three tokens, then written as one Java\u00A0method.",
  },
];

export const watches = [
  { title: "The Java Story", speaker: "The Official Documentary", href: "https://www.youtube.com/watch?v=ZqGSg4b_cZA&t=2653s" },
  { title: "How a Group of Developers Took Back Control from Enterprise Java", speaker: "Spring: The Documentary", href: "https://www.youtube.com/watch?v=0Gb1z-2SjHY" },
];

export const principles = [
  "Make the requirements less dumb",
  "Delete the part or process step",
  "Simplify or optimize",
  "Accelerate cycle time",
  "Automate",
];
