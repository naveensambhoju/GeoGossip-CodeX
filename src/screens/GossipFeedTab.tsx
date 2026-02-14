import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gossip } from '../types';
import { GossipCard } from '../components/GossipCard';

type Props = {
  gossips: Gossip[];
  onDelete?: (id: string) => void;
  onRepost?: (id: string) => void;
  deletingId?: string | null;
  repostingId?: string | null;
};

export function GossipFeedTab({ gossips, onDelete, onRepost, deletingId, repostingId }: Props) {
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
            {isReposting ? <ActivityIndicator size="small" color="#064e3b" /> : <Text style={styles.repostButtonText}>Repost</Text>}
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.deleteButton, isBusy && styles.deleteButtonLoading]}
          onPress={confirmDelete}
          disabled={isBusy}
        >
          {isDeleting ? <ActivityIndicator size="small" color="#f8fafc" /> : <Text style={styles.deleteButtonText}>Delete</Text>}
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

const styles = StyleSheet.create({
  infoScroll: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
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
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fb7185',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecdd3',
    shadowColor: '#fb7185',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  deleteButtonLoading: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  repostButton: {
    backgroundColor: '#34d399',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    shadowColor: '#34d399',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  repostButtonText: {
    color: '#064e3b',
    fontWeight: '700',
  },
});
