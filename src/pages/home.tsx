import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <div
            className="inline-block mb-6 px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: "#fde8ec", color: "#CE1141" }}
          >
            BAIS:3300 &mdash; Spring 2026
          </div>

          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4 leading-tight">
            NBA Fandom &amp; Team Building Strategy Survey
          </h1>

          <p className="text-lg text-[#555] mb-10 leading-relaxed">
            Share your perspective on roster construction, salary cap strategy,
            and the current trajectory of the Houston Rockets. Takes about 2
            minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/survey"
              className="w-full sm:w-auto inline-block text-center px-8 py-3 rounded-lg text-white font-semibold text-base transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: "#CE1141", outlineColor: "#CE1141" }}
            >
              Take the Survey
            </Link>

            <Link
              href="/results"
              className="w-full sm:w-auto inline-block text-center px-8 py-3 rounded-lg font-semibold text-base border-2 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                color: "#CE1141",
                borderColor: "#CE1141",
                outlineColor: "#CE1141",
              }}
            >
              View Results
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-4 px-4 text-center text-sm text-[#666]">
        Survey by Ryder Rietz, BAIS:3300 - Spring 2026.
      </footer>
    </div>
  );
}
