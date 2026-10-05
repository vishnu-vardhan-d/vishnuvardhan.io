import styles from "./Timeline.module.css";
export type Entry = { when: string; title: string; org: string; body?: string };

export default function Timeline({ entries }: { entries: Entry[] }) {
  return (
    <div className={styles.list}>
      {entries.map((e) => (
        <div className={styles.entry} key={e.when + e.title}>
          <div className={styles.when}>{e.when}</div>
          <div>
            <h3 className={styles.title}>
              {e.title}
              <span className={styles.org}>{e.org}</span>
            </h3>
            {e.body && <p className={styles.body}>{e.body}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
