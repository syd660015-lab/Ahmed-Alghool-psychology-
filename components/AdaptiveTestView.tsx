
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, Brain, Zap, LineChart, Info, RefreshCw, 
  ChevronLeft, CheckCircle2, AlertCircle, BarChart3, TrendingUp,
  Activity, Award
} from 'lucide-react';
import { 
  LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// IRT 2PL Model Function
const calculateProbability = (theta: number, a: number, b: number) => {
  return 1 / (1 + Math.exp(-a * (theta - b)));
};

// Item Information Function for 2PL
const calculateInformation = (theta: number, a: number, b: number) => {
  const p = calculateProbability(theta, a, b);
  const q = 1 - p;
  return a * a * p * q;
};

interface IRTItem {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  a: number; // discrimination
  b: number; // difficulty
  category: string;
}

const ITEM_BANK: IRTItem[] = [
  {
    id: 1,
    question: "وفقاً للنموذج البنيوي لفرويد، أي جهاز يمثل 'مبدأ الواقع'؟",
    options: ["الهو (Id)", "الأنا (Ego)", "الأنا الأعلى (Super-ego)", "اللاشعور"],
    correctIndex: 1,
    a: 1.5,
    b: -1.0,
    category: "التحليل النفسي"
  },
  {
    id: 2,
    question: "ما هو الصفر المطلق في موازين القياس النفسي؟",
    options: ["عدم وجود السمة نهائياً", "متوسط أداء الجماعة", "نقطة اختيارية للبداية", "انحراف معياري واحد"],
    correctIndex: 0,
    a: 1.2,
    b: -0.5,
    category: "أسس القياس"
  },
  {
    id: 3,
    question: "أي من هؤلاء العلماء ركز على 'مشاعر النقص' كمحرك أساسي للشخصية؟",
    options: ["سيجموند فرويد", "كارل يونج", "ألفرد أدلر", "إريك فروم"],
    correctIndex: 2,
    a: 1.8,
    b: 0.0,
    category: "علم النفس الفردي"
  },
  {
    id: 4,
    question: "مصطلح 'الأنماط البدائية' (Archetypes) يرتبط بأي عالم؟",
    options: ["فرويد", "يونج", "أدلر", "هورني"],
    correctIndex: 1,
    a: 1.4,
    b: 0.5,
    category: "التحليل النفسي"
  },
  {
    id: 5,
    question: "في نظرية استجابة المفردة، ماذا يمثل معلم 'الصعوبة' (b)؟",
    options: ["قدرة التمييز بين الأقوياء والضعفاء", "مستوى القدرة الذي تكون فيه احتمالية الإجابة الصحيحة 50%", "احتمالية التخمين", "الثبات الداخلي للمفردة"],
    correctIndex: 1,
    a: 2.5,
    b: 1.5,
    category: "نظريات القياس"
  },
  {
    id: 6,
    question: "ما الفرق الجوهري بين المقياس الفئوي والمقياس النسبي؟",
    options: ["المسافات المتساوية", "الصفر الحقيقي", "التصنيف النوعي", "الترتيب التصاعدي"],
    correctIndex: 1,
    a: 2.0,
    b: 1.8,
    category: "مستويات القياس"
  },
  {
    id: 7,
    question: "تشير 'فلتات اللسان' في التحليل النفسي إلى:",
    options: ["عطل فسيولوجي في مراكز المعالجة", "دليل على صراع لا شعوري مكبوت", "مجرد خطأ عارض نتيجة التعب", "قصور في الأنا الأعلى"],
    correctIndex: 1,
    a: 1.3,
    b: -0.8,
    category: "ديناميات الشخصية"
  },
  {
    id: 8,
    question: "أي مقياس إحصائي يعبر عن توزيع 'المنحنى الاعتدالي'؟",
    options: ["معامل الارتباط", "الانحراف المعياري", "النسبة المئوية", "تربيعي كا"],
    correctIndex: 1,
    a: 1.6,
    b: 1.0,
    category: "القياس النفسي"
  },
  {
    id: 9,
    question: "ما هو الهدف الرئيسي من استخدام 'الاختبارات الإسقاطية'؟",
    options: ["قياس الذكاء المعرفي", "الكشف عن مكونات اللاشعور", "تقييم التحصيل الدراسي", "تحديد الميول المهنية"],
    correctIndex: 1,
    a: 2.2,
    b: 2.2,
    category: "تقييم الشخصية"
  },
  {
    id: 10,
    question: "في النموذج الثنائي PL2، زيادة قيمة 'a' تعني:",
    options: ["السؤال سهل جداً", "السؤال صعب جداً", "القدرة العالية للسؤال على التمييز بين المستويات التقاربة", "عنصر التخمين مرتفع"],
    correctIndex: 2,
    a: 2.8,
    b: 2.5,
    category: "IRT المتقدم"
  }
];

export const AdaptiveTestView: React.FC = () => {
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [theta, setTheta] = useState(0); // Initial ability estimate
  const [history, setHistory] = useState<{theta: number, sem: number}[]>([{theta: 0, sem: 1}]);
  const [administeredItems, setAdministeredItems] = useState<number[]>([]);
  const [currentItem, setCurrentItem] = useState<IRTItem | null>(null);
  const [responses, setResponses] = useState<{itemId: number, correct: boolean}[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Constants for estimation
  const gridPoints = useMemo(() => {
    const points = [];
    for (let i = -4; i <= 4; i += 0.1) points.push(i);
    return points;
  }, []);

  const selectNextItem = (currentTheta: number, excludedIds: number[]) => {
    const availableItems = ITEM_BANK.filter(item => !excludedIds.includes(item.id));
    if (availableItems.length === 0) return null;

    // Find item with Maximum Information at current Theta
    let bestItem = availableItems[0];
    let maxInfo = -1;

    availableItems.forEach(item => {
      const info = calculateInformation(currentTheta, item.a, item.b);
      if (info > maxInfo) {
        maxInfo = info;
        bestItem = item;
      }
    });

    return bestItem;
  };

  const startTest = () => {
    const firstItem = selectNextItem(0, []);
    setCurrentItem(firstItem);
    setIsTestStarted(true);
    setIsTestFinished(false);
    setTheta(0);
    setHistory([{theta: 0, sem: 1}]);
    setAdministeredItems(firstItem ? [firstItem.id] : []);
    setResponses([]);
    setSelectedOption(null);
  };

  const updateAbility = (currentResponses: {itemId: number, correct: boolean}[]) => {
    // EAP (Expected A Posteriori) simplified estimation
    let numerator = 0;
    let denominator = 0;

    gridPoints.forEach(t => {
      let likelihood = 1;
      currentResponses.forEach(res => {
        const item = ITEM_BANK.find(i => i.id === res.itemId)!;
        const p = calculateProbability(t, item.a, item.b);
        likelihood *= res.correct ? p : (1 - p);
      });

      // Prior distribution (Standard Normal)
      const prior = Math.exp(-0.5 * t * t) / Math.sqrt(2 * Math.PI);
      
      numerator += t * likelihood * prior;
      denominator += likelihood * prior;
    });

    const newTheta = numerator / denominator;
    
    // SEM = 1 / sqrt(Sum of Information)
    let totalInfo = 0;
    currentResponses.forEach(res => {
      const item = ITEM_BANK.find(i => i.id === res.itemId)!;
      totalInfo += calculateInformation(newTheta, item.a, item.b);
    });
    
    const sem = 1 / Math.sqrt(totalInfo || 1);

    return { theta: newTheta, sem };
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentItem) return;

    const isCorrect = selectedOption === currentItem.correctIndex;
    const newResponses = [...responses, { itemId: currentItem.id, correct: isCorrect }];
    setResponses(newResponses);

    const { theta: updatedTheta, sem } = updateAbility(newResponses);
    setTheta(updatedTheta);
    setHistory(prev => [...prev, { theta: updatedTheta, sem }]);

    const next = selectNextItem(updatedTheta, [...administeredItems]);
    
    if (next && newResponses.length < 8) { // Test limit
      setCurrentItem(next);
      setAdministeredItems(prev => [...prev, next.id]);
      setSelectedOption(null);
    } else {
      setIsTestFinished(true);
    }
  };

  if (!isTestStarted) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 p-12 text-white text-center relative overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.1, scale: 1 }}
              className="absolute -top-10 -right-10"
            >
              <Zap size={300} />
            </motion.div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Target size={40} />
              </div>
              <h1 className="text-4xl font-black academic-font mb-4">اختبار القياس النفسي التكيفي (CAT)</h1>
              <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                نظام ذكي يستخدم نظرية الاستجابة للمفردة (IRT) لتغيير صعوبة الأسئلة وفقاً لمستواك الحقيقي.
              </p>
            </div>
          </div>
          
          <div className="p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Zap className="text-amber-500" />, title: "تعديل تلقائي", desc: "تزداد الصعوبة عند الإجابة الصحيحة وتقل عند الخطأ." },
                { icon: <LineChart className="text-blue-500" />, title: "نموذج PL2", desc: "قياس دقيق يعتمد على معالم الصعوبة والتمييز لكل سؤال." },
                { icon: <Brain className="text-purple-500" />, title: "توفير الوقت", desc: "يصل لقدرتك الحقيقة بعدد أسئلة أقل بكثير من الاختبار العادي." }
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                  <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-slate-800">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
              <h4 className="flex items-center gap-2 font-bold text-indigo-900 mb-4 text-lg">
                <Info size={20} /> كيف يعمل النموذج؟
              </h4>
              <ul className="space-y-3 text-indigo-800 text-sm">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 shrink-0" />
                  بدءاً بمستوى متوسط (θ = 0)، يبحث المحرك عن "أكثر سؤال معلوماتي" لك.
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 shrink-0" />
                  يتم حساب احتمالية الإجابة الصحيحة بناءً على معلمي الصعوبة (b) والتمييز (a).
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 shrink-0" />
                  يتوقف الاختبار عندما يستقر تقدير القدرة ويقل خطأ القياس المعياري (SEM).
                </li>
              </ul>
            </div>

            <button 
              onClick={startTest}
              className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-4 group"
            >
              ابدأ الاختبار التكيفي الآن
              <ChevronLeft className="group-hover:-translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isTestFinished) {
    const finalReport = {
      level: theta > 1.5 ? "متقدم جداً" : theta > 0.5 ? "فوق المتوسط" : theta > -0.5 ? "متوسط" : theta > -1.5 ? "مقبول" : "تحت المتوسط",
      color: theta > 0.5 ? "text-emerald-600" : theta > -0.5 ? "text-indigo-600" : "text-amber-600",
      icon: theta > 0.5 ? <Award size={64} className="text-emerald-500" /> : <BarChart3 size={64} className="text-indigo-500" />
    };

    return (
      <div className="max-w-5xl mx-auto py-10 px-6 space-y-8 animate-in zoom-in duration-500">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            {finalReport.icon}
          </div>
          <h2 className="text-4xl font-black academic-font mb-4">تقرير القدرة النفسية المستنتجة</h2>
          <div className="flex flex-col items-center gap-2 mb-10">
            <span className={`text-5xl font-black ${finalReport.color}`}>θ = {theta.toFixed(3)}</span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">مستوى القدرة المقدر (Theta)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-right">
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h4 className="font-bold text-slate-500 text-xs uppercase mb-2 flex items-center gap-2">
                  <TrendingUp size={14} /> التقييم الكيفي
                </h4>
                <p className="text-2xl font-bold text-slate-800">{finalReport.level}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h4 className="font-bold text-slate-500 text-xs uppercase mb-2 flex items-center gap-2">
                  <AlertCircle size={14} /> خطأ القياس المعياري (SEM)
                </h4>
                <p className="text-2xl font-bold text-slate-800">± {history[history.length-1].sem.toFixed(3)}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 h-full flex flex-col">
              <h4 className="font-bold text-slate-500 text-xs uppercase mb-4 flex items-center gap-2">
                <LineChart size={14} /> منحنى تحديث القدرة
              </h4>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorTheta" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="index" hide />
                    <YAxis domain={[-3, 3]} stroke="#94a3b8" fontSize={10} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="theta" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTheta)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={startTest}
              className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
            >
              <RefreshCw size={20} /> اختبار جديد
            </button>
            <button 
              onClick={() => setIsTestStarted(false)}
              className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              العودة للتعليمات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Current Selection / Question Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">السؤال رقم {administeredItems.length}</h3>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{currentItem?.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
              <Activity size={14} className="animate-pulse" /> مباشر
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentItem?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug academic-font">
                {currentItem?.question}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {currentItem?.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`group flex items-center p-6 rounded-2xl border-2 transition-all text-right ${
                      selectedOption === idx 
                        ? 'border-indigo-600 bg-indigo-50 shadow-md ring-4 ring-indigo-500/10' 
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ml-4 shrink-0 transition-colors ${
                      selectedOption === idx ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-lg font-medium transition-colors ${
                      selectedOption === idx ? 'text-indigo-900' : 'text-slate-600'
                    }`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase mr-2">صعوبة</span>
                    <span className="font-bold text-slate-700">b={currentItem?.b.toFixed(1)}</span>
                  </div>
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase mr-2">تمييز</span>
                    <span className="font-bold text-slate-700">a={currentItem?.a.toFixed(1)}</span>
                  </div>
                </div>

                <button
                  disabled={selectedOption === null}
                  onClick={handleSubmit}
                  className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-30 flex items-center gap-2 group"
                >
                  إرسال الإجابة
                  <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Real-time Analytics Dashboard */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <LineChart size={20} className="text-indigo-600" /> الحالة اللحظية للقياس
          </h3>
          
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">القدرة الحالية المقدرة</p>
              <p className="text-4xl font-black text-indigo-600 academic-font">θ = {theta.toFixed(3)}</p>
            </div>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLine data={history.map((h, i) => ({ ...h, step: i }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="step" hide />
                  <YAxis domain={[-3, 3]} stroke="#cbd5e1" fontSize={10} />
                  <RechartsTooltip />
                  <Line 
                    type="stepAfter" 
                    dataKey="theta" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </RechartsLine>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase">خطأ القياس (SEM)</span>
                <span className="text-sm font-bold text-slate-700">{history[history.length-1].sem.toFixed(4)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-indigo-600 h-full"
                  initial={{ width: "100%" }}
                  animate={{ width: `${Math.max(10, (1 - history[history.length-1].sem) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center">كلما زادت الدقة، قل شريط الخطأ.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-white space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Info size={16} className="text-indigo-400" />
            </div>
            <h4 className="font-bold text-sm">نصيحة القياس</h4>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            النظام يقوم حالياً باختيار الأسئلة التي تقع في منطقة "أقصى معلومة" بالقرب من مستواك الحالي. إذا كانت إجابتك صحيحة، سيتم اقتراح سؤال أكثر صعوبة لتحدي قدرتك.
          </p>
        </div>
      </div>
    </div>
  );
};
