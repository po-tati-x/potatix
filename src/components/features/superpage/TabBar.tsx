type TabItem = {
  id: string;
  label: string;
};

interface TabBarProps {
  activeTab: string;
  tabs: TabItem[];
  onTabChange: (tabId: string) => void;
}

export function TabBar({ activeTab, tabs, onTabChange }: TabBarProps) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex space-x-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`pb-2 text-sm ${activeTab === tab.id 
              ? 'border-b-2 border-emerald-600 text-emerald-600 font-medium' 
              : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
} 