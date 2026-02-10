import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MapTab } from './src/screens/MapTab';
import { GossipFeedTab } from './src/screens/GossipFeedTab';
import { AddGossipModal, SubmitGossipForm } from './src/components/AddGossipModal';
import { TabDock } from './src/components/TabDock';
import { HYDERABAD, mockGossips } from './src/constants';
import { TabKey } from './src/types';
import { submitGossipRequest } from './src/services/gossipApi';

const mapApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

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
  const [draftLocation, setDraftLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const openComposer = (location: { latitude: number; longitude: number }) => {
    setDraftLocation(location);
    setComposerVisible(true);
  };

  const handleSubmitGossip = async (form: SubmitGossipForm) => {
    await submitGossipRequest({
      subject: form.subject,
      description: form.description,
      gossipType: form.gossipType,
      locationPreference: form.locationPreference,
      location: form.location ?? draftLocation ?? HYDERABAD,
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <TabDock activeTab={activeTab} onSelect={setActiveTab} />
      <View style={styles.contentArea}>
        {activeTab === 'map' ? (
          <MapTab gossips={mockGossips} mapApiKey={mapApiKey} onAddRequest={openComposer} />
        ) : null}
        {activeTab === 'feed' ? <GossipFeedTab gossips={mockGossips} /> : null}
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
    backgroundColor: '#020617',
    paddingBottom: 16,
  },
  contentArea: {
    flex: 1,
    paddingBottom: 96,
  },
});
