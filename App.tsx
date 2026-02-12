import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MapTab } from "./src/screens/MapTab";
import { GossipFeedTab } from "./src/screens/GossipFeedTab";
import {
  AddGossipModal,
  SubmitGossipForm,
} from "./src/components/AddGossipModal";
import { TabDock } from "./src/components/TabDock";
import { HYDERABAD, mockGossips } from "./src/constants";
import { Gossip, TabKey } from "./src/types";
import {
  deleteGossipRequest,
  fetchGossips,
  submitGossipRequest,
} from "./src/services/gossipApi";
import { formatExpiryCountdown, formatFreshness } from "./src/utils/date";

const mapApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabKey>("map");
  const [composerVisible, setComposerVisible] = useState(false);
  const [draftLocation, setDraftLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [gossips, setGossips] = useState<Gossip[]>(() =>
    mockGossips.map((item) => ({
      ...item,
      freshness: formatFreshness(item.freshness),
      expiryLabel: formatExpiryCountdown(item.expiresAt),
    })),
  );

  const openComposer = (location: { latitude: number; longitude: number }) => {
    setDraftLocation(location);
    setComposerVisible(true);
  };

  const loadGossips = useCallback(async () => {
    try {
      const remote = await fetchGossips();
      if (remote.length) {
        setGossips(
          remote.map((item) => ({
            ...item,
            freshness: formatFreshness(item.freshness),
            expiryLabel: formatExpiryCountdown(item.expiresAt),
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load gossips", error);
    }
  }, []);

  useEffect(() => {
    loadGossips();
  }, [loadGossips]);

  const handleSubmitGossip = async (form: SubmitGossipForm) => {
    await submitGossipRequest({
      subject: form.subject,
      description: form.description,
      gossipType: form.gossipType,
      locationPreference: form.locationPreference,
      location: form.location ?? draftLocation ?? HYDERABAD,
      expiresInHours: form.expiresInHours,
    });
    loadGossips();
  };

  const handleDeleteGossip = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteGossipRequest(id);
      setGossips((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <TabDock activeTab={activeTab} onSelect={setActiveTab} />
      <View style={styles.contentArea}>
        {activeTab === "map" ? (
          <MapTab
            gossips={gossips}
            mapApiKey={mapApiKey}
            onAddRequest={openComposer}
          />
        ) : null}
        {activeTab === "feed" ? (
          <GossipFeedTab gossips={gossips} onDelete={handleDeleteGossip} deletingId={deletingId} />
        ) : null}
      </View>
      <AddGossipModal
        visible={composerVisible}
        onClose={() => setComposerVisible(false)}
        onSubmit={handleSubmitGossip}
        initialLocation={draftLocation ?? HYDERABAD}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
    paddingBottom: 16,
  },
  contentArea: {
    flex: 1,
    paddingBottom: 96,
  },
});
