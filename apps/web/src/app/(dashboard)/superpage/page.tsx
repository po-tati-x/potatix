'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { ThemeId, ThemeOption } from '@/components/features/superpage';
import type { DropResult } from '@hello-pangea/dnd';

// Import superpage components
import {
  SuperpageHeader,
  TabBar,
  LinksTab,
  AppearanceTab,
  SettingsTab,
  PagePreview,
  ICON_OPTIONS,
  THEME_OPTIONS,
  MOCK_PROFILE,
} from '@/components/features/superpage';

export default function SuperpagePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('links');
  
  // Get active theme
  const activeTheme = (
    THEME_OPTIONS.find(theme => theme.id === profile.theme) || THEME_OPTIONS[0]
  ) as ThemeOption;

  // Handle form field changes
  const handleProfileChange = (field: string, value: string) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  // Handle link changes
  const handleLinkChange = (id: string, field: string, value: string | boolean) => {
    setProfile({
      ...profile,
      links: profile.links.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      ),
    });
  };

  // Add new link
  const handleAddLink = () => {
    const newId = Math.max(0, ...profile.links.map(link => Number.parseInt(link.id))) + 1;
    setProfile({
      ...profile,
      links: [
        ...profile.links,
        {
          id: newId.toString(),
          title: 'New Link',
          url: '',
          type: 'link',
          icon: 'Link',
          enabled: true,
        },
      ],
    });
  };

  // Delete link
  const handleDeleteLink = (id: string) => {
    setProfile({
      ...profile,
      links: profile.links.filter(link => link.id !== id),
    });
  };

  // Handle link reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    const newLinks = [...profile.links];
    const [removed] = newLinks.splice(sourceIndex, 1);
    newLinks.splice(destIndex, 0, removed!);

    setProfile({
      ...profile,
      links: newLinks,
    });
  };

  // Handle theme change
  const handleThemeChange = (themeId: ThemeId) => {
    setProfile({
      ...profile,
      theme: themeId,
    });
  };

  // Handle save
  const handleSave = () => {
    setSaving(true);
    
    setTimeout(() => {
      setSaving(false);
    }, 600);
  };

  // Handle opening public page
  const handleOpenPublicPage = () => {
    window.open(`https://potatix.so/${profile.username}`, '_blank');
  };

  // Available tabs
  const tabs = [
    { id: 'links', label: 'Links' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <SuperpageHeader 
        showPreview={showPreview}
        saving={saving}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onSave={handleSave}
        onBack={() => router.push('/dashboard')}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className={`${showPreview ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-5`}>
          {/* Tabs */}
          <TabBar 
            activeTab={activeTab}
            tabs={tabs}
            onTabChange={setActiveTab}
          />
          
          {/* Links tab */}
          {activeTab === 'links' && (
            <LinksTab 
              links={profile.links}
              iconOptions={ICON_OPTIONS}
              onAddLink={handleAddLink}
              onLinkChange={handleLinkChange}
              onDeleteLink={handleDeleteLink}
              onDragEnd={handleDragEnd}
            />
          )}
          
          {/* Appearance tab */}
          {activeTab === 'appearance' && (
            <AppearanceTab 
              profile={profile}
              themeOptions={THEME_OPTIONS}
              onProfileChange={handleProfileChange}
              onThemeChange={handleThemeChange}
            />
          )}
          
          {/* Settings tab */}
          {activeTab === 'settings' && (
            <SettingsTab 
              username={profile.username}
              onOpenPublicPage={handleOpenPublicPage}
            />
          )}
        </div>
        
        {/* Preview (only visible when showPreview is true) */}
        {showPreview && (
          <div className="lg:col-span-1">
            <PagePreview 
              profile={profile}
              activeTheme={activeTheme}
              iconOptions={ICON_OPTIONS}
            />
          </div>
        )}
      </div>
    </div>
  );
}
