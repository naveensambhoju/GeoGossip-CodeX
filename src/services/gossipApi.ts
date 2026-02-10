import { HYDERABAD } from '../constants';

const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'geogossip-dev';
const functionsRegion = process.env.EXPO_PUBLIC_FIREBASE_REGION ?? 'us-central1';
const emulatorHost = process.env.EXPO_PUBLIC_FUNCTIONS_EMULATOR_HOST;
const useEmulator = process.env.EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR === 'false';

const baseUrl = useEmulator && emulatorHost
  ? `${emulatorHost.replace(/\/$/, '')}/${projectId}/${functionsRegion}`
  : `https://${functionsRegion}-${projectId}.cloudfunctions.net`;

export type SubmitGossipRequest = {
  subject: string;
  description: string;
  gossipType: string;
  locationPreference: string;
  location?: { latitude: number; longitude: number } | null;
};

export async function submitGossipRequest(payload: SubmitGossipRequest) {
  const response = await fetch(`${baseUrl}/submitGossip`, {
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
