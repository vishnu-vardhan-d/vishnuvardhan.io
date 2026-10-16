
import Image from "next/image";
import portrait from "@/public/assets/portrait.png";
import styles from "./page.module.css";
import VisitCounter from "@/components/VisitCounter";
import SocialIcons from "@/components/SocialIcons";
import SkillChips from "@/components/SkillChips";
import { profile, skills, projects, articles, watches } from "@/content/profile";

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <p className={styles.location}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>
          {profile.location}
        </p>
        <div className={styles.headerInner}>
          <Image className={styles.photo} src={portrait} alt="Vishnu Vardhan" width={240} height={240} priority />
          <div className={styles.identity}>
            <h1 className={styles.name}>{profile.name}</h1>
            <p className={styles.title}>Software Engineer</p>
            <p className={styles.role}>{profile.tagline}</p>
            <SocialIcons links={profile.links} />
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <section>
          <h2>About</h2>
          <p>
            I am a Computer Science graduate and senior Java software engineer in a hands-on Java
            engineering role, where I own system design and architecture decisions, write code every
            day, and modernize enterprise systems with modern Java&nbsp;and&nbsp;AI.
          </p>
          <p>
            My career started in start-ups, writing code before tools like ChatGPT existed. Start-up
            culture taught me ownership, speed and how to stay calm when a live
            system&nbsp;breaks.
          </p>
          <p>
            I love coding every day, and I never stop building. My philosophy is that
            AI is not only a Python story, which is why I closely follow Rod Johnson, the creator of Spring,
            and his work on{" "}
            <a href="https://github.com/embabel/embabel-agent">Embabel</a>, an agentic AI framework for&nbsp;the&nbsp;JVM.
          </p>
        </section>

        <section>
          <h2>Skills</h2>
          <SkillChips skills={skills} />
        </section>

        <section>
          <h2>Projects</h2>
          <div className={styles.tl}>
            {projects.map((p) => (
              <div className={styles.tlRow} key={p.name}>
                <div className={styles.tlDate}>{p.date}</div>
                <div className={styles.tlBody}>
                  <div className={styles.tlTitle}>
                    <b>{p.name}</b>
                    {p.links.map((l) => (
                      <a key={l.href} className={styles.projLink} href={l.href}>{l.label}</a>
                    ))}
                  </div>
                  <p>{p.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Articles</h2>
          <div className={styles.tl}>
            {articles.map((a) => (
              <div className={styles.tlRow} key={a.href}>
                <div className={styles.tlDate}>{a.date}</div>
                <div className={styles.tlBody}>
                  <div className={styles.tlTitle}><a href={a.href}>{a.title}</a></div>
                  <p>{a.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Favorite Watches</h2>
          <ul className={styles.watches}>
            {watches.map((w) => (
              <li key={w.href}>
                <a href={w.href}>{w.title}</a> <span className={styles.date}>{w.speaker}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className={styles.footer}>
          <VisitCounter />
        </footer>
      </main>
    </>
  );
}
