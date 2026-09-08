import { createFacilitatorConfig } from "@coinbase/x402";
import type { FacilitatorConfig } from "@x402/core/http";

export const CDP_FACILITATOR_URL = "https://api.cdp.coinbase.com/platform/v2/x402";

export function facilitatorConfig(env: Pick<Env, "CDP_API_KEY_ID" | "CDP_API_KEY_SECRET">, url: string): FacilitatorConfig {
  // Non-CDP facilitators never receive CDP credentials.
  if (url !== CDP_FACILITATOR_URL) return { url };
  return {
    url,
    createAuthHeaders: async () => {
      if (!env.CDP_API_KEY_ID?.trim() || !env.CDP_API_KEY_SECRET?.trim()) {
        throw new Error("cdp_auth_not_configured");
      }
      const config = createFacilitatorConfig(env.CDP_API_KEY_ID, env.CDP_API_KEY_SECRET);
      try {
        return await config.createAuthHeaders!();
      } catch {
        throw new Error("cdp_auth_generation_failed");
      }
    }
  };
}
