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

const MAP_TYPE_OPTIONS: { key: MapVisualType; label: string }[] = [
  { key: 'standard', label: 'Map' },
  { key: 'satellite', label: 'Satellite' },
];

export type MapTabProps = {
  gossips: Gossip[];
  mapApiKey: string;
  onAddRequest: (region: Region) => void;
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
  const pulseAnim = useRef(new Animated.Value(0)).current;
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
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);


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
          {gossips
            .filter((item) => item.location)
            .map((item) => (
              <Marker
                key={`gossip-${item.id}`}
                coordinate={{
                  latitude: item.location!.latitude,
                  longitude: item.location!.longitude,
                }}
                title={item.title}
                description={item.body}
                pinColor="#fbbf24"
              />
            ))}
        </MapView>
        <View pointerEvents="none" style={styles.centerPin}>
          <View style={styles.centerPinBullet}>
            <View style={styles.centerPinInner} />
          </View>
          <View style={styles.centerPinLine} />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add new gossip"
          style={styles.addButton}
          onPress={() => onAddRequest(region ?? HYDERABAD)}
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
          {MAP_TYPE_OPTIONS.map((option) => {
            const isActive = mapVisualType === option.key;
            const primaryColor = isActive ? '#072541' : '#94a3b8';
            const accentColor = isActive ? '#072541' : '#38bdf8';
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.mapTypeButton, isActive && styles.mapTypeButtonActive]}
                onPress={() => setMapVisualType(option.key)}
                activeOpacity={0.85}
                accessibilityLabel={option.label}
                accessibilityRole="button"
              >
                <View style={styles.mapTypeIcon}>
                  {option.key === 'standard' ? (
                    <View style={styles.foldIcon}>
                      {[0, 1, 2].map((col) => (
                        <View
                          key={col}
                          style={[
                            styles.foldColumn,
                            {
                              backgroundColor: col === 1 ? accentColor : primaryColor,
                              opacity: col === 1 ? 1 : 0.85,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.satelliteIcon}>
                      <View style={[styles.satelliteOrbitOuter, { borderColor: accentColor }]} />
                      <View style={[styles.satelliteOrbitInner, { borderColor: primaryColor }]} />
                      <View style={[styles.satelliteCore, { backgroundColor: accentColor }]} />
                      <View style={[styles.satelliteDot, styles.satelliteDotNorth, { backgroundColor: primaryColor }]} />
                      <View style={[styles.satelliteDot, styles.satelliteDotSouth, { backgroundColor: primaryColor }]} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Recenter map"
          style={styles.recenterButton}
          onPress={handleRecenter}
        >
          <View style={styles.recenterIcon}>
            <View style={styles.recenterCircle}>
              <View style={[styles.plusBar, styles.plusBarVertical]} />
              <View style={[styles.plusBar, styles.plusBarHorizontal]} />
            </View>
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
            <Text style={styles.sheetSubtitle}>Pull up to browse the latest whispers</Text>
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
    transform: [{ translateY: -30 }, { translateX: -15 }],
  },
  centerPinBullet: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#dc2626',
    borderWidth: 2,
    borderColor: '#7f1d1d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#b91c1c',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  centerPinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  centerPinLine: {
    width: 2.5,
    height: 18,
    marginTop: -4,
    backgroundColor: '#dc2626',
    borderRadius: 1,
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
    color: '#e0f2fe',
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
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTypeButtonActive: {
    backgroundColor: '#38bdf8',
  },
  mapTypeIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foldIcon: {
    flexDirection: 'row',
    gap: 2,
  },
  foldColumn: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  satelliteIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  satelliteOrbitOuter: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  satelliteOrbitInner: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1,
    opacity: 0.8,
  },
  satelliteCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  satelliteDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  satelliteDotNorth: {
    top: 1,
  },
  satelliteDotSouth: {
    bottom: 1,
  },
  recenterButton: {
    position: 'absolute',
    right: 24,
    top: '50%',
    marginTop: 64,
    backgroundColor: '#0b1220',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    transform: [{ translateY: -18 }],
  },
  recenterIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  plusBar: {
    position: 'absolute',
    backgroundColor: '#38bdf8',
    borderRadius: 1,
  },
  plusBarVertical: {
    width: 2,
    height: 22,
  },
  plusBarHorizontal: {
    width: 22,
    height: 2,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
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
