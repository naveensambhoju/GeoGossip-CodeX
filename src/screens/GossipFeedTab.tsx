import { ScrollView, StyleSheet, Text } from 'react-native';
import { Gossip } from '../types';
import { GossipCard } from '../components/GossipCard';

type Props = {
  gossips: Gossip[];
};

export function GossipFeedTab({ gossips }: Props) {
  return (
    <ScrollView style={styles.infoScroll} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.sectionHero}>Live gossip rundown</Text>
      {gossips.map((item) => (
        <GossipCard key={item.id} item={item} />
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
});
