import { Gossip, TabKey } from '../types';

export const HYDERABAD = {
  latitude: 17.4435,
  longitude: 78.3772,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const mockGossips: Gossip[] = [
  {
    id: '1',
    title: 'Speed trap near Cyber Towers',
    body: 'Police checking licenses till 9pm.',
    category: 'Safety',
    freshness: '5 min ago',
  },
  {
    id: '2',
    title: 'Live band at Jubilee Hills café',
    body: 'Walk-in allowed, starts 8pm.',
    category: 'Event',
    freshness: '18 min ago',
  },
  {
    id: '3',
    title: 'Secret dosa cart',
    body: 'Park road next to KBR gate.',
    category: 'Food',
    freshness: '24 min ago',
  },
  {
    id: '4',
    title: 'Parking cleared at Inorbit',
    body: 'Level P3 reopened.',
    category: 'Parking',
    freshness: '35 min ago',
  },
  {
    id: '5',
    title: 'Accident at Gachibowli flyover',
    body: 'Two-wheeler down, expect slow traffic.',
    category: 'Alert',
    freshness: '1 hr ago',
  },
];

export const GOSSIP_TYPES = ['General', 'Traffic', 'Emergency', 'Event', 'News'];

export const TABS: { key: TabKey; label: string }[] = [
  { key: 'map', label: 'Gossips' },
  { key: 'feed', label: 'My Gossips' },
];
