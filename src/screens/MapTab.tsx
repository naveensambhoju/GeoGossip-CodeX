import { useEffect, useRef, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gossip, MapVisualType, PlaceSuggestion } from '../types';
import { HYDERABAD } from '../constants';
import { GossipCard } from '../components/GossipCard';

const SHEET_COLLAPSED = 110;
const SHEET_EXPANDED = Dimensions.get('window').height * 0.82;

export type MapTabProps = {
  gossips: Gossip[];
  mapApiKey: string;
  onAddRequest: () => void;
};

export function MapTab({ gossips, mapApiKey, onAddRequest }: MapTabProps) {
  const [region, setRegion] = useState<Region>(HYDERABAD);
  const [mapReady, setMapReady] = useState(false);
  const [mapVisualType, setMapVisualType] = useState<MapVisualType>('standard');
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const sheetHeight = useRef(new Animated.Value(SHEET_COLLAPSED)).current;
  const mapRef = useRef<MapView | null>(null);
  const webMapProps: Record<string, unknown> = Platform.OS === 'web' ? { googleMapsApiKey: mapApiKey } : {};

  const toggleSheet = () => {
    const target = sheetExpanded ? SHEET_COLLAPSED : SHEET_EXPANDED;
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

  const searchBarTop = Math.max(insets.top, 12) + 12;
  const hasSuggestionOverlay = Boolean(mapApiKey && (suggestions.length > 0 || searchLoading || searchError));
  const mapTypeTop = hasSuggestionOverlay ? searchBarTop + 180 : searchBarTop + 52;

  useEffect(() => {
    if (!mapApiKey || searchQuery.trim().length < 3) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const url =
          'https://maps.googleapis.com/maps/api/place/autocomplete/json?' +
          `input=${encodeURIComponent(searchQuery.trim())}` +
          `&key=${mapApiKey}` +
          `&location=${region.latitude},${region.longitude}` +
          '&radius=50000&types=geocode';
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();
        if (data.status === 'OK') {
          setSuggestions(
            data.predictions.map((prediction: any) => ({
              id: prediction.place_id,
              description: prediction.description,
              placeId: prediction.place_id,
            })),
          );
        } else {
          setSearchError(data.error_message ?? data.status);
          setSuggestions([]);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSearchError('Unable to fetch suggestions.');
          setSuggestions([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery, mapApiKey, region.latitude, region.longitude]);

  const handleSuggestionPress = async (placeId: string, description: string) => {
    if (!mapApiKey) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const detailsUrl =
        'https://maps.googleapis.com/maps/api/place/details/json?' +
        `place_id=${placeId}` +
        '&fields=geometry' +
        `&key=${mapApiKey}`;
      const response = await fetch(detailsUrl);
      const data = await response.json();
      if (data.status === 'OK') {
        const location = data.result.geometry.location;
        const targetRegion: Region = {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        };
        mapRef.current?.animateToRegion(targetRegion, 400);
        setRegion(targetRegion);
        setSearchQuery(description);
        setSuggestions([]);
      } else {
        setSearchError(data.error_message ?? data.status);
      }
    } catch (error) {
      setSearchError('Failed to retrieve location.');
    } finally {
      setSearchLoading(false);
    }
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
          toolbarEnabled={false}
          showsMyLocationButton={false}
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
        <View style={[styles.searchBar, { top: searchBarTop }] }>
          <TextInput
            style={styles.searchInput}
            placeholder={mapApiKey ? 'Search locations' : 'Add Google Maps API key'}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            editable={Boolean(mapApiKey)}
          />
          {searchQuery ? (
            <TouchableOpacity style={styles.searchClear} onPress={() => setSearchQuery('')}>
              <Text style={styles.searchClearText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {hasSuggestionOverlay ? (
          <View style={[styles.suggestionsPanel, { top: searchBarTop + 50 }]}>
            {searchLoading ? <Text style={styles.suggestionMeta}>Looking around…</Text> : null}
            {searchError ? <Text style={styles.suggestionError}>{searchError}</Text> : null}
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionRow}
                onPress={() => handleSuggestionPress(item.placeId, item.description)}
                activeOpacity={0.85}
              >
                <Text style={styles.suggestionText}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        <View style={[styles.mapTypeToggle, { top: mapTypeTop }]}>
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
          <TouchableOpacity accessibilityLabel="Zoom in" style={styles.zoomButton} onPress={() => handleZoom('in')}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel="Zoom out" style={styles.zoomButton} onPress={() => handleZoom('out')}>
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.sheet, { height: sheetHeight }]}
        >
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

const styles = StyleSheet.create({
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
  searchBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b1220cc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
  },
  searchClear: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  searchClearText: {
    color: '#94a3b8',
    fontSize: 16,
    lineHeight: 16,
  },
  suggestionsPanel: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: '#0b1220f2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 6,
    maxHeight: 240,
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestionText: {
    color: '#f8fafc',
    fontSize: 14,
  },
  suggestionMeta: {
    color: '#94a3b8',
    fontSize: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  suggestionError: {
    color: '#f87171',
    fontSize: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  mapTypeToggle: {
    position: 'absolute',
    right: 24,
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
  warning: {
    textAlign: 'center',
    color: '#fbbf24',
    fontSize: 12,
    marginTop: 8,
  },
});
