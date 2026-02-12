import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Gossip } from '../types';
import { GossipCard } from '../components/GossipCard';

type Props = {
  gossips: Gossip[];
  onDelete?: (id: string) => void;
};

export function GossipFeedTab({ gossips, onDelete }: Props) {
  return (
    <ScrollView style={styles.infoScroll} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.sectionHero}>Live gossip rundown</Text>
      {gossips.map((item) => (
        <GossipCard
          key={item.id}
          item={item}
          actions={
            onDelete ? (
              <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  infoScroll: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
  },
  sectionHero: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
});
