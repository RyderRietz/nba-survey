export interface SurveyResponse {
  id?: number;
  created_at?: string;
  fandom_tenure: string;
  favorite_player: string;
  management_interests: string[];
  rockets_trajectory: string;
  gm_priority: string;
}

export const FANDOM_TENURE_OPTIONS = [
  "Less than 1 year",
  "1\u20133 years",
  "4\u20137 years",
  "8+ years",
] as const;

export const FAVORITE_PLAYER_OPTIONS = [
  "Kevin Durant",
  "Alperen \u015eeng\u00fcn",
  "Jalen Green",
  "LeBron James",
  "Nikola Joki\u0107",
  "Other",
] as const;

export const MANAGEMENT_INTEREST_OPTIONS = [
  "Drafting and scouting rookies",
  "Trade scenarios and blockbusters",
  "Salary cap management",
  "Free agency signings",
  "On-court coaching and rotations",
] as const;

export const ROCKETS_TRAJECTORY_OPTIONS = [
  "Championship Contender",
  "Rising Threat",
  "Stuck in the Middle",
  "Rebuilding",
] as const;
