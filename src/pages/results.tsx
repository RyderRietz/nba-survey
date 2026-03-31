import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabase";
import {
  FANDOM_TENURE_OPTIONS,
  FAVORITE_PLAYER_OPTIONS,
  ROCKETS_TRAJECTORY_OPTIONS,
  type SurveyResponse,
} from "@/types/survey";

const ROCKETS_RED = "#CE1141";
const PIE_COLORS = ["#CE1141", "#e84d6c", "#f0889e", "#f5b3bf", "#7a0a22"];

function countBy<T extends string>(
  rows: SurveyResponse[],
  key: keyof SurveyResponse,
  options: readonly T[],
): { name: string; count: number }[] {
  return options.map((opt) => ({
    name: opt,
    count: rows.filter((r) => r[key] === opt).length,
  }));
}


export default function Results() {
  const [rows, setRows] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error: supaError } = await supabase
        .from("survey_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (supaError) {
        setError("Unable to load results. Please try again later.");
      } else {
        setRows(data ?? []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const tenureData = countBy(rows, "fandom_tenure", FANDOM_TENURE_OPTIONS);
  const playerData = countBy(rows, "favorite_player", FAVORITE_PLAYER_OPTIONS)
    .sort((a, b) => b.count - a.count);
  const trajectoryData = countBy(rows, "rockets_trajectory", ROCKETS_TRAJECTORY_OPTIONS);
  const recentSuggestions = rows.slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="font-semibold text-[#1a1a1a]">Survey Results</span>
          <Link
              href="/"
              className="inline-block px-4 py-2 rounded-lg font-medium text-sm border-2 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ color: "#CE1141", borderColor: "#CE1141", outlineColor: "#CE1141" }}
            >
              Home
            </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Aggregated Responses</h1>
          <p className="text-[#555] mb-10">Charts show aggregated, anonymous totals. Recent GM suggestions are shown as anonymous text excerpts below.</p>

          {loading && (
            <div className="flex items-center justify-center py-24" aria-live="polite" aria-busy="true">
              <div
                className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: "#CE1141", borderTopColor: "transparent" }}
                role="status"
              >
                <span className="sr-only">Loading results...</span>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="p-4 rounded-lg border text-sm mb-8" style={{ backgroundColor: "#fde8ec", borderColor: "#CE1141", color: "#7a0a22" }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-12">
              {/* Total Responses */}
              <section aria-labelledby="total-heading">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                  <p className="text-sm font-medium text-[#666] mb-2" id="total-heading">Total Responses</p>
                  <p className="text-7xl font-bold" style={{ color: "#CE1141" }}>
                    {rows.length}
                  </p>
                </div>
              </section>

              {rows.length === 0 && (
                <p className="text-center text-[#666] py-8">No responses yet. Be the first to take the survey!</p>
              )}

              {rows.length > 0 && (
                <>
                  {/* Q1 - Fandom Tenure */}
                  <section aria-labelledby="tenure-heading">
                    <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6" id="tenure-heading">
                      How long have fans followed the NBA?
                    </h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6" style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tenureData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#555", fontSize: 12 }}
                            tickLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fill: "#555", fontSize: 12 }}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                            labelStyle={{ fontWeight: 600, color: "#1a1a1a" }}
                          />
                          <Bar dataKey="count" name="Responses" fill={ROCKETS_RED} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  {/* Q2 - Favorite Player */}
                  <section aria-labelledby="player-heading">
                    <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6" id="player-heading">
                      Favorite player to watch
                    </h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6" style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={playerData}
                          layout="vertical"
                          margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{ fill: "#555", fontSize: 12 }}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: "#555", fontSize: 12 }}
                            tickLine={false}
                            width={95}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                            labelStyle={{ fontWeight: 600, color: "#1a1a1a" }}
                          />
                          <Bar dataKey="count" name="Responses" fill={ROCKETS_RED} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  {/* Q4 - Rockets Trajectory */}
                  <section aria-labelledby="trajectory-heading">
                    <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6" id="trajectory-heading">
                      Rockets trajectory ratings
                    </h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6" style={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={trajectoryData}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            label={({ name, percent }) =>
                              percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""
                            }
                            labelLine={false}
                          >
                            {trajectoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                            formatter={(value: number) => [value, "Responses"]}
                          />
                          <Legend
                            formatter={(value) => (
                              <span style={{ color: "#1a1a1a", fontSize: 12 }}>{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  {/* Q5 - Recent GM Suggestions */}
                  <section aria-labelledby="suggestions-heading">
                    <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6" id="suggestions-heading">
                      Recent GM suggestions
                    </h2>
                    <div
                      className="bg-gray-50 border border-gray-200 rounded-xl overflow-y-auto"
                      style={{ maxHeight: 400 }}
                      tabIndex={0}
                      aria-label="Scrollable list of recent GM suggestions"
                    >
                      {recentSuggestions.map((row, idx) => (
                        <div
                          key={row.id ?? idx}
                          className={`px-6 py-4 text-[#1a1a1a] text-sm leading-relaxed ${
                            idx < recentSuggestions.length - 1 ? "border-b border-gray-200" : ""
                          }`}
                        >
                          <span
                            className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mr-2 align-middle"
                            style={{ backgroundColor: "#fde8ec", color: "#CE1141" }}
                            aria-label={`Response ${idx + 1}`}
                          >
                            #{idx + 1}
                          </span>
                          {row.gm_priority}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-4 px-4 text-center text-sm text-[#666]">
        Survey by Ryder Rietz, BAIS:3300 - Spring 2026.
      </footer>
    </div>
  );
}
