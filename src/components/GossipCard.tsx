import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gossip } from '../types';
import { ThemePalette, useTheme } from '../theme';

type Props = {
  item: Gossip;
  actions?: ReactNode;
};

export function GossipCard({ item, actions }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
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

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.border,
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
      color: palette.accent,
      fontWeight: '600',
    },
    cardAuthor: {
      color: palette.textSecondary,
      fontSize: 12,
    },
  cardMetaRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
    cardFreshness: {
      color: palette.textSecondary,
    },
    expiredTag: {
      backgroundColor: palette.dangerSoft,
      color: palette.danger,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      fontSize: 12,
      fontWeight: '600',
    },
    cardTitle: {
      color: palette.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    cardBody: {
      color: palette.textSecondary,
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
      backgroundColor: palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: palette.accentContrast,
      fontWeight: '700',
    },
  });
