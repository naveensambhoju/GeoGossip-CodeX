import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { ThemePalette, useTheme } from '../theme';
import { SETTINGS_COPY } from '../constants/settings';

type Props = {
  onClose: () => void;
  theme: 'dark' | 'light';
  onChangeTheme: (theme: 'dark' | 'light') => void;
};

export function SettingsScreen({ onClose, theme, onChangeTheme }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <View style={styles.backIcon}>
            <View style={styles.backShaft} />
            <View style={[styles.backArm, styles.backArmTop]} />
            <View style={[styles.backArm, styles.backArmBottom]} />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>{SETTINGS_COPY.title}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{SETTINGS_COPY.appearanceLabel}</Text>
          <View style={styles.themeToggleRow}>
            <Text style={styles.themeToggleLabel}>{SETTINGS_COPY.darkThemeLabel}</Text>
            <Switch
              value={isDark}
              onValueChange={(value) => onChangeTheme(value ? 'dark' : 'light')}
              trackColor={{ false: palette.border, true: palette.accentSoft }}
              thumbColor={isDark ? palette.accent : palette.card}
              ios_backgroundColor={palette.border}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palette.background,
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    backIcon: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backShaft: {
      width: 12,
      height: 2.5,
      borderRadius: 999,
      backgroundColor: palette.textPrimary,
      marginLeft: 3,
    },
    backArm: {
      position: 'absolute',
      width: 10,
      height: 2.5,
      borderRadius: 999,
      backgroundColor: palette.textPrimary,
      left: 2,
    },
    backArmTop: {
      transform: [{ rotate: '135deg' }],
      top: 5,
    },
    backArmBottom: {
      transform: [{ rotate: '-135deg' }],
      bottom: 5,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.card,
    },
    title: {
      color: palette.textPrimary,
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      flex: 1,
      paddingTop: 24,
    },
    section: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: palette.border,
      gap: 12,
    },
    sectionLabel: {
      color: palette.textSecondary,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    themeToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    themeToggleLabel: {
      color: palette.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
  });
