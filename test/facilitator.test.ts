import { describe, expect, it } from "vitest";
import { CDP_FACILITATOR_URL, facilitatorConfig } from "../src/facilitator";

describe("CDP facilitator authentication", () => {
  it("does not attach CDP authentication to other URLs", () => {
    for (const url of ["https://x402.org/facilitator", "https://example.com", `${CDP_FACILITATOR_URL}.invalid`]) {
      expect(facilitatorConfig({ CDP_API_KEY_ID: "test", CDP_API_KEY_SECRET: "test" }, url)).toEqual({ url });
    }
  });

  it("defers missing credentials until authentication is actually needed", async () => {
    const config = facilitatorConfig({}, CDP_FACILITATOR_URL);
    await expect(config.createAuthHeaders!()).rejects.toThrow("cdp_auth_not_configured");
  });

  it("creates signed method-specific JWTs without network calls", async () => {
    const { privateKey, publicKey } = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]) as CryptoKeyPair;
    const secret = Buffer.concat([
      Buffer.from(await crypto.subtle.exportKey("pkcs8", privateKey)).subarray(-32),
      Buffer.from(await crypto.subtle.exportKey("raw", publicKey))
    ]).toString("base64");
    const config = facilitatorConfig({ CDP_API_KEY_ID: "local-test-key", CDP_API_KEY_SECRET: secret }, CDP_FACILITATOR_URL);
    const headers = await config.createAuthHeaders!();
    for (const [operation, method] of [["supported", "GET"], ["verify", "POST"], ["settle", "POST"]] as const) {
      const jwt = headers[operation]!.Authorization!.slice("Bearer ".length);
      const claims = JSON.parse(Buffer.from(jwt.split(".")[1]!, "base64url").toString());
      expect(claims.sub).toBe("local-test-key");
      expect(claims.uris).toContain(`${method} api.cdp.coinbase.com/platform/v2/x402/${operation}`);
      expect(claims.exp - claims.nbf).toBeLessThanOrEqual(120);
    }
  });
});
