import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMemo } from 'react';
import { Gossip } from '../types';
import { GossipCard } from '../components/GossipCard';
import { ThemePalette, useTheme } from '../theme';

type Props = {
  gossips: Gossip[];
  onDelete?: (id: string) => void;
  onRepost?: (id: string) => void;
  deletingId?: string | null;
  repostingId?: string | null;
};

export function GossipFeedTab({ gossips, onDelete, onRepost, deletingId, repostingId }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const renderActions = (gossip: Gossip) => {
    if (!onDelete) return null;
    const isDeleting = deletingId === gossip.id;
    const isExpired = gossip.expiryLabel === 'Expired';
    const isReposting = repostingId === gossip.id;
    const isBusy = isDeleting || isReposting;
    const confirmDelete = () =>
      Alert.alert('Delete gossip', 'Are you sure you want to remove this gossip?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(gossip.id) },
      ]);

    const confirmRepost = () =>
      Alert.alert('Repost gossip', 'Publish this gossip again with the same details?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Repost', onPress: () => onRepost?.(gossip.id) },
      ]);

    return (
      <View style={styles.actionsRow}>
        {isExpired && onRepost ? (
          <TouchableOpacity
            style={[styles.repostButton, isBusy && styles.deleteButtonLoading]}
            onPress={confirmRepost}
            disabled={isBusy}
          >
            {isReposting ? (
              <ActivityIndicator size="small" color={palette.successText} />
            ) : (
              <Text style={styles.repostButtonText}>Repost</Text>
            )}
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.deleteButton, isBusy && styles.deleteButtonLoading]}
          onPress={confirmDelete}
          disabled={isBusy}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={palette.accentContrast} />
          ) : (
            <Text style={styles.deleteButtonText}>Delete</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.infoScroll}>
      <Text style={styles.sectionHero}>Live gossip rundown</Text>
      <FlatList
        data={gossips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GossipCard item={item} actions={renderActions(item)} />}
        contentContainerStyle={{ paddingBottom: 32, gap: 12, paddingTop: 12 }}
        style={styles.list}
      />
    </View>
  );
}

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    infoScroll: {
      flex: 1,
      backgroundColor: palette.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
  list: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
    sectionHero: {
      color: palette.textPrimary,
      fontSize: 18,
      fontWeight: '600',
    },
    deleteButton: {
      backgroundColor: palette.danger,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.dangerBorder,
      shadowColor: palette.danger,
      shadowOpacity: 0.25,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
  deleteButtonLoading: {
    opacity: 0.7,
  },
    deleteButtonText: {
      color: palette.accentContrast,
      fontWeight: '600',
    },
    repostButton: {
      backgroundColor: palette.success,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.successBorder,
      shadowColor: palette.success,
      shadowOpacity: 0.25,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    repostButtonText: {
      color: palette.successText,
      fontWeight: '700',
    },
  });
