import { useRef, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const HYDERABAD = {
  latitude: 17.4435,
  longitude: 78.3772,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type Gossip = {
  id: string;
  title: string;
  body: string;
  category: string;
  freshness: string;
};

const mockGossips: Gossip[] = [
  {
    id: '1',
    title: 'Speed trap near Cyber Towers',
    body: 'Police checking licenses till 9pm.',
    category: 'Safety',
    freshness: '5 min ago',
  },
  {
    id: '2',
    title: 'Live band at Jubilee Hills café',
    body: 'Walk-in allowed, starts 8pm.',
    category: 'Event',
    freshness: '18 min ago',
  },
  {
    id: '3',
    title: 'Secret dosa cart',
    body: 'Park road next to KBR gate.',
    category: 'Food',
    freshness: '24 min ago',
  },
  {
    id: '4',
    title: 'Parking cleared at Inorbit',
    body: 'Level P3 reopened.',
    category: 'Parking',
    freshness: '35 min ago',
  },
  {
    id: '5',
    title: 'Accident at Gachibowli flyover',
    body: 'Two-wheeler down, expect slow traffic.',
    category: 'Alert',
    freshness: '1 hr ago',
  },
];

const mapApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

type TabKey = 'map' | 'feed' | 'description' | 'future';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'map', label: 'Map' },
  { key: 'feed', label: 'Gossip Feed' },
  { key: 'description', label: 'Project' },
  { key: 'future', label: 'Future' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabKey>('map');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <TabDock activeTab={activeTab} onSelect={setActiveTab} />
      <View style={styles.contentArea}>
        {activeTab === 'map' ? <MapTab gossips={mockGossips} mapApiKey={mapApiKey} /> : null}
        {activeTab === 'feed' ? <GossipFeedTab gossips={mockGossips} /> : null}
        {activeTab === 'description' ? <ProjectDescriptionTab /> : null}
        {activeTab === 'future' ? <FutureTabs /> : null}
      </View>
    </SafeAreaView>
  );
}

function TabDock({
  activeTab,
  onSelect,
}: {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12) + 8;

  return (
    <View style={[styles.tabDock, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.tabDockInner}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.85}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => onSelect(tab.key)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function MapTab({ gossips, mapApiKey }: { gossips: Gossip[]; mapApiKey: string }) {
  const [region, setRegion] = useState<Region | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const collapsedHeight = 110;
  const expandedHeight = Dimensions.get('window').height * 0.82;
  const sheetHeight = useRef(new Animated.Value(collapsedHeight)).current;
  const webMapProps: Record<string, unknown> = Platform.OS === 'web' ? { googleMapsApiKey: mapApiKey } : {};

  const toggleSheet = () => {
    const target = sheetExpanded ? collapsedHeight : expandedHeight;
    setSheetExpanded((prev) => !prev);
    Animated.spring(sheetHeight, {
      toValue: target,
      useNativeDriver: false,
      damping: 20,
      stiffness: 160,
      mass: 0.8,
    }).start();
  };

  return (
    <>
      <View style={styles.mapWrapper}>
        <MapView
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          initialRegion={HYDERABAD}
          onRegionChangeComplete={(next) => setRegion(next)}
          showsUserLocation
          showsCompass
          {...webMapProps}
        >
          <Marker coordinate={HYDERABAD} title="GeoGossip" description="Prototype" />
        </MapView>
        <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
          <TouchableOpacity activeOpacity={0.9} style={styles.sheetHandle} onPress={toggleSheet}>
            <View style={styles.sheetGrabber} />
            <Text style={styles.sheetTitle}>{gossips.length} gossips in view</Text>
            <Text style={styles.sheetSubtitle}>
              {region ? `Lat ${region.latitude.toFixed(2)}, Lon ${region.longitude.toFixed(2)}` : 'Exploring Hyderabad'}
            </Text>
          </TouchableOpacity>
          {sheetExpanded ? (
            <ScrollView style={styles.sheetContent} contentContainerStyle={{ paddingBottom: 24 }}>
              {gossips.map((item) => (
                <GossipCard key={item.id} item={item} />
              ))}
            </ScrollView>
          ) : null}
        </Animated.View>
      </View>
      {Platform.OS === 'web' && !mapApiKey ? (
        <Text style={styles.warning}>Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to see Google Maps on web.</Text>
      ) : null}
    </>
  );
}

function GossipFeedTab({ gossips }: { gossips: Gossip[] }) {
  return (
    <ScrollView style={styles.infoScroll} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.sectionHero}>Live gossip rundown</Text>
      {gossips.map((item) => (
        <GossipCard key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}

function ProjectDescriptionTab() {
  const goals = [
    'Polished Google Map experience with expandable context.',
    'Mock data baked in so demos work without a backend.',
    'Easy API key configuration via `.env` and `app.config.ts`.',
  ];

  return (
    <ScrollView style={styles.infoScroll} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.sectionHero}>Project Description</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Mission</Text>
        <Text style={styles.infoBody}>
          Deliver map-first updates for every neighborhood, starting with a Hyderabad pilot that mixes maps, gossip,
          and lightweight local intel.
        </Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Immediate goals</Text>
        {goals.map((goal) => (
          <View key={goal} style={styles.infoListItem}>
            <View style={styles.infoListBullet} />
            <Text style={styles.infoBody}>{goal}</Text>
          </View>
        ))}
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Where to learn more</Text>
        <Text style={styles.infoBody}>
          Peek at README.md for setup, scripts, and API key instructions. This tab is the living summary of the GeoGossip
          pitch inside the app shell.
        </Text>
      </View>
    </ScrollView>
  );
}

function FutureTabs() {
  const futureItems = [
    {
      title: 'Bookmarks',
      body: 'Save favorite map spots or gossip threads for easy recall.',
    },
    {
      title: 'Submit',
      body: 'Quick composer that attaches a pin, text, and optional media.',
    },
    {
      title: 'Profile',
      body: 'Notification preferences, moderation status, and per-device settings.',
    },
  ];

  return (
    <ScrollView style={styles.infoScroll} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.sectionHero}>Future Tabs</Text>
      {futureItems.map((item) => (
        <View key={item.title} style={styles.infoCard}>
          <Text style={styles.infoTitle}>{item.title}</Text>
          <Text style={styles.infoBody}>{item.body}</Text>
        </View>
      ))}
      <Text style={styles.infoBody}>
        These screens stem from the `.expo/README.md` scratchpad and help guide design sprints directly inside the
        prototype.
      </Text>
    </ScrollView>
  );
}

function GossipCard({ item }: { item: Gossip }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardMeta}>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardFreshness}>{item.freshness}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardBody}>{item.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabDock: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
  },
  tabDockInner: {
    flexDirection: 'row',
    backgroundColor: '#0f172acc',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0b1220',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#2563eb',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#f8fafc',
  },
  contentArea: {
    flex: 1,
    paddingBottom: 96,
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    position: 'relative',
  },
  warning: {
    textAlign: 'center',
    color: '#fbbf24',
    fontSize: 12,
    marginTop: 8,
  },
  sectionHero: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#020617ee',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sheetHandle: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetGrabber: {
    width: 60,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#1e293b',
    marginBottom: 6,
  },
  sheetTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  sheetSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  sheetContent: {
    flex: 1,
  },
  infoScroll: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  infoBody: {
    color: '#cbd5f5',
    fontSize: 13,
    lineHeight: 18,
  },
  infoListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoListBullet: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#38bdf8',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardCategory: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  cardFreshness: {
    color: '#94a3b8',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  cardBody: {
    color: '#cbd5f5',
  },
});
