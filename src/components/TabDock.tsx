import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TABS } from '../constants';
import { TabKey } from '../types';

type Props = {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
};

export function TabDock({ activeTab, onSelect }: Props) {
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
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
