import React, { useState, useEffect, useCallback } from 'react';
import { SYLLABUS } from '../constants';
import { 
  Trophy, RefreshCw, Star, Zap, ChevronRight, CheckCircle2, 
  XCircle, Timer, Puzzle, HelpCircle, Layers 
} from 'lucide-react';

type GameMode = 'matching' | 'truefalse' | 'sorting';

interface GameItem {
  id: string;
  text: string;
  matchId: string;
  type: 'term' | 'definition';
}

interface TFQuestion {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export const GamesView: React.FC = () => {
  const [selectedLecture, setSelectedLecture] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  
  // Matching Game State
  const [matchItems, setMatchItems] = useState<GameItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  
  // True/False Game State
  const [tfQuestions, setTfQuestions] = useState<TFQuestion[]>([]);
  const [tfIndex, setTfIndex] = useState(0);
  const [tfFeedback, setTfFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  
  // Sorting Game State (Freudian Specific)
  const [sortItems, setSortItems] = useState<{id: number, text: string, category: string}[]>([]);
  const [sortScore, setSortScore] = useState(0);

  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initMatching = (lectureId: number) => {
    const lecture = SYLLABUS.find(l => l.id === lectureId);
    if (!lecture) return;
    const gameTerms = lecture.glossary.slice(0, 6);
    const terms: GameItem[] = gameTerms.map(t => ({ id: `term-${t.term}`, text: t.term, matchId: t.termEn, type: 'term' }));
    const definitions: GameItem[] = gameTerms.map(t => ({ id: `def-${t.termEn}`, text: t.termEn, matchId: t.termEn, type: 'definition' }));
    const combined = [...terms, ...definitions].sort(() => Math.random() - 0.5);
    setMatchItems(combined);
    setMatchedIds([]);
    setSelectedMatchId(null);
  };

  const initTrueFalse = (lectureId: number) => {
    const lecture = SYLLABUS.find(l => l.id === lectureId);
    if (!lecture) return;
    const questions: TFQuestion[] = lecture.glossary.map(t => ({
      statement: `${t.term} يعني: ${t.definition.substring(0, 40)}...`,
      isTrue: Math.random() > 0.3,
      explanation: t.definition
    }));
    setTfQuestions(questions.sort(() => Math.random() - 0.5));
    setTfIndex(0);
    setTimeLeft(10);
    setTfFeedback(null);
  };

  const initSorting = (lectureId: number) => {
    // Specific items for psychology categories
    const items = [
      { id: 1, text: "طلب الإشباع الفوري للرغبات والغرائز", category: "الهو" },
      { id: 2, text: "العمل وفق مبدأ الواقع وتنسيق الشخصية", category: "الأنا" },
      { id: 3, text: "مستودع الضمير والقيم الأخلاقية العليا", category: "الأنا الأعلى" },
      { id: 4, text: "يوجد في الجانب الفطري والبدائي من النفس", category: "الهو" },
      { id: 5, text: "يحاول الموازنة بين ضغوط الواقع والغرائز", category: "الأنا" },
      { id: 6, text: "يمثل الرقيب الداخلي والمثالية الاجتماعية", category: "الأنا الأعلى" }
    ].sort(() => Math.random() - 0.5);
    setSortItems(items);
    setSortScore(0);
  };

  const startGame = (mode: GameMode, lectureId: number) => {
    setActiveMode(mode);
    setSelectedLecture(lectureId);
    setScore(0);
    setIsWon(false);

    if (mode === 'matching') initMatching(lectureId);
    if (mode === 'truefalse') initTrueFalse(lectureId);
    if (mode === 'sorting') initSorting(lectureId);
  };

  // Timer Effect for True/False
  useEffect(() => {
    let timer: number;
    if (activeMode === 'truefalse' && !isWon && timeLeft > 0 && !tfFeedback) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeMode === 'truefalse') {
      handleTFAnswer(false); // Count as wrong if time ends
    }
    return () => clearInterval(timer);
  }, [activeMode, timeLeft, isWon, tfFeedback]);

  const handleTFAnswer = (ans: boolean) => {
    if (tfFeedback) return;
    const correct = tfQuestions[tfIndex].isTrue === ans;
    setTfFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(prev => prev + 20);

    setTimeout(() => {
      if (tfIndex < tfQuestions.length - 1) {
        setTfIndex(prev => prev + 1);
        setTfFeedback(null);
        setTimeLeft(10);
      } else {
        setIsWon(true);
      }
    }, 1500);
  };

  const handleMatchClick = (item: GameItem) => {
    if (matchedIds.includes(item.id)) return;
    if (selectedMatchId === null) {
      setSelectedMatchId(item.id);
      return;
    }
    const firstItem = matchItems.find(i => i.id === selectedMatchId);
    if (!firstItem || firstItem.id === item.id) {
      setSelectedMatchId(null);
      return;
    }

    if (firstItem.type !== item.type && firstItem.matchId === item.matchId) {
      const newMatched = [...matchedIds, firstItem.id, item.id];
      setMatchedIds(newMatched);
      setSelectedMatchId(null);
      setScore(prev => prev + 15);
      if (newMatched.length === matchItems.length) setIsWon(true);
    } else {
      setSelectedMatchId(item.id);
    }
  };

  const handleSort = (item: any, category: string) => {
    if (item.category === category) {
      setScore(prev => prev + 10);
      setSortItems(prev => prev.filter(i => i.id !== item.id));
      if (sortItems.length === 1) setIsWon(true);
    } else {
      setScore(prev => Math.max(0, prev - 5));
      // Animation or shake effect could be added here
    }
  };

  if (!selectedLecture || !activeMode) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 academic-font">منصة الألعاب التفاعلية</h2>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            اختر المحاضرة ونوع التحدي الذي ترغب في خوضه لتعزيز فهمك العميق للمنهج الدراسي.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SYLLABUS.map((lecture) => (
            <div key={lecture.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-bold">
                  {lecture.id}
                </div>
                <h3 className="font-bold text-slate-800 line-clamp-1">{lecture.title}</h3>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => startGame('matching', lecture.id)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors text-sm font-bold group"
                >
                  <div className="flex items-center gap-2">
                    <Puzzle size={16} /> تحدي التوصيل
                  </div>
                  <ChevronRight size={14} className="group-hover:translate-x-[-4px] transition-transform" />
                </button>
                <button 
                  onClick={() => startGame('truefalse', lecture.id)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors text-sm font-bold group"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle size={16} /> ماراثون صح أم خطأ
                  </div>
                  <ChevronRight size={14} className="group-hover:translate-x-[-4px] transition-transform" />
                </button>
                {lecture.id === 1 && (
                  <button 
                    onClick={() => startGame('sorting', lecture.id)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors text-sm font-bold group"
                  >
                    <div className="flex items-center gap-2">
                      <Layers size={16} /> تصنيف أجهزة النفس
                    </div>
                    <ChevronRight size={14} className="group-hover:translate-x-[-4px] transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSelectedLecture(null); setActiveMode(null); }} className="p-2 hover:bg-slate-100 rounded-full">
            <ChevronRight className="rotate-0 text-slate-500" size={24} />
          </button>
          <div>
            <h3 className="font-bold text-slate-800">
              {activeMode === 'matching' && "تحدي التوصيل الذهني"}
              {activeMode === 'truefalse' && "ماراثون صح أم خطأ"}
              {activeMode === 'sorting' && "تحدي فرز المفاهيم"}
            </h3>
            <p className="text-xs text-slate-400">المحاضرة: {SYLLABUS.find(l => l.id === selectedLecture)?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
            <Star className="text-yellow-500 fill-yellow-500" size={18} />
            <span className="font-bold text-lg text-yellow-700">{score}</span>
          </div>
          {activeMode === 'truefalse' && !isWon && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${timeLeft < 4 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
              <Timer size={18} className={timeLeft < 4 ? 'animate-pulse' : ''} />
              <span className="font-mono font-bold">{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {isWon ? (
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-indigo-100 animate-in zoom-in duration-500">
          <Trophy size={64} className="text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-800 mb-2 academic-font">انتصار أكاديمي باهر!</h2>
          <p className="text-slate-500 mb-8 italic">"التعلم الممتع هو الطريق الأقصر لإتقان علم النفس الدينامي"</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => { setSelectedLecture(null); setActiveMode(null); }} className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">العودة للمنصة</button>
            <button onClick={() => startGame(activeMode, selectedLecture)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">تحدي جديد</button>
          </div>
        </div>
      ) : (
        <div className="min-h-[400px]">
          {/* Matching Game */}
          {activeMode === 'matching' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {matchItems.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedMatchId === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleMatchClick(item)}
                    className={`h-28 p-4 rounded-2xl flex items-center justify-center text-center transition-all border-2 ${
                      isMatched ? 'bg-green-50 border-green-200 text-green-700 opacity-60 scale-95' :
                      isSelected ? 'bg-indigo-600 border-indigo-700 text-white scale-105 shadow-lg' :
                      'bg-white border-slate-100 text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <span className={`font-bold ${item.type === 'definition' ? 'text-xs uppercase font-sans' : 'text-sm'}`}>{item.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* True/False Game */}
          {activeMode === 'truefalse' && (
            <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-3xl shadow-lg relative overflow-hidden">
               <div className="w-full bg-slate-100 h-2 rounded-full mb-10">
                 <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{width: `${((tfIndex + 1) / tfQuestions.length) * 100}%`}}></div>
               </div>
               <div className={`mb-8 p-10 text-center rounded-2xl transition-all duration-300 ${
                 tfFeedback === 'correct' ? 'bg-green-50 text-green-700' : 
                 tfFeedback === 'wrong' ? 'bg-red-50 text-red-700' : 'bg-slate-50'
               }`}>
                 <h4 className="text-2xl font-bold academic-font leading-relaxed">{tfQuestions[tfIndex].statement}</h4>
               </div>
               <div className="flex gap-6 w-full max-w-md">
                 <button onClick={() => handleTFAnswer(true)} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                   <CheckCircle2 size={24} /> صح
                 </button>
                 <button onClick={() => handleTFAnswer(false)} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 flex items-center justify-center gap-2">
                   <XCircle size={24} /> خطأ
                 </button>
               </div>
               {tfFeedback && (
                 <div className="mt-8 text-center animate-in fade-in slide-in-from-top-2">
                   <p className="text-sm font-bold opacity-70 mb-2">الشرح:</p>
                   <p className="text-slate-600 text-xs italic">{tfQuestions[tfIndex].explanation}</p>
                 </div>
               )}
            </div>
          )}

          {/* Sorting Game */}
          {activeMode === 'sorting' && (
            <div className="space-y-10">
              <div className="flex flex-wrap justify-center gap-4">
                {sortItems.length > 0 ? (
                  <div className="p-8 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl w-full text-center animate-pulse">
                    <p className="text-lg font-bold text-indigo-900 mb-2">المفهوم الحالي:</p>
                    <h4 className="text-2xl font-bold text-slate-800">{sortItems[0].text}</h4>
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["الهو", "الأنا", "الأنا الأعلى"].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => sortItems.length > 0 && handleSort(sortItems[0], cat)}
                    className="p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex flex-col items-center gap-3"
                  >
                    <div className="p-3 bg-slate-50 group-hover:bg-indigo-100 rounded-2xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Layers size={32} />
                    </div>
                    <span className="text-xl font-bold text-slate-800">{cat}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">انقر للتصنيف</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};