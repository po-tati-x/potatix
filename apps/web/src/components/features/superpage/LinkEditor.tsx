import { Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';
import type { LinkEditorProps } from './types';

export function LinkEditor({ 
  link, 
  iconOptions, 
  onLinkChange, 
  onDeleteLink, 
  provided,
  isDragging 
}: LinkEditorProps) {
  // Extract the style to fix typescript error
  const style = provided.draggableProps.style as React.CSSProperties;
  
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={style}
      className={`bg-white border rounded-md overflow-hidden transition-all ${
        isDragging
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
              onChange={(e) => onLinkChange(link.id, 'title', e.target.value)}
              placeholder="Link Title"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
            
            <input
              type="url"
              value={link.url}
              onChange={(e) => onLinkChange(link.id, 'url', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>
        
        <select
          value={link.icon}
          onChange={(e) => onLinkChange(link.id, 'icon', e.target.value)}
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
            onClick={() => onLinkChange(link.id, 'enabled', !link.enabled)}
            className={`p-1.5 rounded-md ${link.enabled 
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            {link.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          
          <button
            type="button"
            onClick={() => onDeleteLink(link.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
} 