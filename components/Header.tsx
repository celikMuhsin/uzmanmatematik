
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Crown, Menu, Gamepad2, LogOut } from 'lucide-react';
import { Page, Lesson, Topic } from '../types';

interface HeaderProps {
  onNavigate: (page: Page, data?: any) => void;
  userName: string;
  lessons: Lesson[];
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, userName, lessons, onLogoClick }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const isAdmin = userName === "Admin" || userName.includes("muhsin");

  const menuItems = [
    { label: 'Ana Sayfa', action: () => onNavigate(Page.Home) },
    { label: 'Dersler', type: 'dropdown', key: 'lessons' },
    { label: 'Oyunlar', action: () => onNavigate(Page.Games), icon: <Gamepad2 size={14} className="text-orange-500" /> },
    { label: 'Profilim', action: () => onNavigate(Page.Profile) },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] w-full">
      <div className="w-full px-4 md:px-12 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onNavigate(Page.Home)}>
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 group-hover:rotate-6 transition-all">
            <span className="text-white font-black text-2xl tracking-tighter">UM</span>
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight hidden sm:inline">
            Uzman<span className="text-indigo-600">Matematik</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-2">
          {menuItems.map((item) => (
            <div key={item.label} className="relative group h-20 flex items-center" onMouseEnter={() => item.type === 'dropdown' && setActiveMenu(item.key)} onMouseLeave={() => { setActiveMenu(null); setActiveLesson(null); }}>
              <button onClick={item.action} className="px-5 py-2.5 text-sm font-black text-slate-600 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-2 hover:bg-slate-50 whitespace-nowrap">
                {item.icon}
                {item.label}
                {item.type === 'dropdown' && <ChevronDown size={14} className="opacity-50" />}
              </button>

              {item.type === 'dropdown' && activeMenu === item.key && (
                <div className="absolute top-16 left-0 w-72 bg-white shadow-2xl rounded-[2rem] border border-slate-100 py-4 animate-in fade-in slide-in-from-top-4 duration-300 p-2">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="relative" onMouseEnter={() => setActiveLesson(lesson.id)}>
                      <div className="flex items-center justify-between px-6 py-3 text-sm font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-2xl cursor-pointer transition-all">
                        {lesson.name}
                        <ChevronRight size={14} />
                      </div>
                      {activeLesson === lesson.id && (
                        <div className="absolute top-0 left-full w-72 bg-white shadow-2xl rounded-[2rem] border border-slate-100 py-4 ml-3 animate-in fade-in slide-in-from-left-4 duration-300 p-2">
                          {lesson.topics.map((topic) => (
                            <div key={topic.id} onClick={() => onNavigate(Page.TopicContent, topic)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 rounded-2xl cursor-pointer transition-all">
                              {topic.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div onClick={() => onNavigate(Page.Profile)} className="flex items-center space-x-3 text-slate-700 bg-slate-50 pl-4 pr-1.5 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all shadow-sm group">
          <div className="flex flex-col items-end leading-none">
             <span className="text-sm font-black text-slate-900">{userName}</span>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Öğrenci</span>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 group-hover:scale-110 transition-transform ${isAdmin ? 'bg-amber-100 border-amber-300' : 'bg-white border-slate-200'}`}>
            {isAdmin ? <Crown size={18} className="text-amber-600 fill-amber-600" /> : <User size={20} className="text-slate-600" />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
