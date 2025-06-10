import { ArrowLeft, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';
import { SuperpageHeaderProps } from './types';

export function SuperpageHeader({ 
  showPreview, 
  saving, 
  onTogglePreview, 
  onSave, 
  onBack 
}: SuperpageHeaderProps) {
  return (
    <>
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
          onClick={onBack}
        >
          Back to dashboard
        </Button>
      </div>

      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Superpage</h1>
            <p className="mt-1 text-sm text-slate-600">
              Customize your public landing page with all your important links
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="outline"
              size="small"
              icon={showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              onClick={onTogglePreview}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            
            <Button
              type="primary"
              size="small"
              icon={saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              disabled={saving}
              onClick={onSave}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
} 