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

const HYDERABAD = {
  latitude: 17.4435,
  longitude: 78.3772,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const mockGossips = [
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

export default function App() {
  const [region, setRegion] = useState<Region | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const collapsedHeight = 110;
  const expandedHeight = Dimensions.get('window').height * 0.82;
  const sheetHeight = useRef(new Animated.Value(collapsedHeight)).current;

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

  const gossipCount = mockGossips.length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.chip}>GeoGossip</Text>
        <Text style={styles.title}>Map-first updates for every neighborhood</Text>
        <Text style={styles.subtitle}>Explore, zoom, and drop pins around Hyderabad.</Text>
      </View>
      <View style={styles.mapWrapper}>
        <MapView
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          initialRegion={HYDERABAD}
          onRegionChangeComplete={(next) => setRegion(next)}
          showsUserLocation
          showsCompass
          googleMapsApiKey={mapApiKey}
        >
          <Marker coordinate={HYDERABAD} title="GeoGossip" description="Prototype" />
        </MapView>
        <Animated.View style={[styles.sheet, { height: sheetHeight }]}
        >
          <TouchableOpacity activeOpacity={0.9} style={styles.sheetHandle} onPress={toggleSheet}>
            <View style={styles.sheetGrabber} />
            <Text style={styles.sheetTitle}>{gossipCount} gossips in view</Text>
            <Text style={styles.sheetSubtitle}>
              {region ? `Lat ${region.latitude.toFixed(2)}, Lon ${region.longitude.toFixed(2)}` : 'Exploring Hyderabad'}
            </Text>
          </TouchableOpacity>
          {sheetExpanded ? (
            <ScrollView style={styles.sheetContent} contentContainerStyle={{ paddingBottom: 24 }}>
              {mockGossips.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                    <Text style={styles.cardFreshness}>{item.freshness}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardBody}>{item.body}</Text>
                </View>
              ))}
            </ScrollView>
          ) : null}
        </Animated.View>
      </View>
      {Platform.OS === 'web' && !mapApiKey ? (
        <Text style={styles.warning}>Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to see Google Maps on web.</Text>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16,
    gap: 16,
  },
  header: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  chip: {
    color: '#38bdf8',
    fontWeight: '600',
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    color: '#cbd5f5',
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
