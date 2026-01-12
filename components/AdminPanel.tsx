
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, BookOpen, HelpCircle, Layers, CheckCircle2, Users, Trophy, Mail } from 'lucide-react';
import { Lesson, Question, Topic, UserAccount } from '../types';
import LatexRenderer from './LatexRenderer';

interface AdminPanelProps {
  lessons: Lesson[];
  questions: Question[];
  onUpdateLessons: (lessons: Lesson[]) => void;
  onUpdateQuestions: (questions: Question[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ lessons, questions, onUpdateLessons, onUpdateQuestions }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'questions' | 'users'>('content');
  const [editingTopic, setEditingTopic] = useState<{lessonId: string, topic: Topic} | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);

  // LocalStorage'dan kullanıcıları yükle
  useEffect(() => {
    const usersJson = localStorage.getItem('uzman_users');
    if (usersJson) {
      setRegisteredUsers(JSON.parse(usersJson));
    }
  }, [activeTab]);

  // Lesson & Topic Actions
  const addLesson = () => {
    const newLesson: Lesson = { id: 'L' + Date.now(), name: 'Yeni Ders', topics: [] };
    onUpdateLessons([...lessons, newLesson]);
  };

  const addTopic = (lessonId: string) => {
    const updated = lessons.map(l => {
      if (l.id === lessonId) {
        return { ...l, topics: [...l.topics, { id: 'T' + Date.now(), name: 'Yeni Konu', content: 'Konu özeti buraya...' }] };
      }
      return l;
    });
    onUpdateLessons(updated);
  };

  const saveTopic = () => {
    if (!editingTopic) return;
    const updated = lessons.map(l => {
      if (l.id === editingTopic.lessonId) {
        return { ...l, topics: l.topics.map(t => t.id === editingTopic.topic.id ? editingTopic.topic : t) };
      }
      return l;
    });
    onUpdateLessons(updated);
    setEditingTopic(null);
  };

  // Question Actions
  const addQuestion = () => {
    if (!selectedTopicId) return;
    const newQ: Question = {
      id: Date.now(),
      topicId: selectedTopicId,
      text: "Yeni LaTeX Soru Metni",
      options: ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D", "Seçenek E"],
      correctAnswer: 0
    };
    onUpdateQuestions([...questions, newQ]);
  };

  const deleteQuestion = (id: number) => {
    onUpdateQuestions(questions.filter(q => q.id !== id));
  };

  const updateQ = (id: number, fields: Partial<Question>) => {
    onUpdateQuestions(questions.map(q => q.id === id ? { ...q, ...fields } : q));
  };

  const deleteUser = (email: string) => {
    if (window.confirm(`${email} kullanıcısını silmek istediğinize emin misiniz?`)) {
      const updatedUsers = registeredUsers.filter(u => u.email !== email);
      localStorage.setItem('uzman_users', JSON.stringify(updatedUsers));
      setRegisteredUsers(updatedUsers);
    }
  };

  const filteredQuestions = questions.filter(q => q.topicId === selectedTopicId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight text-center lg:text-left">Yönetim Merkezi</h2>
            <p className="text-slate-500 font-medium text-center lg:text-left">İçerikleri ve kayıtlı öğrencileri buradan yönetin.</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto max-w-full">
            <button onClick={() => setActiveTab('content')} className={`px-6 py-3 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap ${activeTab === 'content' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <div className="flex items-center gap-2"><Layers size={16}/> Müfredat</div>
            </button>
            <button onClick={() => setActiveTab('questions')} className={`px-6 py-3 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap ${activeTab === 'questions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <div className="flex items-center gap-2"><HelpCircle size={16}/> Sorular</div>
            </button>
            <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <div className="flex items-center gap-2"><Users size={16}/> Öğrenciler</div>
            </button>
          </div>
        </div>

        {activeTab === 'content' && (
          <div className="space-y-8">
            {!editingTopic ? (
               <>
                 <button onClick={addLesson} className="w-full py-6 border-2 border-dashed border-indigo-200 rounded-3xl text-indigo-600 font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-3">
                   <Plus size={24} /> Yeni Ders Grubu Ekle
                 </button>
                 <div className="grid grid-cols-1 gap-6">
                   {lessons.map(lesson => (
                     <div key={lesson.id} className="border border-slate-100 rounded-[2.5rem] p-8 bg-slate-50/30">
                       <div className="flex items-center justify-between mb-8">
                         <input type="text" value={lesson.name} onChange={e => onUpdateLessons(lessons.map(l => l.id === lesson.id ? {...l, name: e.target.value} : l))} className="text-2xl font-black text-slate-800 bg-transparent border-none focus:ring-0 w-full" />
                         <div className="flex gap-2">
                           <button onClick={() => addTopic(lesson.id)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"><Plus size={20}/></button>
                           <button onClick={() => onUpdateLessons(lessons.filter(l => l.id !== lesson.id))} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"><Trash2 size={20}/></button>
                         </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {lesson.topics.map(topic => (
                           <div key={topic.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
                             <span className="font-bold text-slate-700">{topic.name}</span>
                             <div className="flex gap-1">
                               <button onClick={() => setEditingTopic({lessonId: lesson.id, topic})} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 size={16}/></button>
                               <button onClick={() => onUpdateLessons(lessons.map(l => l.id === lesson.id ? {...l, topics: l.topics.filter(t => t.id !== topic.id)} : l))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </>
            ) : (
              <div className="bg-slate-50 p-6 md:p-10 rounded-[3rem] border border-slate-100 animate-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => setEditingTopic(null)} className="p-3 bg-white text-slate-400 rounded-2xl shadow-sm"><X size={24}/></button>
                    <h3 className="text-2xl font-black text-slate-800">İçerik Editörü</h3>
                  </div>
                  <button onClick={saveTopic} className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"><Save size={20}/> Değişiklikleri Kaydet</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Konu Başlığı</label>
                      <input type="text" value={editingTopic.topic.name} onChange={e => setEditingTopic({...editingTopic, topic: {...editingTopic.topic, name: e.target.value}})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Konu Özeti (LaTeX Desteği Mevcut)</label>
                      <textarea rows={12} value={editingTopic.topic.content} onChange={e => setEditingTopic({...editingTopic, topic: {...editingTopic.topic, content: e.target.value}})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none font-medium leading-relaxed font-mono text-sm" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Canlı Önizleme</label>
                    <div className="flex-grow bg-white border border-slate-200 rounded-[2.5rem] p-8 overflow-y-auto max-h-[500px] shadow-inner">
                      <h4 className="text-2xl font-black text-slate-800 mb-6">{editingTopic.topic.name}</h4>
                      <LatexRenderer text={editingTopic.topic.content} className="prose prose-indigo max-w-none text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
              <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Soruları Görüntülenecek Konu</label>
              <select onChange={e => setSelectedTopicId(e.target.value)} className="w-full px-8 py-4 rounded-2xl bg-white border-2 border-indigo-100 focus:border-indigo-600 outline-none font-bold text-slate-700">
                <option value="">-- Konu Seçiniz --</option>
                {lessons.flatMap(l => l.topics).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {selectedTopicId && (
              <div className="space-y-6">
                <button onClick={addQuestion} className="w-full py-5 bg-white border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                  <Plus size={20} /> Yeni Soru Oluştur
                </button>
                <div className="space-y-6">
                  {filteredQuestions.map((q) => (
                    <div key={q.id} className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div className="flex-grow w-full space-y-4">
                          <textarea value={q.text} onChange={e => updateQ(q.id, {text: e.target.value})} rows={3} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none font-medium" />
                          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-300 uppercase block mb-3">Soru Önizlemesi</span>
                            <LatexRenderer text={q.text} />
                          </div>
                        </div>
                        <button onClick={() => deleteQuestion(q.id)} className="p-4 text-red-500 hover:bg-red-100 rounded-2xl transition-all self-end md:self-start"><Trash2 size={24}/></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="space-y-2">
                            <input type="text" value={opt} onChange={e => {
                              const newOpts = [...q.options];
                              newOpts[oIdx] = e.target.value;
                              updateQ(q.id, {options: newOpts});
                            }} className={`w-full p-3 rounded-xl border-2 text-center text-xs font-bold ${q.correctAnswer === oIdx ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`} />
                            <button onClick={() => updateQ(q.id, {correctAnswer: oIdx})} className={`w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 ${q.correctAnswer === oIdx ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                              {q.correctAnswer === oIdx ? 'DOĞRU CEVAP' : 'İŞARETLE'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-500">
             <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                     <Users className="text-indigo-600" /> Kayıtlı Öğrenciler ({registeredUsers.length})
                   </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white border-b border-slate-100">
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Öğrenci Bilgisi</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Oyun Puanı</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Test Sayısı</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registeredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-bold italic">Kayıtlı kullanıcı bulunamadı.</td>
                        </tr>
                      ) : (
                        registeredUsers.map((user) => (
                          <tr key={user.email} className="hover:bg-white transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${user.isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-black text-slate-800 flex items-center gap-2">
                                    {user.name}
                                    {user.isAdmin && <span className="bg-amber-100 text-amber-700 text-[8px] px-2 py-0.5 rounded-full">ADMİN</span>}
                                  </div>
                                  <div className="text-xs text-slate-400 flex items-center gap-1 font-medium"><Mail size={12}/> {user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="flex items-center justify-center gap-2 font-black text-slate-700 text-lg">
                                <Trophy size={16} className="text-amber-500" />
                                {user.gamePoints}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="bg-slate-100 px-4 py-1.5 rounded-full text-xs font-black text-slate-600">
                                {user.scores.length} Test
                              </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <button 
                                onClick={() => deleteUser(user.email)}
                                disabled={user.email === "admin@uzmanmatematik.com"}
                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
                              >
                                <Trash2 size={20} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
             <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-amber-600"><HelpCircle size={20} /></div>
                <div>
                   <h4 className="font-black text-amber-800 text-sm">Bilgi Depolama Hakkında</h4>
                   <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">
                     Bu liste tarayıcınızın <b>LocalStorage</b> alanında saklanmaktadır. Veritabanı kullanılmadığı için kullanıcılar sadece bu tarayıcı üzerinden giriş yaptıklarında listelenir. Başka bir cihazdan veya gizli sekmeden girildiğinde bu veriler görünmeyecektir.
                   </p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
