import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onClose: () => void;
  onOpenSettings: () => void;
};

export function ProfileScreen({ onClose, onOpenSettings }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>{'←'}</Text>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 20,
    paddingTop: 16,
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
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#f8fafc',
    fontSize: 20,
  },
  title: {
    color: '#f8fafc',
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
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#e0f2fe',
    fontSize: 32,
    fontWeight: '700',
  },
  fullName: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionLink: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '600',
  },
});
