import { HYDERABAD } from '../constants';

const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'geogossip-dev';
const functionsRegion = process.env.EXPO_PUBLIC_FIREBASE_REGION ?? 'us-central1';
const emulatorHost = process.env.EXPO_PUBLIC_FUNCTIONS_EMULATOR_HOST;
const useEmulator = process.env.EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR === 'true';
const trimmedEmulatorHost = emulatorHost?.replace(/\/$/, '');
const emulatorBase = trimmedEmulatorHost ? `${trimmedEmulatorHost}/${projectId}/${functionsRegion}` : null;

const submitEndpoint = useEmulator && emulatorBase
  ? `${emulatorBase}/submitGossip`
  : process.env.EXPO_PUBLIC_FUNCTION_SUBMIT_URL ??
    `https://${functionsRegion}-${projectId}.cloudfunctions.net/submitGossip`;

const listEndpoint = useEmulator && emulatorBase
  ? `${emulatorBase}/listGossips`
  : process.env.EXPO_PUBLIC_FUNCTION_LIST_URL ??
    `https://${functionsRegion}-${projectId}.cloudfunctions.net/listGossips`;

const deleteEndpoint = useEmulator && emulatorBase
  ? `${emulatorBase}/deleteGossip`
  : process.env.EXPO_PUBLIC_FUNCTION_DELETE_URL ??
    `https://${functionsRegion}-${projectId}.cloudfunctions.net/deleteGossip`;

export type SubmitGossipRequest = {
  subject: string;
  description: string;
  gossipType: string;
  locationPreference: string;
  location?: { latitude: number; longitude: number } | null;
  expiresInHours: number;
};

export async function submitGossipRequest(payload: SubmitGossipRequest) {
  const response = await fetch(submitEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      location: payload.location ?? HYDERABAD,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Failed to submit gossip');
  }

  return response.json();
}

type RemoteGossip = {
  id: string;
  title: string;
  body: string;
  category: string;
  freshness: string;
  location?: { latitude: number; longitude: number } | null;
  expiresAt?: string | null;
  expiresInHours?: number;
  expired?: boolean;
  locationPreference?: string;
};

export async function fetchGossips(options?: { includeExpired?: boolean }): Promise<RemoteGossip[]> {
  const includeParam = options?.includeExpired
    ? `${listEndpoint}${listEndpoint.includes('?') ? '&' : '?'}includeExpired=true`
    : listEndpoint;
  const response = await fetch(includeParam);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Failed to load gossips');
  }

  const data = (await response.json()) as { items: RemoteGossip[] };
  return data.items ?? [];
}

export async function deleteGossipRequest(id: string) {
  const separator = deleteEndpoint.includes('?') ? '&' : '?';
  const url = `${deleteEndpoint}${separator}id=${encodeURIComponent(id)}`;
  const response = await fetch(url, { method: 'DELETE' });

  if (!response.ok && response.status !== 204) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Failed to delete gossip');
  }
}
