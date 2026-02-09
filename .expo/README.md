# GeoGossip Project Tabs

This document doubles as a quick project description while we sketch out the different UI tabs the GeoGossip app should eventually expose.

## Map Tab
- Full screen Google Map centered on Hyderabad using `react-native-maps`.
- Shows the user's live position (if permissions are granted) together with curated pins like the GeoGossip HQ marker in the prototype.
- Lets people zoom/pan and provides context to the gossip feed below the fold.

## Gossip Feed Tab
- Expandable bottom sheet lists the freshest hyper-local posts (safety alerts, hangouts, food finds, etc.).
- Each card includes category, freshness timestamp, title, and a short description.
- When contracted it surfaces the aggregate count plus the coordinates of the current viewport.

## Project Description Tab
- Explains the mission: "map-first updates for every neighborhood" with a Hyderabad pilot.
- Lists our immediate goals (slick UX, mock data for demos, easy API key configuration via `.env`).
- Links back to the top-level `README.md` for prerequisites, setup steps, and environment commands.

## Future Tabs
- **Bookmarks** for saving favorite gossips or map spots.
- **Submit** flow for composing a new gossip with geotagging.
- **Profile** for notification preferences and device-specific settings.

> Note: `.expo` is still excluded from source control; this markdown is purely a scratchpad for the product direction while iterating locally.
