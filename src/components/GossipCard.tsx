import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gossip } from '../types';

type Props = {
  item: Gossip;
  actions?: ReactNode;
};

export function GossipCard({ item, actions }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.cardMeta}>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardFreshness}>
          {item.freshness}
          {item.expiryLabel ? ` (${item.expiryLabel})` : ''}
        </Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardBody}>{item.body}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.cardActions}>{actions ?? null}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e2b45',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2f3e5a',
    gap: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardCategory: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  cardFreshness: {
    color: '#94a3b8',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  cardBody: {
    color: '#e2e8f0',
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardActions: {
    flex: 1,
  },
});
