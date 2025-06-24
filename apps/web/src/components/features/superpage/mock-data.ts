import type { ProfileData } from './types';

// Mock data for the user's superpage
export const MOCK_PROFILE: ProfileData = {
  username: 'johndeveloper',
  displayName: 'John Developer',
  bio: 'Software engineer, course creator, and open source contributor',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop',
  theme: 'emerald',
  links: [
    {
      id: '1',
      title: 'Advanced TypeScript Development',
      url: 'https://typescript.potatix.com/',
      type: 'course',
      icon: 'FileText',
      enabled: true,
    },
    {
      id: '2',
      title: 'My GitHub Profile',
      url: 'https://github.com/johndeveloper',
      type: 'github',
      icon: 'Github',
      enabled: true,
    },
    {
      id: '3', 
      title: 'Follow me on Twitter',
      url: 'https://twitter.com/johndeveloper',
      type: 'twitter',
      icon: 'Twitter',
      enabled: true,
    },
    {
      id: '4',
      title: 'Subscribe to my YouTube Channel',
      url: 'https://youtube.com/@johndeveloper',
      type: 'youtube',
      icon: 'Youtube',
      enabled: true,
    },
    {
      id: '5',
      title: 'React Masterclass Course',
      url: 'https://react.potatix.com/',
      type: 'course',
      icon: 'FileText',
      enabled: false,
    },
  ]
}; 