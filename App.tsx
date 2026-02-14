import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MapTab } from "./src/screens/MapTab";
import { GossipFeedTab } from "./src/screens/GossipFeedTab";
import {
  AddGossipModal,
  SubmitGossipForm,
} from "./src/components/AddGossipModal";
import { TabDock } from "./src/components/TabDock";
import { HYDERABAD } from "./src/constants";
import { Gossip, TabKey } from "./src/types";
import {
  deleteGossipRequest,
  fetchGossips,
  submitGossipRequest,
} from "./src/services/gossipApi";
import { formatExpiryCountdown, formatFreshness } from "./src/utils/date";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { ThemeName, ThemePalette, ThemeProvider, useTheme } from "./src/theme";

const mapApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export default function App() {
  const [theme, setTheme] = useState<ThemeName>("dark");
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme} setTheme={setTheme}>
        <AppShell theme={theme} setTheme={setTheme} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

type AppShellProps = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

function AppShell({ theme, setTheme }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("map");
  const [composerVisible, setComposerVisible] = useState(false);
  const [draftLocation, setDraftLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [repostingId, setRepostingId] = useState<string | null>(null);
  const [activeGossips, setActiveGossips] = useState<Gossip[]>([]);
  const [allGossips, setAllGossips] = useState<Gossip[]>([]);
  const [loadingGossips, setLoadingGossips] = useState(true);
  const [mapFilter, setMapFilter] = useState<string>("All");
  const [view, setView] = useState<"main" | "profile" | "settings">("main");
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const openComposer = (location: { latitude: number; longitude: number }) => {
    setDraftLocation(location);
    setComposerVisible(true);
  };

  const loadGossips = useCallback(async (filterOverride?: string) => {
    setLoadingGossips(true);
    try {
      const targetFilter = filterOverride ?? mapFilter;
      const categoryFilter =
        targetFilter && targetFilter !== "All" ? targetFilter : undefined;
      const [remoteActive, remoteAll] = await Promise.all([
        fetchGossips({ category: categoryFilter }),
        fetchGossips({ includeExpired: true }),
      ]);

      const normalize = (items: typeof remoteActive) =>
        items.map((item) => ({
          ...item,
          freshness: formatFreshness(item.freshness),
          expiryLabel: item.expired ? "Expired" : formatExpiryCountdown(item.expiresAt),
          expiresInHours: item.expiresInHours,
          expired: item.expired ?? false,
          locationPreference: item.locationPreference ?? null,
        }));

      setActiveGossips(normalize(remoteActive));
      setAllGossips(normalize(remoteAll));
    } catch (error) {
      console.error("Failed to load gossips", error);
    } finally {
      setLoadingGossips(false);
    }
  }, [mapFilter]);

  useEffect(() => {
    loadGossips(mapFilter);
  }, [loadGossips, mapFilter]);

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
      setAllGossips((prev) => prev.filter((item) => item.id !== id));
      setActiveGossips((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleRepostGossip = async (id: string) => {
    const target = allGossips.find((item) => item.id === id);
    if (!target) return;
    setRepostingId(id);
    try {
      await submitGossipRequest({
        subject: target.title,
        description: target.body,
        gossipType: target.category,
        locationPreference: target.location ? 'map' : target.locationPreference ?? 'current',
        location: target.location ?? draftLocation ?? HYDERABAD,
        expiresInHours: target.expiresInHours ?? 24,
      });
      loadGossips();
    } finally {
      setRepostingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {view === "profile" ? (
        <ProfileScreen
          onClose={() => setView("main")}
          onOpenSettings={() => setView("settings")}
        />
      ) : view === "settings" ? (
        <SettingsScreen
          onClose={() => setView("profile")}
          theme={theme}
          onChangeTheme={(next) => setTheme(next)}
        />
      ) : (
        <>
          <TabDock activeTab={activeTab} onSelect={setActiveTab} />
          <View style={styles.contentArea}>
            {activeTab === "map" ? (
              <MapTab
                gossips={activeGossips}
                mapApiKey={mapApiKey}
                onAddRequest={openComposer}
                onProfilePress={() => setView("profile")}
                selectedFilter={mapFilter}
                onFilterChange={setMapFilter}
              />
            ) : null}
            {activeTab === "feed" ? (
              <GossipFeedTab
                gossips={allGossips}
                onDelete={handleDeleteGossip}
                deletingId={deletingId}
                onRepost={handleRepostGossip}
                repostingId={repostingId}
              />
            ) : null}
          </View>
          {loadingGossips ? (
            <View style={styles.globalLoader} pointerEvents="none">
              <ActivityIndicator size="large" color="#38bdf8" />
            </View>
          ) : null}
          <AddGossipModal
            visible={composerVisible}
            onClose={() => setComposerVisible(false)}
            onSubmit={handleSubmitGossip}
            initialLocation={draftLocation ?? HYDERABAD}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palette.background,
      paddingBottom: 16,
    },
    contentArea: {
      flex: 1,
      paddingBottom: 96,
    },
    globalLoader: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.overlay,
    },
  });
