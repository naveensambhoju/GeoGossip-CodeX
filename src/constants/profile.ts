export const PROFILE_USER = {
  initials: 'NS',
  fullName: 'Naveen Sambhoju',
};

export type ProfileSection = {
  label: string;
  action?: 'groups' | 'settings';
};

export const PROFILE_SECTIONS: ProfileSection[] = [
  { label: 'Groups', action: 'groups' },
  { label: 'Settings', action: 'settings' },
];
