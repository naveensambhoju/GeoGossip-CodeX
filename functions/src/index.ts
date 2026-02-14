/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import type {Response} from "express";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

type NewGossipPayload = {
  subject: string;
  description: string;
  gossipType: string;
  locationPreference: string;
  location?: {latitude: number; longitude: number} | null;
  expiresInHours?: number;
};

const EXPIRY_OPTIONS = [24, 12, 6, 1] as const;
const DEFAULT_EXPIRY = 1;

type ExpiryOption = (typeof EXPIRY_OPTIONS)[number];

const sanitizeExpiryHours = (value: unknown): number => {
  const numericValue = typeof value === "number" ?
    value :
    Number(String(value ?? ""));
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_EXPIRY;
  }
  return EXPIRY_OPTIONS.includes(numericValue as ExpiryOption) ?
    numericValue :
    DEFAULT_EXPIRY;
};

const withCors = (response: Response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  response.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
};

export const submitGossip = onRequest(async (request, response) => {
  withCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({error: "Method not allowed"});
    return;
  }

  const payload = request.body as NewGossipPayload;
  const missingFields =
    !payload ||
    !payload.subject ||
    !payload.description ||
    !payload.gossipType;
  if (missingFields) {
    response.status(400).json({error: "Missing required fields"});
    return;
  }

  try {
    const expiresInHours = sanitizeExpiryHours(payload.expiresInHours);
    const expiresAt = admin.firestore.Timestamp
      .fromMillis(Date.now() + expiresInHours * 60 * 60 * 1000);
    const docRef = await db.collection("gossips").add({
      subject: payload.subject,
      description: payload.description,
      gossipType: payload.gossipType,
      locationPreference: payload.locationPreference ?? "current",
      location: payload.location ?? null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt,
      expiresInHours,
    });
    response.status(201).json({id: docRef.id});
  } catch (error) {
    console.error("submitGossip failed", error);
    response.status(500).json({error: "Failed to save gossip"});
  }
});

export const listGossips = onRequest(async (request, response) => {
  withCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const includeExpired = request.query.includeExpired === "true";
    const snapshot = await db
      .collection("gossips")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const now = Date.now();
    const items = snapshot.docs.reduce<Array<{
      id: string;
      title: string;
      body: string;
      category: string;
      freshness: string;
      location?: {latitude: number; longitude: number} | null;
      expiresAt?: string | null;
      expiresInHours?: number;
      expired?: boolean;
      locationPreference?: string;
    }>>((acc, doc) => {
      const data = doc.data() as NewGossipPayload & {
        createdAt?: FirebaseFirestore.Timestamp;
        expiresAt?: FirebaseFirestore.Timestamp;
      };

      const expiresAtDate = data.expiresAt?.toDate();
      const isExpired = expiresAtDate ? expiresAtDate.getTime() <= now : false;
      if (!includeExpired && isExpired) {
        return acc;
      }

      const createdAtIso = data.createdAt ?
        data.createdAt.toDate().toISOString() :
        new Date().toISOString();

      acc.push({
        id: doc.id,
        title: data.subject ?? "Untitled gossip",
        body: data.description ?? "",
        category: data.gossipType ?? "General",
        freshness: createdAtIso,
        location: data.location ?? null,
        expiresAt: expiresAtDate ? expiresAtDate.toISOString() : null,
        expiresInHours: data.expiresInHours ?? DEFAULT_EXPIRY,
        expired: isExpired,
        locationPreference: data.locationPreference ?? "current",
      });
      return acc;
    }, []);

    response.status(200).json({items});
  } catch (error) {
    console.error("listGossips failed", error);
    response.status(500).json({error: "Failed to load gossips"});
  }
});

export const deleteGossip = onRequest(async (request, response) => {
  withCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  if (request.method !== "DELETE") {
    response.status(405).json({error: "Method not allowed"});
    return;
  }

  const id = (request.query.id as string) ?? (request.body?.id as string);
  if (!id) {
    response.status(400).json({error: "Missing id"});
    return;
  }

  try {
    await db.collection("gossips").doc(id).delete();
    response.status(204).send("");
  } catch (error) {
    console.error("deleteGossip failed", error);
    response.status(500).json({error: "Failed to delete gossip"});
  }
});
