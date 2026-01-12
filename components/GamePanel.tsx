
import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Trophy, Play, CheckCircle2, AlertTriangle, RotateCcw, ArrowRight, History, Hash } from 'lucide-react';

interface GamePanelProps {
  gamePoints: number;
  onUpdatePoints: (points: number) => void;
  isAdmin: boolean;
}

const GamePanel: React.FC<GamePanelProps> = ({ gamePoints, onUpdatePoints, isAdmin }) => {
  const [activeGame, setActiveGame] = useState<'menu' | 'mental-math'>('menu');
  
  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      {/* Header Section - Mobile: Same row alignment */}
      {activeGame === 'menu' ? (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-10 text-white shadow-xl shadow-indigo-100 flex flex-row items-center justify-between gap-2 md:gap-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 md:gap-6 overflow-hidden">
            <div className="w-9 h-9 md:w-16 md:h-16 bg-white/20 rounded-lg md:rounded-[1.5rem] flex-shrink-0 flex items-center justify-center backdrop-blur-md">
              <Gamepad2 className="w-5 h-5 md:w-8 md:h-8" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm md:text-3xl font-black whitespace-nowrap overflow-hidden text-ellipsis">Oyunlar Paneli</h2>
              <p className="text-indigo-100 text-[8px] md:text-sm font-medium mt-0.5 hidden xs:block">Zihnini zinde tut!</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 md:px-8 md:py-4 rounded-xl md:rounded-[2rem] border border-white/20 text-center flex-shrink-0">
            <div className="text-[6px] md:text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-0.5">Puanım</div>
            <div className="text-sm md:text-4xl font-black flex items-center justify-center gap-1.5 md:gap-2">
              <Trophy className="text-amber-400 w-3 h-3 md:w-8 md:h-8" />
              {gamePoints}
            </div>
          </div>
        </div>
      ) : (
        /* Minimal Game Header - Thinner on mobile */
        <div className="bg-white px-4 py-1.5 md:px-8 md:py-4 rounded-xl md:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between animate-in slide-in-from-top-2 duration-300 w-full">
          <div className="flex items-center gap-2 md:gap-4">
            <Gamepad2 className="w-3.5 h-3.5 md:w-6 md:h-6 text-indigo-600" />
            <span className="text-[9px] md:text-lg font-black text-slate-800 uppercase tracking-tighter">Saniye Savaşları</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-indigo-600">
            <Trophy className="w-3 h-3 md:w-5 md:h-5 text-amber-500" />
            <span className="text-[11px] md:text-xl font-black">{gamePoints} Puan</span>
          </div>
        </div>
      )}

      {activeGame === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div 
            onClick={() => setActiveGame('mental-math')}
            className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-1 md:mb-2">Saniye Savaşları</h3>
            <p className="text-slate-500 text-xs md:text-sm mb-4 md:mb-6 leading-relaxed">
              10 sayı sırayla gelecek. Hızlıca topla ve zirveye yerleş!
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-sm font-black text-indigo-600 uppercase tracking-widest">Hemen Başla</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="bg-slate-50 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 border-dashed flex flex-col items-center justify-center text-center opacity-50">
            <h3 className="text-sm md:text-lg font-bold text-slate-400 italic">Yakında Yeni Oyunlar</h3>
          </div>
        </div>
      ) : (
        <SaniyeSavaslariGame 
          onFinish={(p) => onUpdatePoints(p)} 
          onExit={() => setActiveGame('menu')} 
        />
      )}
    </div>
  );
};

// --- MENTAL MATH GAME COMPONENT ---

const SaniyeSavaslariGame: React.FC<{ onFinish: (points: number) => void, onExit: () => void }> = ({ onFinish, onExit }) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'answer' | 'feedback' | 'finished'>('ready');
  const [round, setRound] = useState(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctSum, setCorrectSum] = useState(0);
  const [lastRoundPoints, setLastRoundPoints] = useState(0);
  const [totalGamePoints, setTotalGamePoints] = useState(0);
  const [isError, setIsError] = useState(false);

  const timerRef = useRef<any>(null);

  const startRound = () => {
    const newNumbers: number[] = [];
    for (let i = 0; i < 10; i++) {
      let n;
      do {
        n = Math.floor(Math.random() * 19) - 9;
        if (n === 0) n = Math.random() > 0.5 ? 2 : -2;
      } while (i > 0 && n === newNumbers[i - 1]);
      newNumbers.push(n);
    }

    setNumbers(newNumbers);
    setCorrectSum(newNumbers.reduce((a, b) => a + b, 0));
    setGameState('playing');
    setCurrentIndex(0);
    setUserAnswer("");
    setIsError(false);
    
    let idx = 0;
    timerRef.current = setInterval(() => {
      idx++;
      if (idx >= 10) {
        clearInterval(timerRef.current);
        setTimeout(() => setGameState('answer'), 700);
      } else {
        setCurrentIndex(idx);
      }
    }, 1000);
  };

  const checkAnswer = () => {
    const rawValue = userAnswer.trim();
    const isNumeric = /^-?\d+$/.test(rawValue);
    const val = parseInt(rawValue);
    
    let pts = 0;
    if (rawValue === "" || !isNumeric || isNaN(val)) {
      pts = -25;
      setIsError(true);
    } else if (val === correctSum) {
      pts = 25;
      setIsError(false);
    } else {
      pts = -Math.abs(val - correctSum);
      setIsError(false);
    }
    
    setLastRoundPoints(pts);
    setTotalGamePoints(prev => prev + pts);
    setGameState('feedback');
  };

  const nextRound = () => {
    if (round < 4) {
      setRound(prev => prev + 1);
      setGameState('ready');
    } else {
      setGameState('finished');
      onFinish(totalGamePoints);
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center relative transition-all overflow-hidden">
      <button 
        onClick={onExit}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-slate-600 font-bold text-[10px] md:text-sm bg-slate-50 px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-sm transition-all"
      >
        Çıkış
      </button>

      {gameState === 'ready' && (
        <div className="text-center space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-200">
          <div className="text-indigo-600 font-black text-5xl md:text-7xl tracking-tighter leading-none">TUR {round} / 4</div>
          <p className="text-slate-400 text-[10px] md:text-sm font-black uppercase tracking-[0.4em]">Sayılar Hazır mı?</p>
          <button 
            onClick={startRound}
            className="bg-indigo-600 text-white px-12 py-5 md:px-20 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            OYUNA BAŞLA
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="text-center animate-in zoom-in duration-200 w-full flex flex-col items-center justify-center">
          <div className="text-[10px] md:text-sm font-black uppercase text-slate-300 tracking-widest mb-2 md:mb-6">{currentIndex + 1} / 10</div>
          <div className="text-8xl md:text-[9rem] font-black text-slate-900 leading-[0.85] drop-shadow-sm tracking-tighter">
            {numbers[currentIndex] > 0 ? `+${numbers[currentIndex]}` : numbers[currentIndex]}
          </div>
        </div>
      )}

      {gameState === 'answer' && (
        <div className="text-center space-y-6 md:space-y-8 w-full max-w-xs md:max-w-md animate-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-xl md:text-3xl font-black text-slate-800">Toplam Sonuç?</h3>
          <input 
            type="text" 
            inputMode="numeric"
            autoFocus
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full text-center text-4xl md:text-7xl font-black py-4 md:py-8 bg-slate-50 border-4 border-slate-100 rounded-3xl md:rounded-[2.5rem] focus:border-indigo-600 outline-none transition-all shadow-inner"
            placeholder="0"
          />
          <button 
            onClick={checkAnswer}
            className="w-full bg-slate-900 text-white py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-xl"
          >
            KONTROL ET
          </button>
        </div>
      )}

      {gameState === 'feedback' && (
        <div className="text-center space-y-6 md:space-y-8 w-full animate-in fade-in duration-300 py-4">
          <div className={`text-xl md:text-4xl font-black ${lastRoundPoints > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            <div className="flex items-center justify-center gap-2 md:gap-4">
              {lastRoundPoints > 0 ? <CheckCircle2 className="w-6 h-6 md:w-10 md:h-10" /> : <AlertTriangle className="w-6 h-6 md:w-10 md:h-10" />}
              {isError ? 'GEÇERSİZ GİRİŞ!' : (lastRoundPoints > 0 ? 'MÜKEMMEL!' : 'HATALI!') }
            </div>
            <span className="text-[9px] md:text-sm uppercase font-black bg-slate-50 px-5 py-2 md:px-8 md:py-3 rounded-full mt-3 md:mt-4 inline-block border border-slate-100 shadow-sm">
               {lastRoundPoints >= 0 ? `+${lastRoundPoints}` : lastRoundPoints} PUAN
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-md mx-auto">
            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-2">GİRDİĞİN</div>
              <div className="text-xl md:text-4xl font-black text-slate-700">{userAnswer || "-"}</div>
            </div>
            <div className="bg-emerald-600 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-emerald-500 text-white shadow-lg">
              <div className="text-[8px] md:text-[10px] font-black text-emerald-100 uppercase mb-2">DOĞRU</div>
              <div className="text-xl md:text-4xl font-black">{correctSum}</div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6 text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
              <History size={16} /> SAYILAR (SIRALI)
            </div>
            <div className="grid grid-cols-5 gap-3 md:flex md:flex-wrap md:justify-center md:gap-4">
              {numbers.map((num, i) => (
                <div 
                  key={i} 
                  className={`h-9 w-9 md:h-12 md:w-12 rounded-lg md:rounded-xl flex items-center justify-center font-black text-[10px] md:text-lg border shadow-sm transition-transform hover:scale-110 ${
                    num > 0 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : 'bg-rose-50 border-rose-100 text-rose-600'
                  }`}
                >
                  {num > 0 ? `+${num}` : num}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={nextRound}
            className="bg-slate-900 text-white px-12 py-5 md:px-16 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-sm md:text-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-4 mx-auto shadow-xl"
          >
            {round < 4 ? 'SONRAKİ TUR' : 'OYUNU BİTİR'} <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center space-y-6 md:space-y-10 animate-in zoom-in duration-300">
          <Trophy className="text-amber-500 w-24 h-24 md:w-40 md:h-40 mx-auto drop-shadow-xl" />
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Oyun Tamamlandı</h2>
            <div className={`text-6xl md:text-8xl font-black leading-none ${totalGamePoints >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalGamePoints > 0 ? `+${totalGamePoints}` : totalGamePoints}
            </div>
          </div>
          <button 
            onClick={onExit}
            className="bg-indigo-600 text-white px-16 py-5 md:px-20 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-xl md:text-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
          >
            PANEL'E DÖN
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePanel;
