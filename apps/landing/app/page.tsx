import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900 font-sans">
      <main className="mx-auto max-w-6xl px-6 py-20">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/next.svg"
              alt="Wetrack"
              width={36}
              height={36}
              className="dark:invert"
            />
            <span className="text-lg font-semibold">Wetrack</span>
          </div>
        </header>

        <section className="mt-12 grid grid-cols-1 items-center gap-10 rounded-2xl bg-white/70 p-8 shadow-md backdrop-blur-md dark:bg-black/60 sm:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-black dark:text-zinc-50">
              Your dashboards live in your repo
            </h1>
            <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-400">
              Hosted Dashboard-as-Code Plattform für Developer-first SaaS Teams.
            </p>

            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Dashboards that belong in your Git repo — we let developers define
              dashboards in code and deploy them like infrastructure.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#get-started"
                className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
              >
                Get started
              </a>
              <a
                href="#docs"
                className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50"
              >
                Docs & Examples
              </a>
            </div>
          </div>

          <div className="w-full">
            <div className="rounded-lg border border-black/5 bg-zinc-100 p-4 dark:border-white/5 dark:bg-[#071016]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  example/dashboard.ts
                </span>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs dark:bg-white/5">
                  YAML
                </span>
              </div>
              <pre className="max-h-48 overflow-auto rounded bg-white p-3 text-sm font-mono text-zinc-800 dark:bg-black dark:text-zinc-200">
                {`# dashboard.ts
export const dashboard = {
  title: "App health",
  panels: [
    { type: "line", query: "requests.count", title: "Requests" },
  ],
};`}
              </pre>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#071016]">
            <h3 className="mb-2 text-lg font-semibold">Versioned in Git</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Keep dashboards alongside app code — full history and PR review.
            </p>
          </div>

          <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#071016]">
            <h3 className="mb-2 text-lg font-semibold">Dashboards as Code</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Define charts, queries and layouts in simple, composable code.
            </p>
          </div>

          <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#071016]">
            <h3 className="mb-2 text-lg font-semibold">Deploy like infra</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Deploy dashboards via CI/CD, promote between environments, and
              monitor changes.
            </p>
          </div>
        </section>

        <footer className="mt-12 text-sm text-zinc-600 dark:text-zinc-500">
          Dashboards that belong in your Git repo — built for developers.
        </footer>
      </main>
    </div>
  );
}
