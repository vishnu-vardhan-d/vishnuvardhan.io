import styles from "./GitHubStats.module.css";

// Both cards are images generated live by public services from GitHub's data
// and refreshed every few hours, so they never go stale.
export default function GitHubStats({ user }: { user: string }) {
  const stats =
    `https://github-readme-stats.vercel.app/api?username=${user}` +
    "&show_icons=true&include_all_commits=true&hide_rank=true&hide=issues,contribs" +
    "&hide_border=true&bg_color=f6f7f9&title_color=1a4fb4&icon_color=1a4fb4&text_color=333333";
  const streak =
    `https://streak-stats.demolab.com?user=${user}` +
    "&hide_border=true&background=f6f7f9&ring=1a4fb4&fire=1a4fb4&currStreakNum=333333" +
    "&sideNums=333333&currStreakLabel=1a4fb4&sideLabels=6b6b6b&dates=6b6b6b";

  return (
    <a className={styles.cards} href={`https://github.com/${user}`} aria-label="GitHub activity">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={stats} alt="GitHub stats: stars, commits and pull requests" loading="lazy" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={streak} alt="GitHub contributions and streak" loading="lazy" />
    </a>
  );
}
