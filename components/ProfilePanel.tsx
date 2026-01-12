
import React from 'react';
import { User, Trophy, Star, Medal, Target, Award, ArrowRight, LogOut, Mail, Calendar } from 'lucide-react';
import { ScoreRecord } from '../types';

interface ProfilePanelProps {
  userName: string;
  gamePoints: number;
  scores: ScoreRecord[];
  onLogout: () => void;
  isAdmin: boolean;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ userName, gamePoints, scores, onLogout, isAdmin }) => {
  const userScores = scores || [];
  const averageScore = userScores.length > 0 
    ? Math.round(userScores.reduce((acc, curr) => acc + curr.score, 0) / userScores.length) 
    : 0;

  const currentEmail = localStorage.getItem('uzman_session');

  const badges = [
    { id: 1, name: 'Çaylak Çözücü', icon: <Star />, minPoints: 0, color: 'bg-slate-100 text-slate-500' },
    { id: 2, name: 'Sayıların Efendisi', icon: <Medal />, minPoints: 250, color: 'bg-blue-100 text-blue-600' },
    { id: 3, name: 'Problem Canavarı', icon: <Target />, minPoints: 750, color: 'bg-indigo-100 text-indigo-600' },
    { id: 4, name: 'Matematik Elçisi', icon: <Award />, minPoints: 1500, color: 'bg-amber-100 text-amber-600' },
    { id: 5, name: 'Uzman Deha', icon: <Trophy />, minPoints: 3000, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl -mr-40 -mt-40 -z-10"></div>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className={`w-40 h-40 rounded-[2.5rem] flex items-center justify-center border-4 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500 ${isAdmin ? 'bg-amber-100 border-amber-200' : 'bg-indigo-600 border-indigo-100'}`}>
              <User size={80} className={isAdmin ? 'text-amber-600' : 'text-white'} />
            </div>
            {isAdmin && <div className="absolute -top-4 -right-4 bg-amber-500 text-white p-3 rounded-2xl shadow-lg border-4 border-white"><Award size={24}/></div>}
          </div>
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-5xl font-black text-slate-800 tracking-tight">{userName}</h1>
            <div className="flex flex-col md:flex-row items-center gap-4 text-slate-400 font-bold">
              <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"><Mail size={16}/> {currentEmail}</span>
              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {isAdmin ? 'Yönetici Paneli Erişimi' : 'Öğrenci Hesabı'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Trophy size={28}/>} value={gamePoints} label="Toplam Puan" color="amber" />
        <StatCard icon={<Target size={28}/>} value={userScores.length} label="Bitirilen Test" color="indigo" />
        <StatCard icon={<Star size={28}/>} value={`%${averageScore}`} label="Başarı Oranı" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6">
          <h3 className="text-xl font-black text-slate-800 border-b border-slate-50 pb-4">Rozet Koleksiyonu</h3>
          <div className="space-y-4">
            {badges.map(badge => (
              <div key={badge.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${gamePoints >= badge.minPoints ? 'bg-white border-slate-100 shadow-sm' : 'opacity-30 grayscale'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gamePoints >= badge.minPoints ? badge.color : 'bg-slate-50 text-slate-300'}`}>{badge.icon}</div>
                <div>
                  <div className="text-sm font-black text-slate-800">{badge.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{badge.minPoints} Puan Gerektirir</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800">Sınav Geçmişi</h3>
            <Calendar className="text-slate-300" size={20} />
          </div>
          <div className="p-8 flex-grow overflow-y-auto max-h-[400px] space-y-4">
            {userScores.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-bold italic">Henüz bir sınav kaydınız bulunmuyor.</div>
            ) : (
              userScores.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl ${s.score >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>{s.score}</div>
                    <div>
                      <div className="font-black text-slate-800">{s.topicName}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{s.date} • {Math.floor(s.timeTaken / 60)}dk {s.timeTaken % 60}sn</div>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-indigo-600 transition-transform" />
                </div>
              ))
            )}
          </div>
          <div className="p-8 bg-slate-50 border-t border-slate-100">
             <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-5 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-black hover:bg-red-50 transition-all shadow-sm">
               <LogOut size={20} /> Hesaptan Güvenli Çıkış Yap
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, color }: any) => {
  const colors: any = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  return (
    <div className={`bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all text-center space-y-4`}>
      <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
      <div className="text-4xl font-black text-slate-800">{value}</div>
      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
};

export default ProfilePanel;
