import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth();

/**
 * Returns a signed OIDC ID token for the given audience.
 * - Cloud Run: uses the metadata server automatically (service account attached to the instance)
 * - Local: uses Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS or gcloud ADC)
 */
export async function getBackendToken(audience: string): Promise<string> {
  const client = await auth.getIdTokenClient(audience);
  const headers = await client.getRequestHeaders();
  const authHeader = headers.get("Authorization") ?? "";
  return authHeader.replace(/^Bearer\s+/, "");
}
