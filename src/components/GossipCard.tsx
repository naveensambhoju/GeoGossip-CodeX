import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gossip } from '../types';

type Props = {
  item: Gossip;
  actions?: ReactNode;
};

export function GossipCard({ item, actions }: Props) {
  const isExpired = item.expiryLabel === 'Expired';
  const freshnessDisplay = isExpired
    ? `${item.freshness}`
    : item.expiryLabel
    ? `${item.freshness} (${item.expiryLabel})`
    : item.freshness;

  return (
    <View style={styles.card}>
      <View style={styles.cardMeta}>
        <View style={styles.cardMetaLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>NS</Text>
          </View>
          <View>
            <Text style={styles.cardCategory}>{item.category}</Text>
            <Text style={styles.cardAuthor}>Posted by Naveen</Text>
          </View>
        </View>
        <View style={styles.cardMetaRight}>
          {isExpired ? <Text style={styles.expiredTag}>Expired</Text> : null}
          <Text style={styles.cardFreshness}>{freshnessDisplay}</Text>
        </View>
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
    alignItems: 'center',
    gap: 12,
  },
  cardMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardCategory: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  cardAuthor: {
    color: '#94a3b8',
    fontSize: 12,
  },
  cardMetaRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  cardFreshness: {
    color: '#94a3b8',
  },
  expiredTag: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    color: '#f87171',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: '600',
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#7c2d12',
    fontWeight: '700',
  },
});
