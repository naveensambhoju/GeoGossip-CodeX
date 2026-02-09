import { useEffect, useRef, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

type TabKey = 'map' | 'feed';
type LocationPreference = 'current' | 'map';
type MapVisualType = 'standard' | 'satellite';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'map', label: 'Gossips' },
  { key: 'feed', label: 'My Gossips' },
];

const GOSSIP_TYPES = ['General', 'Traffic', 'Emergency', 'Event', 'News'];

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabKey>('map');
  const [composerVisible, setComposerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <TabDock activeTab={activeTab} onSelect={setActiveTab} />
      <View style={styles.contentArea}>
        {activeTab === 'map' ? (
          <MapTab gossips={mockGossips} mapApiKey={mapApiKey} onAddRequest={() => setComposerVisible(true)} />
        ) : null}
        {activeTab === 'feed' ? <GossipFeedTab gossips={mockGossips} /> : null}
      </View>
      <AddGossipModal visible={composerVisible} onClose={() => setComposerVisible(false)} />
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

function MapTab({
  gossips,
  mapApiKey,
  onAddRequest,
}: {
  gossips: Gossip[];
  mapApiKey: string;
  onAddRequest: () => void;
}) {
  const [region, setRegion] = useState<Region>(HYDERABAD);
  const [mapReady, setMapReady] = useState(false);
  const [mapVisualType, setMapVisualType] = useState<MapVisualType>('standard');
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
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

  const handleRecenter = () => {
    if (!mapReady) return;
    mapRef.current?.animateToRegion(HYDERABAD, 500);
    setRegion(HYDERABAD);
  };

  const clampDelta = (value: number) => {
    const min = 0.0006;
    const max = 2.5;
    return Math.min(max, Math.max(min, value));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!mapReady) return;
    const current = region ?? HYDERABAD;
    const factor = direction === 'in' ? 0.5 : 2;
    const nextDelta = clampDelta(current.latitudeDelta * factor);
    const nextRegion = {
      ...current,
      latitudeDelta: nextDelta,
      longitudeDelta: nextDelta,
    };
    mapRef.current?.animateToRegion(nextRegion, 200);
    setRegion(nextRegion);
  };

  return (
    <>
      <View style={styles.mapWrapper}>
        <MapView
          ref={(node) => {
            mapRef.current = node;
          }}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          mapType={
            mapVisualType === 'satellite'
              ? Platform.OS === 'ios'
                ? 'satellite'
                : 'hybrid'
              : 'standard'
          }
          initialRegion={HYDERABAD}
          onRegionChangeComplete={(next) => setRegion(next)}
          onMapReady={() => setMapReady(true)}
          showsUserLocation
          showsCompass
          zoomEnabled
          scrollEnabled
          rotateEnabled
          pitchEnabled
          zoomTapEnabled
          zoomControlEnabled={Platform.OS === 'android'}
          {...webMapProps}
        >
          <Marker
            coordinate={HYDERABAD}
            title="GeoGossip"
            description="Prototype"
            pinColor="#bae6fd"
          />
        </MapView>
        <View pointerEvents="none" style={styles.centerPin}>
          <View style={styles.centerPinHead} />
          <View style={styles.centerPinTip} />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add new gossip"
          style={styles.addButton}
          onPress={onAddRequest}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <View style={[styles.mapTypeToggle, { top: Math.max(insets.top, 12) + 8 }]}>
          {(
            [
              { key: 'standard', label: 'Map' },
              { key: 'satellite', label: 'Satellite' },
            ] as { key: MapVisualType; label: string }[]
          ).map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.mapTypeButton, mapVisualType === option.key && styles.mapTypeButtonActive]}
              onPress={() => setMapVisualType(option.key)}
              activeOpacity={0.85}
            >
              <Text
                style={[styles.mapTypeButtonText, mapVisualType === option.key && styles.mapTypeButtonTextActive]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Recenter map"
          style={styles.recenterButton}
          onPress={handleRecenter}
        >
          <View style={styles.recenterIcon}>
            <View style={[styles.recenterLine, styles.recenterLineVertical]} />
            <View style={[styles.recenterLine, styles.recenterLineHorizontal]} />
          </View>
        </TouchableOpacity>
        <View style={styles.zoomControls}>
          <TouchableOpacity
            accessibilityLabel="Zoom in"
            style={styles.zoomButton}
            onPress={() => handleZoom('in')}
          >
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Zoom out"
            style={styles.zoomButton}
            onPress={() => handleZoom('out')}
          >
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>
        </View>
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

function AddGossipModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [gossipType, setGossipType] = useState(GOSSIP_TYPES[0]);
  const [locationPreference, setLocationPreference] = useState<LocationPreference>('current');
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setTypeMenuOpen(false);
    }
  }, [visible]);

  const handleClose = () => {
    setSubject('');
    setDescription('');
    setGossipType(GOSSIP_TYPES[0]);
    setLocationPreference('current');
    setTypeMenuOpen(false);
    onClose();
  };

  const handlePreview = () => {
    console.log('Preview gossip', { subject, description, gossipType, locationPreference });
  };

  const handlePost = () => {
    console.log('Post gossip', { subject, description, gossipType, locationPreference });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Gossip</Text>
          <TouchableOpacity accessibilityLabel="Close" onPress={handleClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Give it a title"
              placeholderTextColor="#475569"
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
            />
            <Text style={styles.helperText}>{subject.length}/100</Text>
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Add more detail"
              placeholderTextColor="#475569"
              value={description}
              onChangeText={setDescription}
              maxLength={250}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>{description.length}/250</Text>
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Gossip Type</Text>
            <View>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setTypeMenuOpen((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownText}>{gossipType}</Text>
                <Text style={styles.dropdownCaret}>{typeMenuOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {typeMenuOpen ? (
                <View style={styles.dropdownList}>
                  {GOSSIP_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setGossipType(type);
                        setTypeMenuOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Location</Text>
            <View style={styles.radioGroup}>
              {[
                { key: 'current', label: 'Use Current Location' },
                { key: 'map', label: 'Choose from Map' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.radioRow}
                  onPress={() => setLocationPreference(option.key as LocationPreference)}
                  activeOpacity={0.8}
                >
                  <View style={styles.radioOuter}>
                    {locationPreference === option.key ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePreview}>
              <Text style={styles.secondaryButtonText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handlePost}>
              <Text style={styles.primaryButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  centerPin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    transform: [{ translateY: -28 }, { translateX: -12 }],
  },
  mapTypeToggle: {
    position: 'absolute',
    right: 24,
    top: 20,
    flexDirection: 'row',
    backgroundColor: '#0b1220cc',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 4,
    gap: 4,
  },
  mapTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  mapTypeButtonActive: {
    backgroundColor: '#38bdf8',
  },
  mapTypeButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  mapTypeButtonTextActive: {
    color: '#020617',
  },
  centerPinHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  centerPinTip: {
    width: 0,
    height: 0,
    marginTop: -6,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ef4444',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    top: '50%',
    backgroundColor: '#38bdf8',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    transform: [{ translateY: -24 }],
  },
  addButtonText: {
    color: '#020617',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
  },
  recenterButton: {
    position: 'absolute',
    right: 24,
    top: '50%',
    marginTop: 64,
    backgroundColor: '#0b1220',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    transform: [{ translateY: -24 }],
  },
  recenterIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterLine: {
    position: 'absolute',
    backgroundColor: '#f8fafc',
    borderRadius: 1,
  },
  recenterLineVertical: {
    width: 1.5,
    height: 10,
  },
  recenterLineHorizontal: {
    width: 10,
    height: 1.5,
  },
  zoomControls: {
    position: 'absolute',
    right: 24,
    top: '50%',
    marginTop: 132,
    gap: 8,
    transform: [{ translateY: -24 }],
  },
  zoomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  zoomButtonText: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20,
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
    backgroundColor: '#1e2b45',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2f3e5a',
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
    color: '#e2e8f0',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#94a3b8',
    fontSize: 22,
    lineHeight: 22,
    marginTop: -2,
  },
  modalContent: {
    paddingBottom: 48,
    gap: 16,
  },
  formField: {
    gap: 6,
  },
  formLabel: {
    color: '#94a3b8',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#0b1220',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 15,
  },
  textarea: {
    height: 140,
  },
  helperText: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'right',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0b1220',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownCaret: {
    color: '#94a3b8',
    fontSize: 12,
  },
  dropdownList: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0b1220',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownOptionText: {
    color: '#f8fafc',
    fontSize: 15,
  },
  radioGroup: {
    gap: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
  },
  radioLabel: {
    color: '#f8fafc',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#020617',
    fontWeight: '700',
  },
});
