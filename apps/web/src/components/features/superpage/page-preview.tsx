import Image from 'next/image';
import { User } from 'lucide-react';
import type { PagePreviewProps } from './types';

export function PagePreview({ profile, activeTheme, iconOptions }: PagePreviewProps) {
  return (
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
            const IconComponent = iconOptions[link.icon] || iconOptions.Link;
            
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
  );
} 