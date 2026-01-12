
import React from 'react';
import { Home, BookOpen, HelpCircle, User, Settings, LogOut, ShieldCheck, X, Gamepad2 } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  onLogout?: () => void;
  isAdmin?: boolean;
  onNavigate: (page: any) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isAdmin, onNavigate, isMobileOpen, onCloseMobile }) => {
  const menuItems = [
    { icon: <Home size={20} />, label: 'Panel', page: Page.Home },
    { icon: <BookOpen size={20} />, label: 'Derslerim', page: Page.TopicContent },
    { icon: <Gamepad2 size={20} />, label: 'Oyunlar', page: Page.Games },
    { icon: <HelpCircle size={20} />, label: 'Sorularım', page: Page.Quiz },
    { icon: <User size={20} />, label: 'Profilim', page: Page.Profile },
  ];

  if (isAdmin) {
    menuItems.push({ icon: <ShieldCheck size={20} />, label: 'Yönetim Paneli', page: 'admin' as any });
  }

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[150] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-20 lg:w-64 md:shadow-none md:border-r md:border-slate-200 md:flex md:flex-col md:h-[calc(100vh-64px)] md:sticky md:top-16
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140] md:hidden animate-in fade-in duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between p-6 md:hidden">
           <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                 <span className="text-white font-black text-sm">U</span>
              </div>
              <span className="font-black text-slate-800 tracking-tight">UzmanMatematik Menüsü</span>
           </div>
           <button 
             onClick={onCloseMobile}
             className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
           >
             <X size={20} />
           </button>
        </div>

        <nav className="flex-grow py-6 px-4">
          <ul className="space-y-2">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <button 
                  onClick={() => {
                    onNavigate(item.page);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-start gap-3 p-3 rounded-xl transition-all group ${
                    item.label === 'Yönetim Paneli' 
                      ? 'text-amber-600 hover:bg-amber-50' 
                      : item.label === 'Oyunlar'
                      ? 'text-orange-600 hover:bg-orange-50'
                      : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="inline md:hidden lg:inline text-sm font-bold">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => {
              if (onLogout) onLogout();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-start gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
          >
            <LogOut size={20} />
            <span className="inline md:hidden lg:inline text-sm">Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
