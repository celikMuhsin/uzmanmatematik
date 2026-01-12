
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroSlider from './components/HeroSlider';
import Footer from './components/Footer';
import QuizEngine from './components/QuizEngine';
import ScoreBoard from './components/ScoreBoard';
import AdminPanel from './components/AdminPanel';
import GamePanel from './components/GamePanel';
import ProfilePanel from './components/ProfilePanel';
import LatexRenderer from './components/LatexRenderer';
import { Page, Topic, ScoreRecord, Lesson, Question, UserAccount } from './types';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, ArrowRight, Crown, BookOpen, Gamepad2 } from 'lucide-react';
import { LESSONS as INITIAL_LESSONS, MOCK_QUESTIONS as INITIAL_QUESTIONS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  // Auth States
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');

  // Content States
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);

  useEffect(() => {
    // 1. Kullanıcıyı yükle
    const savedSession = localStorage.getItem('uzman_session');
    const usersJson = localStorage.getItem('uzman_users');
    const users: UserAccount[] = usersJson ? JSON.parse(usersJson) : [];

    if (savedSession) {
      const found = users.find(u => u.email === savedSession);
      if (found) setCurrentUser(found);
    }

    // 2. Global İçerikleri yükle (Admin'in değiştirdiği dersler ve sorular)
    const savedLessons = localStorage.getItem('uzman_custom_lessons');
    if (savedLessons) setLessons(JSON.parse(savedLessons));

    const savedQuestions = localStorage.getItem('uzman_custom_questions');
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    else {
      // Eğer hiç soru yoksa başlangıç sorularına topicId atayarak yükle
      const initialWithIds = INITIAL_QUESTIONS.map(q => ({...q, topicId: 't1'}));
      setQuestions(initialWithIds);
    }
  }, []);

  // Kullanıcı verisini her değişimde güncelle ve kaydet
  const syncUser = (updated: UserAccount) => {
    const usersJson = localStorage.getItem('uzman_users');
    let users: UserAccount[] = usersJson ? JSON.parse(usersJson) : [];
    users = users.map(u => u.email === updated.email ? updated : u);
    localStorage.setItem('uzman_users', JSON.stringify(users));
    setCurrentUser(updated);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const usersJson = localStorage.getItem('uzman_users');
    const users: UserAccount[] = usersJson ? JSON.parse(usersJson) : [];

    if (authMode === 'register') {
      if (users.find(u => u.email === authForm.email)) {
        setAuthError('Bu mail adresi zaten kayıtlı.');
        return;
      }
      const newUser: UserAccount = {
        email: authForm.email,
        password: authForm.password,
        name: authForm.name,
        gamePoints: 0,
        scores: [],
        isAdmin: authForm.email === "admin@uzmanmatematik.com" || authForm.email === "muhsin1982@gmail.com",
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('uzman_users', JSON.stringify(users));
      localStorage.setItem('uzman_session', newUser.email);
      setCurrentUser(newUser);
    } else {
      const found = users.find(u => u.email === authForm.email && u.password === authForm.password);
      if (found) {
        localStorage.setItem('uzman_session', found.email);
        setCurrentUser(found);
      } else {
        setAuthError('Hatalı giriş bilgileri.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('uzman_session');
    setCurrentUser(null);
    setCurrentPage(Page.Home);
  };

  const navigateTo = (page: Page, data?: any) => {
    setCurrentPage(page);
    if (data) setSelectedTopic(data);
    window.scrollTo(0, 0);
  };

  const addScore = (record: ScoreRecord) => {
    if (!currentUser) return;
    const updated = { ...currentUser, scores: [record, ...currentUser.scores].slice(0, 50) };
    syncUser(updated);
  };

  const updatePoints = (pts: number) => {
    if (!currentUser) return;
    syncUser({ ...currentUser, gamePoints: currentUser.gamePoints + pts });
  };

  const updateLessons = (newLessons: Lesson[]) => {
    setLessons(newLessons);
    localStorage.setItem('uzman_custom_lessons', JSON.stringify(newLessons));
  };

  const updateQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    localStorage.setItem('uzman_custom_questions', JSON.stringify(newQuestions));
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (currentPage) {
      case Page.Home:
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <HeroSlider />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Merhaba, {currentUser.name}!</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Bugün matematik dünyasında yeni keşifler yapmaya hazır mısın? İlgilendiğin dersi yukarıdan seçebilir veya aşağıdan genel performansına göz atabilirsin.
                  </p>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={() => navigateTo(Page.Games)} className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 group cursor-pointer overflow-hidden relative">
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-2">Zihin Egzersizi</h3>
                      <p className="text-indigo-100 text-sm mb-6">Oyunlarla işlem yeteneğini hızlandır ve puan kazan.</p>
                      <span className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-sm group-hover:bg-indigo-50 transition-colors">Oyna</span>
                    </div>
                    <Gamepad2 className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform" />
                  </div>
                  <div onClick={() => navigateTo(Page.Profile)} className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl group cursor-pointer overflow-hidden relative">
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-2">Başarı Durumu</h3>
                      <p className="text-slate-400 text-sm mb-6">Rozetlerini gör ve puanlarını incele.</p>
                      <span className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm group-hover:bg-indigo-500 transition-colors">Profili Gör</span>
                    </div>
                    <Crown className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
              <ScoreBoard scores={currentUser.scores} />
            </div>
          </div>
        );
      case Page.TopicContent:
        return (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <BookOpen size={28} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">{selectedTopic?.name}</h1>
            </div>
            <div className="prose prose-indigo max-w-none mb-12">
               <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <LatexRenderer text={selectedTopic?.content || ""} className="text-slate-700 text-lg leading-relaxed" />
               </div>
            </div>
            <div className="flex justify-center">
               <button onClick={() => navigateTo(Page.Quiz, selectedTopic)} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1">
                 Konu Testine Başla
               </button>
            </div>
          </div>
        );
      case Page.Quiz:
        const topicQuestions = questions.filter(q => q.topicId === selectedTopic?.id);
        return <QuizEngine 
          topicName={selectedTopic?.name || "Karma Test"} 
          userName={currentUser.name} 
          questions={topicQuestions.length > 0 ? topicQuestions : []} 
          onComplete={addScore} 
        />;
      case Page.Games:
        return <GamePanel gamePoints={currentUser.gamePoints} onUpdatePoints={updatePoints} isAdmin={currentUser.isAdmin} />;
      case Page.Profile:
        return <ProfilePanel userName={currentUser.name} gamePoints={currentUser.gamePoints} scores={currentUser.scores} onLogout={handleLogout} isAdmin={currentUser.isAdmin} />;
      case 'admin' as any:
        return <AdminPanel lessons={lessons} questions={questions} onUpdateLessons={updateLessons} onUpdateQuestions={updateQuestions} />;
      default:
        return <div className="text-center py-20">Sayfa bulunamadı.</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd]">
      {!currentUser ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 md:p-16 max-w-lg w-full shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 -z-0"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
                <UserIcon className="text-white w-8 h-8 -rotate-3" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">{authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
              <p className="text-slate-500 text-center mb-10 font-medium">UzmanMatematik dünyasına adım atın.</p>
              
              {authError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100">{authError}</div>}

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                   <div className="relative">
                     <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input type="text" placeholder="Ad Soyad" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold" required />
                   </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" placeholder="E-posta" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" placeholder="Şifre" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold" required />
                </div>
                <button type="submit" className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 group">
                  {authMode === 'login' ? 'Giriş Yap' : 'Kaydı Tamamla'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-10 pt-10 border-t border-slate-100 text-center">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-indigo-600 font-black text-sm hover:underline flex items-center justify-center gap-2 mx-auto">
                   {authMode === 'login' ? <><UserPlus size={16}/> Yeni hesap oluştur</> : <><LogIn size={16}/> Zaten bir hesabım var</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Header onNavigate={navigateTo} userName={currentUser.name} lessons={lessons} onLogoClick={() => {}} />
          <div className="flex flex-1">
            <Sidebar onLogout={handleLogout} isAdmin={currentUser.isAdmin} onNavigate={navigateTo} />
            <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
              {renderContent()}
            </main>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;
