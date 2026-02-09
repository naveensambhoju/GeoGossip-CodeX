export type Gossip = {
  id: string;
  title: string;
  body: string;
  category: string;
  freshness: string;
};

export type TabKey = 'map' | 'feed';
export type LocationPreference = 'current' | 'map';
export type MapVisualType = 'standard' | 'satellite';
export type PlaceSuggestion = { id: string; description: string; placeId: string };
