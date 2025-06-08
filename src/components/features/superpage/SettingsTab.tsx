import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';
import { SettingsTabProps } from './types';

export function SettingsTab({ onOpenPublicPage }: SettingsTabProps) {
  return (
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
              onClick={onOpenPublicPage}
            >
              Open Public Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 