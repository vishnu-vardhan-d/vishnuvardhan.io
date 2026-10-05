import styles from "./CodeCard.module.css";

const K = ({ children }: { children: React.ReactNode }) => <span className={styles.kw}>{children}</span>;
const T = ({ children }: { children: React.ReactNode }) => <span className={styles.ty}>{children}</span>;
const S = ({ children }: { children: React.ReactNode }) => <span className={styles.st}>{children}</span>;
const A = ({ children }: { children: React.ReactNode }) => <span className={styles.an}>{children}</span>;
const C = ({ children }: { children: React.ReactNode }) => <span className={styles.cm}>{children}</span>;

export default function CodeCard() {
  return (
    <figure className={styles.card} aria-label="VishnuVardhan.java">
      <figcaption className={styles.caption}>VishnuVardhan.java</figcaption>
      <pre className={styles.pre}>
        <code>
<A>@Engineer</A>(of = <S>"enterprise healthcare"</S>){"\n"}
<A>@SystemsArchitect</A>(building = <S>"AI on the JVM"</S>){"\n"}
<K>public final class</K> <T>VishnuVardhan</T> <K>implements</K> <T>FirstPrinciples</T> {"{"}{"\n\n"}
{"  "}<A>@Builds</A>(with = {"{"} <T>SpringBoot</T>.<K>class</K>, <T>SpringAI</T>.<K>class</K>,{"\n"}
{"                  "}<T>Kafka</T>.<K>class</K>, <T>Postgres</T>.<K>class</K> {"}"}){"\n"}
{"  "}<T>Product</T> ship(<T>Idea</T> idea) {"{"}{"\n"}
{"    "}<K>return</K> understand(idea){"\n"}
{"        "}.design(<T>Simplest</T>.thingThatWorks()){"\n"}
{"        "}.write(<T>Code</T>.myself()){"\n"}
{"        "}.test().deploy();{"\n"}
{"  }"}{"\n\n"}
{"  "}<A>@Philosophy</A>{"\n"}
{"  "}<T>List</T>&lt;<T>String</T>&gt; onAI() {"{"}{"\n"}
{"    "}<K>return</K> <T>List</T>.of({"\n"}
{"      "}<S>"AI does not belong to Python."</S>,{"\n"}
{"      "}<S>"Spring AI brings it to where the enterprise runs."</S>);{"\n"}
{"  }"}{"\n"}
{"}"}
        </code>
      </pre>
    </figure>
  );
}
