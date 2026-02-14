import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemePalette, useTheme } from '../theme';

type Props = {
  onClose: () => void;
  onOpenSettings: () => void;
};

export function ProfileScreen({ onClose, onOpenSettings }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

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
        <Text style={styles.title}>Your Profile</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>NS</Text>
          </View>
            <Text style={styles.fullName}>Naveen Sambhoju</Text>
        </View>
        <View style={styles.section}>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Groups</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <TouchableOpacity onPress={onOpenSettings}>
            <Text style={styles.sectionLink}>Settings</Text>
          </TouchableOpacity>
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
      gap: 24,
      paddingTop: 32,
    },
    avatarWrapper: {
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: palette.accentStrong,
    },
    avatarInitials: {
      color: palette.accentContrast,
      fontSize: 32,
      fontWeight: '700',
    },
    fullName: {
      color: palette.textPrimary,
      fontSize: 20,
      fontWeight: '600',
    },
    section: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: palette.border,
    },
    sectionLink: {
      color: palette.accent,
      fontSize: 16,
      fontWeight: '600',
    },
  });
