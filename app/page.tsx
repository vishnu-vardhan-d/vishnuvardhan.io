import Image from "next/image";
import portrait from "@/public/assets/portrait.png";
import styles from "./page.module.css";
import CodeCard from "@/components/CodeCard";
import Timeline from "@/components/Timeline";
import VisitCounter from "@/components/VisitCounter";
import { profile, work, ventures, projects, contributing } from "@/content/profile";

export default function Home() {
  return (
    <main className={styles.page}>
      <aside className={styles.aside}>
        <Image className={styles.photo} src={portrait} alt="Vishnu Vardhan" width={160} height={160} priority />
        <h1>{profile.name}</h1>
        <p className={styles.role}>{profile.tagline}</p>
        <nav className={styles.links} aria-label="Profiles">
          {profile.links.map((l) => (
            <a key={l.label} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <CodeCard />
        <p className={styles.cv}>{profile.location}</p>
        <VisitCounter />
      </aside>

      <div className={styles.content}>
        <section>
          <h2>Now</h2>
          <p>
            I have spent twelve years building the enterprise platforms that pay healthcare and family
            benefits to hundreds of thousands of people in the United States. Work at that scale has one
            rule: a wrong rule or a missed batch window is a public failure. I have led development teams,
            carried the annual federal policy changes that re-evaluate every active case, and rebuilt a
            statewide data-governance platform as its sole architect and developer.
          </p>
          <p>
            Outside that work I design and build systems for start-ups.{" "}
            <a href="https://raastapay.in">RaastaPay</a>, an AI advisory platform for Indian road freight,
            is the current one: Java 21, Spring Boot, Spring AI and Kafka, built alone from the first
            commit. <a href={projects[0].href}>jamna.nn</a> is my transformer engine in pure Java, written
            to understand the machinery from the inside.
          </p>
          <p>
            AI engineering is not a Python monopoly. The systems that carry real money and real records
            run on Java, and Spring AI puts language models where those systems already live, with typed
            contracts, transactions, observability and the same test discipline as everything else. That is
            where I am placing my bet. I am exploring{" "}
            <a href="https://github.com/embabel/embabel-agent">Embabel</a>, Rod Johnson&apos;s agentic
            framework for the JVM built on Spring AI, and preparing to be part of the rise of Spring AI
            rather than watch it from the sidelines.
          </p>
          <p>
            I build from first principles and I write all the code. Language models help me move faster;
            they do not think for me.
          </p>
        </section>

        <section>
          <h2>Work</h2>
          <Timeline entries={work} />
        </section>

        <section>
          <h2>Entrepreneurship</h2>
          <Timeline entries={ventures} />
        </section>

        <section>
          <h2>Currently building</h2>
          <dl>
            {projects.map((p) => (
              <div key={p.name}>
                <dt><a href={p.href}>{p.name}</a></dt>
                <dd>{p.blurb}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.contrib}>
            Also working in forks of{" "}
            {contributing.map((c, i) => (
              <span key={c.name}>
                <a href={c.href}>{c.name}</a>{i < contributing.length - 1 ? " and " : ""}
              </span>
            ))}
            , with contributions in progress.
          </p>
        </section>

      </div>
    </main>
  );
}
