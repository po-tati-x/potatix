'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trash2,
  PlusCircle,
  Eye,
  EyeOff,
  Save,
  GripVertical,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  Github,
  Facebook,
  Mail,
  ExternalLink,
  FileText,
  Loader2,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import Image from 'next/image';

// Mock data for the user's manpage
const mockProfile = {
  username: 'johndeveloper',
  displayName: 'John Developer',
  bio: 'Software engineer, course creator, and open source contributor',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop',
  theme: 'emerald',
  links: [
    {
      id: '1',
      title: 'Advanced TypeScript Development',
      url: 'https://potatix.dev/c/typescript',
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
      url: 'https://potatix.dev/c/react-masterclass',
      type: 'course',
      icon: 'FileText',
      enabled: false,
    },
  ]
};

// Available icons for links
const iconOptions = {
  'Link': LinkIcon,
  'Instagram': Instagram,
  'Twitter': Twitter,
  'Youtube': Youtube,
  'Github': Github,
  'Facebook': Facebook,
  'Mail': Mail,
  'FileText': FileText,
};

// Available themes
const themeOptions = [
  { 
    id: 'emerald', 
    name: 'Emerald',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    bgClass: 'bg-emerald-50',
    accentClass: 'border-emerald-600 text-emerald-800', 
  },
  { 
    id: 'slate', 
    name: 'Slate',
    buttonClass: 'bg-slate-800 hover:bg-slate-900 text-white',
    bgClass: 'bg-slate-50',
    accentClass: 'border-slate-800 text-slate-800',
  },
  { 
    id: 'amber', 
    name: 'Amber',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    bgClass: 'bg-amber-50', 
    accentClass: 'border-amber-600 text-amber-800',
  },
  { 
    id: 'blue', 
    name: 'Blue',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    bgClass: 'bg-blue-50',
    accentClass: 'border-blue-600 text-blue-800', 
  },
  { 
    id: 'red', 
    name: 'Red',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
    bgClass: 'bg-red-50',
    accentClass: 'border-red-600 text-red-800',
  },
  { 
    id: 'purple', 
    name: 'Purple',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white', 
    bgClass: 'bg-purple-50',
    accentClass: 'border-purple-600 text-purple-800',
  },
];

export default function ManpagePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(mockProfile);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('links');
  
  // Get active theme
  const activeTheme = themeOptions.find(theme => theme.id === profile.theme) || themeOptions[0];

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
    const newId = Math.max(0, ...profile.links.map(link => parseInt(link.id))) + 1;
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

    const newLinks = Array.from(profile.links);
    const [removed] = newLinks.splice(sourceIndex, 1);
    newLinks.splice(destIndex, 0, removed);

    setProfile({
      ...profile,
      links: newLinks,
    });
  };

  // Handle theme change
  const handleThemeChange = (themeId: string) => {
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-6">
        <Button
          type="text"
          size="tiny"
          icon={
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              <ArrowLeft className="h-3 w-3" />
            </span>
          }
          className="text-slate-500 hover:text-slate-900 group"
          onClick={() => router.push('/dashboard')}
        >
          Back to dashboard
        </Button>
      </div>

      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-slate-900">ManPage</h1>
            <p className="mt-1 text-sm text-slate-600">
              Customize your public landing page with all your important links
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="outline"
              size="small"
              icon={showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            
            <Button
              type="primary"
              size="small"
              icon={saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className={`${showPreview ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-5`}>
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex space-x-6">
              <button
                className={`pb-2 text-sm ${activeTab === 'links' 
                  ? 'border-b-2 border-emerald-600 text-emerald-600 font-medium' 
                  : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('links')}
              >
                Links
              </button>
              <button 
                className={`pb-2 text-sm ${activeTab === 'appearance'
                  ? 'border-b-2 border-emerald-600 text-emerald-600 font-medium'
                  : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('appearance')}
              >
                Appearance
              </button>
              <button
                className={`pb-2 text-sm ${activeTab === 'settings'
                  ? 'border-b-2 border-emerald-600 text-emerald-600 font-medium'
                  : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>
          
          {/* Links tab */}
          {activeTab === 'links' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-medium text-slate-900">Your Links</h2>
                <Button
                  type="outline"
                  size="small"
                  icon={<PlusCircle className="h-3.5 w-3.5" />}
                  onClick={handleAddLink}
                >
                  Add Link
                </Button>
              </div>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="links">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {profile.links.map((link, index) => (
                        <Draggable key={link.id} draggableId={link.id} index={index}>
                          {(provided, snapshot) => {
                            // Extract the style to fix typescript error
                            const style = provided.draggableProps.style as React.CSSProperties;
                            
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={style}
                                className={`bg-white border rounded-md overflow-hidden transition-all ${
                                  snapshot.isDragging
                                    ? 'border-slate-400 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="p-3 flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab hover:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4 text-slate-400" />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        value={link.title}
                                        onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                                        placeholder="Link Title"
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                      />
                                      
                                      <input
                                        type="url"
                                        value={link.url}
                                        onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                      />
                                    </div>
                                  </div>
                                  
                                  <select
                                    value={link.icon}
                                    onChange={(e) => handleLinkChange(link.id, 'icon', e.target.value)}
                                    className="px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                  >
                                    {Object.keys(iconOptions).map((icon) => (
                                      <option key={icon} value={icon}>
                                        {icon}
                                      </option>
                                    ))}
                                  </select>
                                  
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleLinkChange(link.id, 'enabled', !link.enabled)}
                                      className={`p-1.5 rounded-md ${link.enabled 
                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                      {link.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                    </button>
                                    
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLink(link.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              {profile.links.length === 0 && (
                <div className="text-center py-12 border border-dashed border-slate-300 rounded-md bg-slate-50">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-4">
                    <LinkIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  
                  <h3 className="text-sm font-medium text-slate-900 mb-2">No links yet</h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                    Add links to your important resources, social profiles, and more.
                  </p>
                  
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusCircle className="h-3.5 w-3.5" />}
                    onClick={handleAddLink}
                  >
                    Add Your First Link
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Appearance tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-slate-900 mb-3">Profile Information</h2>
                
                <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                        {profile.avatar ? (
                          <Image
                            src={profile.avatar}
                            alt={profile.displayName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400">
                            <User className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <Button
                          type="outline"
                          size="small"
                        >
                          Change Photo
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={profile.displayName}
                          onChange={(e) => handleProfileChange('displayName', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">
                          Username
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                            potatix.dev/
                          </span>
                          <input
                            type="text"
                            value={profile.username}
                            onChange={(e) => handleProfileChange('username', e.target.value)}
                            className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-none rounded-r-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                      />
                      <p className="text-xs text-slate-500">
                        Brief description that appears below your name. Max 160 characters.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-slate-900 mb-3">Theme</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`flex flex-col items-center p-3 border rounded-md ${
                        profile.theme === theme.id
                          ? `border-2 ${theme.accentClass} bg-white`
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-md mb-2 ${theme.buttonClass}`} />
                      <span className="text-xs font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Settings tab */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                  <h2 className="text-sm font-medium text-slate-900">Page Settings</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Public Page</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Make your page visible to everyone</p>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        id="public-page" 
                        name="publicPage" 
                        defaultChecked={true}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 transition-colors cursor-pointer peer-focus:ring-2 peer-focus:ring-emerald-500"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Analytics</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Track visits and clicks on your page</p>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        id="analytics" 
                        name="analytics"
                        defaultChecked={true} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 transition-colors cursor-pointer peer-focus:ring-2 peer-focus:ring-emerald-500"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100">
                    <Button
                      type="outline"
                      size="small"
                      icon={<ExternalLink className="h-3.5 w-3.5" />}
                      onClick={() => window.open(`https://potatix.dev/${profile.username}`, '_blank')}
                    >
                      Open Public Page
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Preview (only visible when showPreview is true) */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className={`border rounded-md overflow-hidden ${activeTheme.bgClass}`}>
              <div className="pt-8 pb-4 px-4 flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-sm mb-3">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.displayName}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-base font-medium text-slate-900 mb-1">
                  {profile.displayName || 'Your Name'}
                </h2>
                
                <p className="text-xs text-slate-600 max-w-[220px] mb-4">
                  {profile.bio || 'Add a bio to tell people more about yourself'}
                </p>
              </div>
              
              <div className="px-4 pb-8 space-y-3">
                {profile.links
                  .filter(link => link.enabled)
                  .map((link) => {
                    const IconComponent = iconOptions[link.icon as keyof typeof iconOptions] || LinkIcon;
                    
                    return (
                      <a
                        key={link.id}
                        href={link.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md ${activeTheme.buttonClass} w-full transition-transform active:scale-[0.98]`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{link.title}</span>
                      </a>
                    );
                  })}
                
                {profile.links.filter(link => link.enabled).length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-xs text-slate-500">No active links to display</p>
                  </div>
                )}
              </div>
              
              <div className="px-4 pb-4 text-center">
                <p className="text-xs text-slate-500">
                  powered by <span className="font-medium">potatix</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
