
import React from 'react';
import { Trophy, Clock, Calendar } from 'lucide-react';
import { ScoreRecord } from '../types';

interface ScoreBoardProps {
  scores: ScoreRecord[];
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores }) => {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shadow-sm">
            <Trophy className="text-amber-600" size={20} />
          </div>
          Liderlik Tablosu
        </h3>
        <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-widest">En Son Tamamlanan Testler</p>
      </div>
      
      <div className="flex-grow overflow-y-auto max-h-[500px]">
        {scores.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
               <Trophy className="text-slate-300" size={24} />
            </div>
            <p className="text-slate-400 font-bold italic">Henüz bir skor bulunmuyor.</p>
            <p className="text-xs text-slate-300 mt-2">İlk testi çözen sen ol!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {scores.map((record, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${
                    idx === 0 ? 'bg-amber-400 text-amber-900' :
                    idx === 1 ? 'bg-slate-300 text-slate-700' :
                    idx === 2 ? 'bg-orange-300 text-orange-900' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {record.name}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                        <Calendar size={10} /> {record.date}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                        <Clock size={10} /> {Math.floor(record.timeTaken / 60)}dk {record.timeTaken % 60}sn
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-black ${
                    record.score >= 85 ? 'text-green-600' : 
                    record.score >= 60 ? 'text-indigo-600' : 
                    'text-red-500'
                  }`}>
                    {record.score}
                  </div>
                  <div className="text-[9px] font-black text-slate-300 uppercase">PUAN</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-6 bg-slate-50 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100">
        Toplam {scores.length} Kayıt Gösteriliyor
      </div>
    </div>
  );
};

export default ScoreBoard;
