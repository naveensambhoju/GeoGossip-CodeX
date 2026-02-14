import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { TABS } from '../constants';
import { TabKey } from '../types';
import { ThemePalette, useTheme } from '../theme';

type Props = {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
};

export function TabDock({ activeTab, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12) + 8;
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

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

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    tabDock: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 20,
    },
    tabDockInner: {
      flexDirection: 'row',
      backgroundColor: palette.card,
      borderRadius: 999,
      padding: 6,
      borderWidth: 1,
      borderColor: palette.border,
      gap: 8,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      alignItems: 'center',
    },
    tabButtonActive: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
    },
    tabButtonText: {
      color: palette.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    tabButtonTextActive: {
      color: palette.accentContrast,
    },
  });
