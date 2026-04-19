export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PublicGraphSummary {
  total_public_agents: number;
  total_public_contexts: number;
  active_subscriptions?: number;
}
