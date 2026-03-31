import { useState, useId } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  FANDOM_TENURE_OPTIONS,
  FAVORITE_PLAYER_OPTIONS,
  MANAGEMENT_INTEREST_OPTIONS,
  ROCKETS_TRAJECTORY_OPTIONS,
  type SurveyResponse,
} from "@/types/survey";

interface FormErrors {
  fandom_tenure?: string;
  favorite_player?: string;
  management_interests?: string;
  rockets_trajectory?: string;
  gm_priority?: string;
}

interface ThankYouData {
  fandom_tenure: string;
  favorite_player: string;
  management_interests: string[];
  rockets_trajectory: string;
  gm_priority: string;
}

function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Survey() {
  const uid = useId();
  const [formData, setFormData] = useState<SurveyResponse>({
    fandom_tenure: "",
    favorite_player: "",
    management_interests: [],
    rockets_trajectory: "",
    gm_priority: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [thankYouData, setThankYouData] = useState<ThankYouData | null>(null);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.fandom_tenure) errs.fandom_tenure = "Please select how long you have followed the NBA.";
    if (!formData.favorite_player) errs.favorite_player = "Please select your favorite player.";
    if (formData.management_interests.length === 0)
      errs.management_interests = "Please select at least one area of interest.";
    if (!formData.rockets_trajectory)
      errs.rockets_trajectory = "Please rate the Rockets' current trajectory.";
    if (!formData.gm_priority.trim())
      errs.gm_priority = "Please describe your offseason priority.";
    return errs;
  }

  function firstFocusableId(field: string): string {
    if (field === "fandom_tenure") return `${uid}-fandom_tenure-${toSlug(FANDOM_TENURE_OPTIONS[0])}`;
    if (field === "management_interests") return `${uid}-interest-${toSlug(MANAGEMENT_INTEREST_OPTIONS[0])}`;
    if (field === "rockets_trajectory") return `${uid}-rockets_trajectory-${toSlug(ROCKETS_TRAJECTORY_OPTIONS[0])}`;
    return `${uid}-${field}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorField = Object.keys(errs)[0];
      const el = document.getElementById(firstFocusableId(firstErrorField));
      el?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("survey_responses").insert([
      {
        fandom_tenure: formData.fandom_tenure,
        favorite_player: formData.favorite_player,
        management_interests: formData.management_interests,
        rockets_trajectory: formData.rockets_trajectory,
        gm_priority: formData.gm_priority.trim(),
      },
    ]);

    setSubmitting(false);

    if (error) {
      setSubmitError(
        "Something went wrong submitting your response. Please try again.",
      );
      return;
    }

    setThankYouData({
      fandom_tenure: formData.fandom_tenure,
      favorite_player: formData.favorite_player,
      management_interests: formData.management_interests,
      rockets_trajectory: formData.rockets_trajectory,
      gm_priority: formData.gm_priority.trim(),
    });
  }

  function handleCheckboxChange(option: string, checked: boolean) {
    setFormData((prev) => ({
      ...prev,
      management_interests: checked
        ? [...prev.management_interests, option]
        : prev.management_interests.filter((o) => o !== option),
    }));
  }

  if (thankYouData) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="border-b border-gray-200 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <span className="font-semibold text-[#1a1a1a]">NBA Survey</span>
            <Link
              href="/results"
              className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
              style={{ color: "#CE1141", outlineColor: "#CE1141" }}
            >
              View Results
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "#fde8ec" }}>
                <svg className="w-8 h-8" style={{ color: "#CE1141" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Thank You!</h1>
              <p className="text-[#555]">Your response has been submitted.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 space-y-5">
              <h2 className="font-semibold text-[#1a1a1a] text-lg border-b border-gray-200 pb-3">Your Answers</h2>

              <div>
                <p className="text-sm font-medium text-[#666] mb-1">How long have you followed the NBA?</p>
                <p className="text-[#1a1a1a]">{thankYouData.fandom_tenure}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-[#666] mb-1">Favorite player to watch</p>
                <p className="text-[#1a1a1a]">{thankYouData.favorite_player}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-[#666] mb-1">Team management interests</p>
                <ul className="list-disc list-inside text-[#1a1a1a] space-y-0.5">
                  {thankYouData.management_interests.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium text-[#666] mb-1">Rockets trajectory</p>
                <p className="text-[#1a1a1a]">{thankYouData.rockets_trajectory}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-[#666] mb-1">GM offseason priority</p>
                <p className="text-[#1a1a1a]">{thankYouData.gm_priority}</p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/results"
                className="inline-block px-8 py-3 rounded-lg text-white font-semibold text-base transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: "#CE1141", outlineColor: "#CE1141" }}
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-semibold text-[#1a1a1a]">NBA Survey</span>
          <Link
              href="/results"
              className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
              style={{ color: "#CE1141", outlineColor: "#CE1141" }}
            >
              View Results
            </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">NBA Fandom Survey</h1>
          <p className="text-[#555] mb-8">All fields are required. Your responses are anonymous.</p>

          {submitError && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-lg border text-sm"
              style={{ backgroundColor: "#fde8ec", borderColor: "#CE1141", color: "#7a0a22" }}
            >
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-10">
            {/* Q1 */}
            <fieldset aria-describedby={errors.fandom_tenure ? `${uid}-fandom_tenure-error` : undefined}>
              <legend className="text-base font-semibold text-[#1a1a1a] mb-3">
                1. How long have you actively followed the NBA?
                <span className="ml-1 text-sm font-normal text-[#666]">(required)</span>
              </legend>
              <div className="space-y-2">
                {FANDOM_TENURE_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      id={`${uid}-fandom_tenure-${toSlug(option)}`}
                      name="fandom_tenure"
                      value={option}
                      checked={formData.fandom_tenure === option}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fandom_tenure: e.target.value }))
                      }
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: "#CE1141" }}
                      aria-invalid={!!errors.fandom_tenure}
                      aria-describedby={errors.fandom_tenure ? `${uid}-fandom_tenure-error` : undefined}
                    />
                    <span className="text-[#1a1a1a] group-hover:text-[#CE1141] transition-colors">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              {errors.fandom_tenure && (
                <p
                  id={`${uid}-fandom_tenure-error`}
                  role="alert"
                  className="mt-2 text-sm font-medium"
                  style={{ color: "#CE1141" }}
                >
                  {errors.fandom_tenure}
                </p>
              )}
            </fieldset>

            {/* Q2 */}
            <div>
              <label
                htmlFor={`${uid}-favorite_player`}
                className="block text-base font-semibold text-[#1a1a1a] mb-3"
              >
                2. Who is your favorite player to watch?
                <span className="ml-1 text-sm font-normal text-[#666]">(required)</span>
              </label>
              <select
                id={`${uid}-favorite_player`}
                name="favorite_player"
                value={formData.favorite_player}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, favorite_player: e.target.value }))
                }
                aria-describedby={errors.favorite_player ? `${uid}-favorite_player-error` : undefined}
                aria-invalid={!!errors.favorite_player}
                className="w-full max-w-sm border rounded-lg px-3 py-2 text-[#1a1a1a] bg-white focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.favorite_player ? "#CE1141" : "#d1d5db",
                  outlineColor: "#CE1141",
                }}
              >
                <option value="">Select a player</option>
                {FAVORITE_PLAYER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.favorite_player && (
                <p
                  id={`${uid}-favorite_player-error`}
                  role="alert"
                  className="mt-2 text-sm font-medium"
                  style={{ color: "#CE1141" }}
                >
                  {errors.favorite_player}
                </p>
              )}
            </div>

            {/* Q3 */}
            <fieldset aria-describedby={errors.management_interests ? `${uid}-management_interests-error` : undefined}>
              <legend className="text-base font-semibold text-[#1a1a1a] mb-3">
                3. Which aspects of NBA team management interest you the most?
                <span className="ml-1 text-sm font-normal text-[#666]">(select all that apply, required)</span>
              </legend>
              <div className="space-y-2">
                {MANAGEMENT_INTEREST_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      id={`${uid}-interest-${toSlug(option)}`}
                      name="management_interests"
                      value={option}
                      checked={formData.management_interests.includes(option)}
                      onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: "#CE1141" }}
                      aria-invalid={!!errors.management_interests}
                      aria-describedby={errors.management_interests ? `${uid}-management_interests-error` : undefined}
                    />
                    <span className="text-[#1a1a1a] group-hover:text-[#CE1141] transition-colors">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              {errors.management_interests && (
                <p
                  id={`${uid}-management_interests-error`}
                  role="alert"
                  className="mt-2 text-sm font-medium"
                  style={{ color: "#CE1141" }}
                >
                  {errors.management_interests}
                </p>
              )}
            </fieldset>

            {/* Q4 */}
            <fieldset aria-describedby={errors.rockets_trajectory ? `${uid}-rockets_trajectory-error` : undefined}>
              <legend className="text-base font-semibold text-[#1a1a1a] mb-3">
                4. How would you rate the current trajectory of the Houston Rockets?
                <span className="ml-1 text-sm font-normal text-[#666]">(required)</span>
              </legend>
              <div className="space-y-2">
                {ROCKETS_TRAJECTORY_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      id={`${uid}-rockets_trajectory-${toSlug(option)}`}
                      name="rockets_trajectory"
                      value={option}
                      checked={formData.rockets_trajectory === option}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, rockets_trajectory: e.target.value }))
                      }
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: "#CE1141" }}
                      aria-invalid={!!errors.rockets_trajectory}
                      aria-describedby={errors.rockets_trajectory ? `${uid}-rockets_trajectory-error` : undefined}
                    />
                    <span className="text-[#1a1a1a] group-hover:text-[#CE1141] transition-colors">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              {errors.rockets_trajectory && (
                <p
                  id={`${uid}-rockets_trajectory-error`}
                  role="alert"
                  className="mt-2 text-sm font-medium"
                  style={{ color: "#CE1141" }}
                >
                  {errors.rockets_trajectory}
                </p>
              )}
            </fieldset>

            {/* Q5 */}
            <div>
              <label
                htmlFor={`${uid}-gm_priority`}
                className="block text-base font-semibold text-[#1a1a1a] mb-3"
              >
                5. If you were the General Manager, what specific trade scenario or roster move would you prioritize this offseason and why?
                <span className="ml-1 text-sm font-normal text-[#666]">(required)</span>
              </label>
              <textarea
                id={`${uid}-gm_priority`}
                name="gm_priority"
                value={formData.gm_priority}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gm_priority: e.target.value }))
                }
                placeholder="e.g., I would trade for a veteran rim protector..."
                rows={5}
                autoFocus
                aria-describedby={errors.gm_priority ? `${uid}-gm_priority-error` : undefined}
                aria-invalid={!!errors.gm_priority}
                className="w-full border rounded-lg px-3 py-2 text-[#1a1a1a] bg-white resize-y focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.gm_priority ? "#CE1141" : "#d1d5db",
                  outlineColor: "#CE1141",
                }}
              />
              {errors.gm_priority && (
                <p
                  id={`${uid}-gm_priority-error`}
                  role="alert"
                  className="mt-2 text-sm font-medium"
                  style={{ color: "#CE1141" }}
                >
                  {errors.gm_priority}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-lg text-white font-semibold text-base transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#CE1141", outlineColor: "#CE1141" }}
              >
                {submitting ? "Submitting..." : "Submit Survey"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-4 px-4 text-center text-sm text-[#666]">
        Survey by Ryder Rietz, BAIS:3300 - Spring 2026.
      </footer>
    </div>
  );
}
