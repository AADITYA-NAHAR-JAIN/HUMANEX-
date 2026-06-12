export type Challenge = {
  id: string;
  kind: "blink_twice" | "turn_left";
  prompt: string;
  window_hint: string;
};

export type VerifyPayload = {
  frames: string[];
  challenge_id?: string;
};

export type VerifyResult = {
  human_score: number;
  status: string;
  blink_count: number;
  movement_count: number;
  challenge_passed: boolean;
  spoof_suspected: boolean;
};

function baseUrl() {
  const env = import.meta.env.VITE_API_URL;
  return env && env.length > 0 ? env : "";
}

export async function fetchChallenge(): Promise<Challenge> {
  const res = await fetch(`${baseUrl()}/api/challenge`);
  if (!res.ok) throw new Error(`challenge failed: ${res.status}`);
  return (await res.json()) as Challenge;
}

export async function verifyBurst(payload: VerifyPayload): Promise<VerifyResult> {
  const res = await fetch(`${baseUrl()}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`verify failed: ${res.status}`);
  return (await res.json()) as VerifyResult;
}
