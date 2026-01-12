
import { useState, useEffect } from 'react';
import { Clock, Trophy, CheckCircle2 } from 'lucide-react';
import LatexRenderer from './LatexRenderer';
import { Question, ScoreRecord } from '../types';

interface QuizEngineProps {
  topicName: string;
  userName: string;
  questions: Question[];
  onComplete: (record: ScoreRecord) => void;
}

const QuizEngine: React.FC<QuizEngineProps> = ({ topicName, userName, questions, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, startTime]);

  const currentQuestion = questions[currentIdx] || { text: "Soru Bulunamadı", options: [], correctAnswer: 0 };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === undefined) empty++;
      else if (ans === q.correctAnswer) correct++;
      else wrong++;
    });

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, wrong, empty, score };
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const results = calculateResults();
    // Added topicName property and ensured name is correctly handled
    const record: ScoreRecord = {
      name: userName,
      topicName: topicName,
      score: results.score,
      date: new Date().toLocaleDateString('tr-TR'),
      timeTaken: elapsed
    };
    onComplete(record);
    setShowResultModal(true);
  };

  const results = calculateResults();

  const getLayoutConfig = (options: string[]) => {
    if (!options) return "column";
    const maxLen = Math.max(...options.map(o => o.replace(/\$|\$\$/g, '').length));
    const totalLen = options.reduce((acc, o) => acc + o.length, 0);

    if (maxLen < 15 && totalLen < 60) return "row"; 
    if (maxLen < 30 && totalLen < 150) return "grid-3-2"; 
    return "column"; 
  };

  const layout = getLayoutConfig(currentQuestion.options);

  const feedback = (score: number) => {
    if (score >= 90) return { title: "Harika!", text: "Konuyu mükemmel bir şekilde kavramışsın!", color: "text-green-600" };
    if (score >= 50) return { title: "Fena Değil!", text: "Biraz daha pratikle daha iyi olabilirsin.", color: "text-amber-600" };
    return { title: "Daha Fazla Çalışmalısın!", text: "Konu anlatımına tekrar göz atman iyi olacaktır.", color: "text-red-600" };
  };

  if (questions.length === 0) return <div className="text-center py-20 bg-white rounded-3xl">Henüz bu bölüm için soru eklenmemiş.</div>;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-8 md:p-12 max-w-5xl mx-auto min-h-[600px] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 -z-10"></div>

      <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 font-black">
            {currentIdx + 1}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{topicName}</h2>
            <div className="flex items-center gap-2">
               <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-500" style={{width: `${((currentIdx + 1) / questions.length) * 100}%`}}></div>
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase">{currentIdx + 1} / {questions.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl font-mono font-black text-slate-700">
            <Clock size={18} className="text-indigo-600" />
            {formatTime(elapsed)}
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center px-4">
        <div className="w-full text-center text-2xl md:text-3xl font-bold text-slate-800 mb-16 leading-relaxed bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100/50 shadow-inner">
          <LatexRenderer text={currentQuestion.text} />
        </div>

        <div className={`w-full flex flex-wrap justify-center gap-5 ${layout === 'column' ? 'flex-col items-center' : ''}`}>
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = userAnswers[currentIdx] === idx;
            const isCorrect = currentQuestion.correctAnswer === idx;
            
            let btnClass = "bg-white border-2 border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30";
            
            if (isSubmitted) {
              if (isCorrect) btnClass = "bg-green-100 text-green-800 border-green-400 shadow-lg shadow-green-100 scale-[1.02] z-10";
              else if (isSelected && !isCorrect) btnClass = "bg-red-100 text-red-800 border-red-400";
              else btnClass = "bg-slate-50 text-slate-400 border-slate-100 opacity-60";
            } else if (isSelected) {
              btnClass = "bg-indigo-600 text-white border-indigo-600 shadow-2xl shadow-indigo-200 -translate-y-1";
            }

            const itemWidth = layout === 'row' ? 'flex-1 min-w-[150px]' : layout === 'grid-3-2' ? (idx < 3 ? 'w-[30%]' : 'w-[45%]') : 'w-full max-w-3xl';

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isSubmitted}
                className={`p-6 rounded-3xl transition-all flex items-center justify-center gap-4 text-center group relative ${btnClass} ${itemWidth}`}
              >
                <span className={`text-xl font-black min-w-[32px] ${isSelected && !isSubmitted ? 'text-white' : 'text-indigo-600'}`}>
                  {["A", "B", "C", "D", "E"][idx]})
                </span>
                <LatexRenderer text={opt} className="text-lg font-bold" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-12 mt-12 border-t border-slate-100">
        <button
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-black transition-all"
        >
          Önceki
        </button>

        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            className="px-12 py-5 rounded-2xl bg-indigo-600 text-white font-black text-xl hover:bg-indigo-700 hover:shadow-2xl shadow-indigo-200 transition-all transform active:scale-95"
          >
            Bitir
          </button>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="px-12 py-5 rounded-2xl bg-amber-500 text-white font-black text-xl"
          >
            Yeniden Başla
          </button>
        )}

        <button
          onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-black transition-all"
        >
          Sonraki
        </button>
      </div>

      {showResultModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <Trophy className="text-indigo-600 w-16 h-16 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-slate-900 mb-2">{results.score} Puan!</h3>
            <p className={`text-lg font-bold ${feedback(results.score).color} mb-6`}>{feedback(results.score).title}</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
               <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                  <div className="text-2xl font-black text-green-700">{results.correct}</div>
                  <div className="text-[10px] font-bold text-green-600 uppercase">Doğru</div>
               </div>
               <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <div className="text-2xl font-black text-red-700">{results.wrong}</div>
                  <div className="text-[10px] font-bold text-red-600 uppercase">Yanlış</div>
               </div>
            </div>
            <button
              onClick={() => setShowResultModal(false)}
              className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white text-lg font-black"
            >
              Soruları İncele
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizEngine;