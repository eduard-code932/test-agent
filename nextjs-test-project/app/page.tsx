import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Next.js Sandbox</h1>
        <p>
          This lightweight project is ready for feature experiments and CI
          validation with TypeScript and the App Router.
        </p>
      </main>
    </div>
  );
}
