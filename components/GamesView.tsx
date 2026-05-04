import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SYLLABUS } from '../constants';
import { 
  Trophy, RefreshCw, Star, Zap, ChevronRight, CheckCircle2, 
  XCircle, Timer, Puzzle, HelpCircle, Layers, Grid,
  Clock, GitBranch, ArrowUp, ArrowDown
} from 'lucide-react';

type GameMode = 'matching' | 'truefalse' | 'sorting' | 'crossword' | 'timeline' | 'mapping';

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
  const [sortFeedback, setSortFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Timeline Sequencing State
  const [timelineItems, setTimelineItems] = useState<{id: string, text: string, order: number}[]>([]);
  
  // Concept Mapping State
  const [mappingItems, setMappingItems] = useState<{id: string, text: string, partnerId: string, side: 'left' | 'right'}[]>([]);
  const [mappingActiveId, setMappingActiveId] = useState<string | null>(null);
  const [mappingMatched, setMappingMatched] = useState<string[]>([]);

  // Crossword Game State
  const [crosswordWords, setCrosswordWords] = useState<{
    id: string, 
    term: string, 
    definition: string, 
    guessed: boolean, 
    userInput: string,
    hintsUsed?: number,
    isError?: boolean
  }[]>([]);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);

  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Save Crossword Progress
  useEffect(() => {
    if (activeMode === 'crossword' && selectedLecture && !isWon && crosswordWords.length > 0) {
      localStorage.setItem(`crossword_progress_${selectedLecture}`, JSON.stringify({
        words: crosswordWords,
        score: score
      }));
    }
  }, [crosswordWords, score, activeMode, selectedLecture, isWon]);

  useEffect(() => {
    if (activeMode === 'crossword' && isWon && selectedLecture) {
      localStorage.removeItem(`crossword_progress_${selectedLecture}`);
    }
  }, [isWon, activeMode, selectedLecture]);

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
    let items: { id: number, text: string, category: string }[] = [];
    
    if (lectureId === 1 || lectureId === 6) {
      items = [
        { id: 1, text: "طلب الإشباع الفوري للرغبات والغرائز", category: "الهو" },
        { id: 2, text: "العمل وفق مبدأ الواقع وتنسيق الشخصية", category: "الأنا" },
        { id: 3, text: "مستودع الضمير والقيم الأخلاقية العليا", category: "الأنا الأعلى" },
        { id: 4, text: "يوجد في الجانب الفطري والبدائي من النفس", category: "الهو" },
        { id: 5, text: "يحاول الموازنة بين ضغوط الواقع والغرائز", category: "الأنا" },
        { id: 6, text: "يمثل الرقيب الداخلي والمثالية الاجتماعية", category: "الأنا الأعلى" }
      ];
    } else if (lectureId === 2) {
      items = [
        { id: 1, text: "مؤسس مدرسة التحليل النفسي الكلاسيكية", category: "فرويد" },
        { id: 2, text: "صاحب مفهوم اللاوعي الجمعي والأنماط البدائية", category: "يونج" },
        { id: 3, text: "ركز على مشاعر النقص والكفاح من أجل التفوق", category: "أدلر" },
        { id: 4, text: "اهتم بالعلاج عبر التداعي الحر والأحلام", category: "فرويد" },
        { id: 5, text: "مؤسس علم النفس التحليلي (Analytical Psychology)", category: "يونج" },
        { id: 6, text: "مؤسس علم النفس الفردي (Individual Psychology)", category: "أدلر" }
      ];
    } else if (lectureId === 5) {
      items = [
        { id: 1, text: "يشمل ما ندركه وننتبه إليه في اللحظة الحالية", category: "الشعور" },
        { id: 2, text: "منطقة الذكريات التي يمكن استدعاؤها بسهولة", category: "ما قبل الشعور" },
        { id: 3, text: "مستودع الرغبات المكبوتة والقوى المحركة الخفية", category: "اللاشعور" },
        { id: 4, text: "يمثل قمة جبل الجليد النفسي الظاهرة", category: "الشعور" },
        { id: 5, text: "يسمى أحياناً بالذاكرة المتاحة", category: "ما قبل الشعور" },
        { id: 6, text: "المنافذ إليه هي الأحلام وفلتات اللسان", category: "اللاشعور" }
      ];
    } else if (lectureId === 7) {
      items = [
        { id: 1, text: "رد فعل طبيعي تجاه خطر خارجي موضوعي", category: "قلق واقعي" },
        { id: 2, text: "خوف الأنا من الانجرار خلف نزوات الهو", category: "قلق عصابي" },
        { id: 3, text: "خوف الأنا من عقاب الضمير (الأنا الأعلى)", category: "قلق خلقي" },
        { id: 4, text: "القلق من الامتحان أو حيوان مفترس", category: "قلق واقعي" },
        { id: 5, text: "الشعور بالخطر دون معرفة المصدر الحقيقي", category: "قلق عصابي" },
        { id: 6, text: "الشعور الشديد بالذنب وتبكيت الضمير", category: "قلق خلقي" }
      ];
    } else if (lectureId >= 8) {
      items = [
        { id: 1, text: "تصنيفات نوعية مثل (ذكر/أنثى) أو (ناجح/راسب)", category: "اسمي" },
        { id: 2, text: "ترتيب الطلاب حسب تفوقهم (الأول، الثاني...)", category: "رتبي" },
        { id: 3, text: "درجات اختبارات الذكاء أو التحصيل الدراسي", category: "فئوي" },
        { id: 4, text: "قياس الوزن والطول وزمن الرجع", category: "نسبي" }
      ];
    } else {
      items = [
        { id: 1, text: "مفهوم نظري مجرد", category: "نظري" },
        { id: 2, text: "تطبيق عملي ميداني", category: "تطبيقي" },
        { id: 3, text: "أساس فلسفي للمنهج", category: "نظري" },
        { id: 4, text: "أداة قياس واختبار", category: "تطبيقي" }
      ];
    }

    setSortItems(items.sort(() => Math.random() - 0.5));
    setSortScore(0);
  };

  const initCrossword = (lectureId: number) => {
    const lecture = SYLLABUS.find(l => l.id === lectureId);
    if (!lecture) return;

    const savedProgress = localStorage.getItem(`crossword_progress_${lectureId}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        if (parsed && parsed.words && parsed.words.length > 0) {
          setCrosswordWords(parsed.words);
          setScore(parsed.score || 0);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }

    const terms = [...lecture.glossary].sort(() => Math.random() - 0.5).slice(0, 5);
    setCrosswordWords(terms.map(t => ({
      id: t.term,
      term: t.term,
      definition: t.definition,
      guessed: false,
      userInput: '',
      hintsUsed: 0,
      isError: false
    })));
    setScore(0);
    setActiveWordId(null);
    setActiveCellIndex(null);
  };

  const initTimeline = (lectureId: number) => {
    let items: {id: string, text: string, order: number}[] = [];
    if (lectureId === 1 || lectureId === 2) {
      items = [
        { id: '1', text: 'ظهور نظرية التحليل النفسي الكلاسيكي لسيجموند فرويد', order: 1 },
        { id: '2', text: 'تطوير النموذج البنيوي (الهو، الأنا، الأنا الأعلى)', order: 2 },
        { id: '3', text: 'انفصال يونج وأدلر وتأسيس المدارس الجديدة', order: 3 },
        { id: '4', text: 'انتشار الاختبارات الإسقاطية كوسيلة لقياس اللاشعور', order: 4 }
      ];
    } else if (lectureId === 5) {
      items = [
        { id: '1', text: 'حدوث خبرة طفولية مؤلمة أو رغبة غير مقبولة', order: 1 },
        { id: '2', text: 'تفعيل آلية الكبت لدفع الذكرى للاشعور', order: 2 },
        { id: '3', text: 'تراكم الطاقة النفسية المكبوتة وبدء الصراع', order: 3 },
        { id: '4', text: 'ظهور المحتوى في شكل رمز أو فلتة لسان أو حلم', order: 4 }
      ];
    } else if (lectureId >= 8) {
      items = [
        { id: '1', text: 'مرحلة القياس التقليدي (الدرجة الخام)', order: 1 },
        { id: '2', text: 'ظهور معايير الصدق والثبات الكلاسيكية', order: 2 },
        { id: '3', text: 'استخدام المنحنى الاعتدالي والدرجات المعيارية', order: 3 },
        { id: '4', text: 'تطور نظرية استجابة الفقرة (IRT) الحديثة', order: 4 }
      ];
    } else {
      items = [
        { id: '1', text: 'المرحلة التمهيدية: جمع الملاحظات الإكلينيكية', order: 1 },
        { id: '2', text: 'المرحلة النظرية: صياغة الفرضيات العلمية', order: 2 },
        { id: '3', text: 'المرحلة التطبيقية: بناء الاختبارات والمقاييس', order: 3 },
        { id: '4', text: 'المرحلة النقدية: تطوير النماذج الحديثة', order: 4 }
      ];
    }
    setTimelineItems(items.sort(() => Math.random() - 0.5));
  };

  const initMapping = (lectureId: number) => {
    const lecture = SYLLABUS.find(l => l.id === lectureId);
    if (!lecture) return;
    
    // Choose 4 concepts from glossary
    const concepts = [...lecture.glossary].sort(() => Math.random() - 0.5).slice(0, 4);
    const nodes: any[] = [];
    concepts.forEach(c => {
      nodes.push({ id: `concept-${c.term}`, text: c.term, partnerId: `def-${c.termEn}`, side: 'left' });
      nodes.push({ id: `def-${c.termEn}`, text: c.definition.substring(0, 50) + "...", partnerId: `concept-${c.term}`, side: 'right' });
    });
    
    setMappingItems(nodes.sort(() => Math.random() - 0.5));
    setMappingMatched([]);
    setMappingActiveId(null);
  };

  const startGame = (mode: GameMode, lectureId: number) => {
    setActiveMode(mode);
    setSelectedLecture(lectureId);
    setScore(0);
    setIsWon(false);

    if (mode === 'matching') initMatching(lectureId);
    if (mode === 'truefalse') initTrueFalse(lectureId);
    if (mode === 'sorting') initSorting(lectureId);
    if (mode === 'crossword') {
      initCrossword(lectureId);
      setActiveWordId(null);
      setActiveCellIndex(null);
    }
    if (mode === 'timeline') initTimeline(lectureId);
    if (mode === 'mapping') initMapping(lectureId);
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
    if (sortFeedback) return; // Prevent multiple clicks during animation

    if (item.category === category) {
      setSortFeedback('correct');
      setScore(prev => prev + 10);
      setTimeout(() => {
        setSortItems(prev => prev.filter(i => i.id !== item.id));
        setSortFeedback(null);
        if (sortItems.length === 1) setIsWon(true);
      }, 800);
    } else {
      setSortFeedback('wrong');
      setScore(prev => Math.max(0, prev - 5));
      setTimeout(() => {
        setSortFeedback(null);
      }, 800);
    }
  };

  const normalizeArabic = (text: string) => {
    return text.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim();
  };

  const checkCrosswordAnswer = (id: string) => {
    setCrosswordWords(prev => {
      let addedScore = 0;
      const newWords = prev.map(w => {
        if (w.id === id) {
          const isCorrect = normalizeArabic(w.userInput) === normalizeArabic(w.term);
          if (isCorrect && !w.guessed) {
            addedScore = 20;
            return { ...w, guessed: true, isError: false };
          } else if (!isCorrect) {
            addedScore = -5;
            return { ...w, isError: true };
          }
        }
        return w;
      });

      if (newWords.every(w => w.guessed)) {
        setTimeout(() => setIsWon(true), 500);
      }

      setScore(s => Math.max(0, s + addedScore));
      return newWords;
    });
  };

  const handleCrosswordHint = (id: string) => {
    setCrosswordWords(prev => {
      let deduct = 0;
      const newWords = prev.map(w => {
        if (w.id === id && !w.guessed) {
          const targetTerm = w.term;
          let currentHints = w.hintsUsed || 0;
          
          if (currentHints < targetTerm.length) {
            deduct = 2;
            let nextLength = currentHints + 1;
            // Skip spaces
            while (nextLength <= targetTerm.length && targetTerm[nextLength - 1] === ' ') {
              nextLength++;
            }
            
            let newUserInput = w.userInput.split('');
            while(newUserInput.length < targetTerm.length) newUserInput.push(' ');
            
            for(let i=0; i<nextLength; i++) {
               newUserInput[i] = targetTerm[i];
            }

            return { 
              ...w, 
              hintsUsed: nextLength, 
              userInput: newUserInput.join(''),
              isError: false
            };
          }
        }
        return w;
      });
      if (deduct > 0) {
        setScore(s => Math.max(0, s - deduct));
      }
      return newWords;
    });
  };

  const showAllCrosswordAnswers = () => {
    if (!window.confirm('كشف جميع الإجابات سيخصم 100 نقطة. هل أنت متأكد؟')) return;
    
    setCrosswordWords(prev => prev.map(w => ({
      ...w,
      userInput: w.term,
      guessed: true,
      isError: false
    })));
    setScore(s => Math.max(0, s - 100));
    setTimeout(() => setIsWon(true), 500);
  };

  const handleMappingClick = (id: string, partnerId: string) => {
    if (mappingMatched.includes(id)) return;
    
    if (mappingActiveId === null) {
      setMappingActiveId(id);
    } else {
      if (mappingActiveId === partnerId) {
        setMappingMatched(prev => [...prev, id, partnerId]);
        setMappingActiveId(null);
        setScore(prev => prev + 25);
        if (mappingMatched.length + 2 === mappingItems.length) {
          setIsWon(true);
        }
      } else {
        setMappingActiveId(id);
      }
    }
  };

  const moveTimelineItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...timelineItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setTimelineItems(newItems);
  };

  const checkTimelineOrder = () => {
    const isCorrect = timelineItems.every((item, index) => item.order === index + 1);
    if (isCorrect) {
      setScore(prev => prev + 50);
      setIsWon(true);
    } else {
      setScore(prev => Math.max(0, prev - 10));
      // Signal error visually (could add a shake class or feedback state)
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
                <button 
                  onClick={() => startGame('crossword', lecture.id)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors text-sm font-bold group"
                >
                  <div className="flex items-center gap-2">
                    <Grid size={16} /> الكلمات المتقاطعة
                  </div>
                  <ChevronRight size={14} className="group-hover:translate-x-[-4px] transition-transform" />
                </button>
                <button 
                  onClick={() => startGame('timeline', lecture.id)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors text-sm font-bold group"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} /> تسلسل الأحداث
                  </div>
                  <ChevronRight size={14} className="group-hover:translate-x-[-4px] transition-transform" />
                </button>
                <button 
                  onClick={() => startGame('mapping', lecture.id)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-cyan-50 hover:text-cyan-700 rounded-xl transition-colors text-sm font-bold group"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch size={16} /> ربط المفاهيم
                  </div>
                  <ChevronRight size={14} className="group-hover:translate-x-[-4px] transition-transform" />
                </button>
                <button 
                  onClick={() => startGame('sorting', lecture.id)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors text-sm font-bold group"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} /> تصنيف المفاهيم
                  </div>
                  <ChevronRight size={14} className="group-hover:translate-x-[-4px] transition-transform" />
                </button>
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
                {activeMode === 'crossword' && "الكلمات المتقاطعة"}
                {activeMode === 'timeline' && "تسلسل الأحداث والنظريات"}
                {activeMode === 'mapping' && "خريطة المفاهيم المترابطة"}
              </h3>
            <p className="text-xs text-slate-400">المحاضرة: {SYLLABUS.find(l => l.id === selectedLecture)?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {activeMode === 'timeline' && !isWon && (
            <button 
              onClick={checkTimelineOrder}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md"
            >
              تحقق من الترتيب
            </button>
          )}
          {activeMode === 'crossword' && !isWon && (
            <button 
              onClick={showAllCrosswordAnswers}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors border border-red-100"
            >
              كشف جميع الإجابات
            </button>
          )}
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
          
          <div className="mb-8 p-6 bg-indigo-50 rounded-2xl inline-block border border-indigo-100">
            <p className="text-slate-600 mb-2 font-bold">النتيجة النهائية</p>
            <div className="text-5xl font-bold text-indigo-700 flex items-center justify-center gap-3">
              <Star className="fill-yellow-500 text-yellow-500" size={40} />
              {score}
            </div>
          </div>

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
                  <div className={`p-8 border-2 rounded-3xl w-full text-center transition-all duration-300 ${
                    sortFeedback === 'correct' ? 'bg-green-50 border-green-400 text-green-800 scale-105' :
                    sortFeedback === 'wrong' ? 'bg-red-50 border-red-400 text-red-800' :
                    'bg-indigo-50 border-dashed border-indigo-200 animate-pulse'
                  }`}>
                    <p className={`text-lg font-bold mb-2 ${
                      sortFeedback === 'correct' ? 'text-green-700' :
                      sortFeedback === 'wrong' ? 'text-red-700' :
                      'text-indigo-900'
                    }`}>
                      {sortFeedback === 'correct' ? 'إجابة صحيحة!' :
                       sortFeedback === 'wrong' ? 'حاول مرة أخرى! (-5 نقاط)' :
                       'المفهوم الحالي:'}
                    </p>
                    <h4 className="text-2xl font-bold">{sortItems[0].text}</h4>
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from(new Set(sortItems.map(i => i.category))).map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => sortItems.length > 0 && handleSort(sortItems[0], cat)}
                    disabled={sortFeedback !== null}
                    className="p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="p-3 bg-slate-50 group-hover:bg-indigo-100 rounded-2xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Layers size={24} />
                    </div>
                    <span className="text-lg font-bold text-slate-800">{cat}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">انقر للتصنيف</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Game */}
          {activeMode === 'timeline' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 text-amber-800 text-sm italic text-center">
                رتب الأحداث التالية من الأقدم إلى الأحدث أو حسب التسلسل المنطقي الصحيح.
              </div>
              {timelineItems.map((item, index) => (
                <motion.div 
                  layout
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => moveTimelineItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      onClick={() => moveTimelineItem(index, 'down')}
                      disabled={index === timelineItems.length - 1}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 shrink-0">
                    {index + 1}
                  </div>
                  <p className="font-bold text-slate-700 flex-1">{item.text}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Mapping Game */}
          {activeMode === 'mapping' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative py-10">
              <div className="space-y-4">
                <h4 className="text-center font-bold text-slate-400 mb-6 uppercase text-xs tracking-widest">المفاهيم</h4>
                {mappingItems.filter(i => i.side === 'left').map(item => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMappingClick(item.id, item.partnerId)}
                    disabled={mappingMatched.includes(item.id)}
                    className={`w-full p-6 rounded-2xl text-center border-2 transition-all relative
                      ${mappingMatched.includes(item.id) ? 'bg-green-50 border-green-200 text-green-700 opacity-50' : 
                        mappingActiveId === item.id ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg z-10' :
                        'bg-white border-slate-100 text-slate-700 hover:border-indigo-400 shadow-sm'}`}
                  >
                    <span className="font-bold">{item.text}</span>
                    {mappingActiveId === item.id && (
                      <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 hidden md:block">
                        <div className="w-6 h-1 bg-indigo-600 rounded-full"></div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              <div className="space-y-4">
                <h4 className="text-center font-bold text-slate-400 mb-6 uppercase text-xs tracking-widest">الدلالات / الحلقات</h4>
                {mappingItems.filter(i => i.side === 'right').map(item => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMappingClick(item.id, item.partnerId)}
                    disabled={mappingMatched.includes(item.partnerId)} // Partner matches when term matches
                    className={`w-full p-6 rounded-2xl text-center border-2 transition-all relative
                      ${mappingMatched.includes(item.id) ? 'bg-green-50 border-green-200 text-green-700 opacity-50' : 
                        mappingActiveId === item.id ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg z-10' :
                        'bg-white border-slate-100 text-slate-700 hover:border-indigo-400 shadow-sm'}`}
                  >
                    <span className="text-sm font-medium">{item.text}</span>
                    {mappingActiveId === item.id && (
                      <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 hidden md:block">
                        <div className="w-6 h-1 bg-indigo-600 rounded-full"></div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Crossword Game */}
          {activeMode === 'crossword' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <p className="text-slate-500 text-center md:text-right flex-1">
                    اقرأ التعريف واكتب المصطلح الصحيح. استخدم التلميحات عند الحاجة!
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if(window.confirm('هل أنت متأكد من إعادة تعيين اللعبة؟')) {
                        localStorage.removeItem(`crossword_progress_${selectedLecture}`);
                        initCrossword(selectedLecture!);
                      }
                    }}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-xl transition-all border border-red-100 shadow-sm font-bold"
                  >
                    <RefreshCw size={16} className="text-red-500" /> 
                    إعادة البدء
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {crosswordWords.map((word, index) => (
                    <motion.div 
                      key={word.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-3xl border-2 transition-all duration-300 ${
                        word.guessed ? 'bg-green-50/50 border-green-200 shadow-sm' : 
                        word.isError ? 'bg-red-50/50 border-red-200 shadow-sm' : 
                        activeWordId === word.id ? 'bg-indigo-50/30 border-indigo-400 shadow-md ring-4 ring-indigo-500/10' :
                        'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'}`}
                    >
                      <div className="flex flex-col gap-6">
                        <div className={`flex items-start gap-4 p-2 rounded-xl transition-colors duration-300 ${activeWordId === word.id ? 'bg-indigo-100/50 text-indigo-900 border-r-4 border-indigo-600 pr-3' : ''}`}>
                          <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${activeWordId === word.id ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                            {index + 1}
                          </span>
                          <p className={`font-medium text-lg leading-relaxed pt-1 transition-all ${activeWordId === word.id ? 'scale-[1.02] origin-right' : 'text-slate-700'}`}>
                            {word.definition}
                          </p>
                        </div>
                        
                        <div className={`flex flex-col lg:flex-row items-center justify-between gap-6 p-5 rounded-2xl border transition-all duration-300 ${activeWordId === word.id ? 'bg-white shadow-inner border-indigo-200' : 'bg-slate-50/50 border-slate-100'}`}>
                          <div className="flex gap-1.5 flex-wrap justify-center items-center" dir="rtl">
                            {word.term.split('').map((char, i) => {
                              if (char === ' ') {
                                return <div key={i} className="w-4 h-12"></div>;
                              }
                              const isHinted = word.hintsUsed !== undefined && i < word.hintsUsed;
                              const isIncorrect = word.isError && word.userInput[i] && word.userInput[i] !== ' ' && normalizeArabic(word.userInput[i]) !== normalizeArabic(char);
                              const isFocused = activeWordId === word.id && activeCellIndex === i;

                              return (
                                <motion.input 
                                  key={i}
                                  id={`input-${word.id}-${i}`}
                                  type="text"
                                  maxLength={1}
                                  value={word.guessed ? char : (word.userInput[i] && word.userInput[i] !== ' ' ? word.userInput[i] : '')}
                                  whileFocus={{ scale: 1.1, zIndex: 10 }}
                                  onFocus={() => {
                                    setActiveWordId(word.id);
                                    setActiveCellIndex(i);
                                  }}
                                  onBlur={() => {
                                    // Delay clearing to allow click events on buttons
                                    setTimeout(() => {
                                      setActiveCellIndex(prev => prev === i ? null : prev);
                                    }, 100);
                                  }}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCrosswordWords(prev => prev.map(w => {
                                      if (w.id === word.id) {
                                        let arr = w.userInput.split('');
                                        while(arr.length < w.term.length) arr.push(' ');
                                        arr[i] = val || ' ';
                                        return { ...w, userInput: arr.join(''), isError: false };
                                      }
                                      return w;
                                    }));
                                    if (val && i < word.term.length - 1) {
                                       let nextI = i + 1;
                                       while(nextI < word.term.length && word.term[nextI] === ' ') nextI++;
                                       const nextEl = document.getElementById(`input-${word.id}-${nextI}`);
                                       if (nextEl) nextEl.focus();
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && (!word.userInput[i] || word.userInput[i] === ' ')) {
                                       let prevI = i - 1;
                                       while(prevI >= 0 && word.term[prevI] === ' ') prevI--;
                                       const prevEl = document.getElementById(`input-${word.id}-${prevI}`);
                                       if (prevEl) prevEl.focus();
                                    } else if (e.key === 'Enter' && !word.guessed) {
                                      checkCrosswordAnswer(word.id);
                                    }
                                  }}
                                  disabled={word.guessed || isHinted}
                                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center rounded-xl border-2 outline-none transition-all font-bold text-xl
                                    ${word.guessed ? 'bg-green-100 border-green-400 text-green-800 shadow-inner' : 
                                      isIncorrect ? 'bg-red-50 border-red-500 text-red-900 animate-shake' :
                                      word.isError && word.userInput[i] && word.userInput[i] !== ' ' ? 'bg-green-50 border-green-300 text-green-800' : 
                                      isFocused ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg ring-4 ring-indigo-500/20' :
                                      activeWordId === word.id ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm' :
                                      isHinted ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-inner' :
                                      'bg-white border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 text-slate-800 shadow-sm hover:border-slate-400'}`}
                                />
                              );
                            })}
                          </div>
                          
                          <AnimatePresence mode="wait">
                            {!word.guessed ? (
                              <motion.div 
                                key="actions"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex gap-2 shrink-0"
                              >
                                <motion.button 
                                  whileHover={{ scale: 1.05, backgroundColor: '#4338ca' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => checkCrosswordAnswer(word.id)}
                                  className="bg-indigo-600 text-white px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold text-sm shadow-md"
                                  title="تحقق من الإجابة"
                                >
                                  <CheckCircle2 size={18} /> تحقق
                                </motion.button>
                                <motion.button 
                                  whileHover={{ scale: 1.05, backgroundColor: '#fde68a' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCrosswordHint(word.id)}
                                  className="bg-amber-100 text-amber-700 px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold text-sm shadow-sm"
                                  title="تلميح (-2 نقطة)"
                                >
                                  <Zap size={18} /> تلميح
                                </motion.button>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="success"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center justify-center px-8 py-3.5 bg-green-100 text-green-700 rounded-xl font-bold gap-2 shadow-sm border border-green-200"
                              >
                                <CheckCircle2 size={24} className="animate-bounce" /> إجابة صحيحة
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {word.isError && !word.guessed && (
                          <motion.p 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-500 text-sm font-bold flex items-center gap-2"
                          >
                            <XCircle size={16} /> إجابة خاطئة، تم خصم 5 نقاط. حاول مرة أخرى!
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};