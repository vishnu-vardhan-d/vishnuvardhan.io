const JAVA_SINCE = 2013;

export const profile = {
  name: "Vishnu Vardhan",
  tagline: "Engineering complex enterprise systems, architecting start-up innovations, and writing code every day.",
  location: "Dallas–Fort Worth, Texas",
  email: "vishnu.vardhan.darshi@gmail.com",
  javaSince: JAVA_SINCE,
  years: new Date().getFullYear() - JAVA_SINCE,
  links: [
    { label: "GitHub", href: "https://github.com/vishnu-vardhan-d" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/vishnu-vardhan-94832b53" },
    { label: "Email", href: "mailto:vishnu.vardhan.darshi@gmail.com" },
  ],
};

export type Entry = { when: string; title: string; org: string; body?: string };

export const work: Entry[] = [
  {
    when: "2021 – Current",
    title: "Ness",
    org: "Senior Solutions Engineer",
    body: "Lead developer on a statewide healthcare and benefits platform. I own change requests end to end, from requirements with policy teams to production release. I own the three annual federal policy cycles that re-evaluate every active case. I re-engineered the nightly interface chain to federal and partner systems and restored reliable overnight windows.",
  },
  {
    when: "2014 – 2021",
    title: "Accenture",
    org: "Application Development Lead",
    body: "Seven years on a statewide healthcare and family-services platform built on the Accenture Public Service Platform, replacing systems the state had run for 24 years. Led a team of developers through delivery, testing and deployment. Rebuilt the state's master person index as sole architect and developer, from program-level risk to meeting requirements, reporting daily to state leadership while the system stayed live.",
  },
  {
    when: "2014",
    title: "24x7booking.com",
    org: "Software Engineer",
    body: "Sole developer for the flight-booking module of a live travel platform in Bangalore, from design through production.",
  },
  {
    when: "2013 – 2014",
    title: "Schemes Central",
    org: "Software Engineer",
    body: "Full-stack engineer on a production e-commerce platform: page flows, front-end features, deployments and platform upgrades, all live.",
  },
];

export const ventures: Entry[] = [
  {
    when: "2023 – Current",
    title: "RaastaPay",
    org: "Principal Engineer & Systems Architect",
    body: "Sole engineer building a founder's AI advisory product for small trucking operators in India. The system of record does the arithmetic; a panel of Claude-backed advisors on Spring AI reads each offer and returns a verdict in the driver's own language. Every AI output is schema-checked, persisted and auditable. Java 21, Spring Boot, Kafka, PostgreSQL, React Native.",
  },
];

export const projects = [
  {
    name: "jamna.nn",
    href: "https://github.com/vishnu-vardhan-d/jamna.nn",
    blurb: "A mini Transformer / LLM engine built from scratch in pure Java, no libraries, not even a math one. It learns to sort numbers the way a language model learns to write, by predicting the next token. Ships with an interactive explainer that walks through embeddings, attention and softmax using the real trained weights. MIT.",
  },
  {
    name: "options-wall-street",
    href: "https://github.com/vishnu-vardhan-d/options-wall-street",
    blurb: "Personal tooling for options analysis. Not a product and not financial advice.",
  },
];

export const contributing = [
  { name: "Spring AI", href: "https://github.com/spring-projects/spring-ai" },
  { name: "Tribuo", href: "https://github.com/oracle/tribuo" },
];

