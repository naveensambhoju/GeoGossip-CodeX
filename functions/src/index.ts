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
};

const withCors = (response: Response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  response.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
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
    const docRef = await db.collection("gossips").add({
      subject: payload.subject,
      description: payload.description,
      gossipType: payload.gossipType,
      locationPreference: payload.locationPreference ?? "current",
      location: payload.location ?? null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
    const snapshot = await db
      .collection("gossips")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const items = snapshot.docs.map((doc) => {
      const data = doc.data() as NewGossipPayload & {
        createdAt?: FirebaseFirestore.Timestamp;
      };

      const createdAtIso = data.createdAt ?
        data.createdAt.toDate().toISOString() : new Date().toISOString();

      return {
        id: doc.id,
        title: data.subject ?? "Untitled gossip",
        body: data.description ?? "",
        category: data.gossipType ?? "General",
        freshness: createdAtIso,
        location: data.location ?? null,
      };
    });

    response.status(200).json({items});
  } catch (error) {
    console.error("listGossips failed", error);
    response.status(500).json({error: "Failed to load gossips"});
  }
});
