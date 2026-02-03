import styles from "./page.module.css";
import { createSupabaseClient } from "@/lib/supabase/supabase";

export default async function Home() {
  const { client, missing } = createSupabaseClient();

  let healthcheck:
    | { ok: true; note: string }
    | { ok: false; note: string; error?: string } = {
    ok: false,
    note: "Supabase not configured yet.",
  };

  if (client) {
    const { error } = await client.from("healthcheck").select("*").limit(1);

    if (error) {
      healthcheck = {
        ok: false,
        note: 'Could not query table "healthcheck" (this is OK if it does not exist yet).',
        error: error.message,
      };
    } else {
      healthcheck = { ok: true, note: 'Query to table "healthcheck" succeeded.' };
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>n8n-mcp-ai (base)</h1>
          <p>
            Proyecto listo para empezar. Configura Supabase en{" "}
            <code>.env.local</code> (ver <code>.env.example</code>) y esta página
            validará la conexión.
          </p>
          {!client ? (
            <p>
              Missing env vars: <code>{missing.join(", ")}</code>
            </p>
          ) : (
            <p>
              Supabase configured: <strong>yes</strong>
            </p>
          )}
          <p>
            Healthcheck:{" "}
            <strong>{healthcheck.ok ? "OK" : "NOT OK"}</strong> —{" "}
            {healthcheck.note}
            {"error" in healthcheck && healthcheck.error ? (
              <>
                {" "}
                (<code>{healthcheck.error}</code>)
              </>
            ) : null}
          </p>
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Supabase Dashboard
          </a>
          <a
            className={styles.secondary}
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js Docs
          </a>
        </div>
      </main>
    </div>
  );
}
