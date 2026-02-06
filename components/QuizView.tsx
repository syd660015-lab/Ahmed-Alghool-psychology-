import React, { useState } from 'react';
import { SYLLABUS } from '../constants';
import { QUIZ_DATA } from '../constants/quizData';
import { 
  CheckCircle, XCircle, ChevronLeft, ChevronRight, 
  RefreshCw, AlertCircle, BookOpen, Brain, 
  Lightbulb, ArrowRightCircle, Target
} from 'lucide-react';

export const QuizView: React.FC = () => {
  const [selectedLecture, setSelectedLecture] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuiz = selectedLecture ? QUIZ_DATA.find(q => q.lectureId === selectedLecture) : null;
  const lectureData = selectedLecture ? SYLLABUS.find(l => l.id === selectedLecture) : null;
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    if (selectedOption === currentQuestion?.correctAnswer) {
      setScore(prev => prev + 1);
    }
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  };

  const resetQuiz = () => {
    setSelectedLecture(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
  };

  if (!selectedLecture) {
    return (
      <div className="animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold text-center mb-10 academic-font text-slate-800">بنك الأسئلة التفاعلي</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SYLLABUS.map((lecture) => (
            <button
              key={lecture.id}
              onClick={() => setSelectedLecture(lecture.id)}
              className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all text-right group flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {lecture.id}
                </div>
                <div>
                  <span className="text-xs text-indigo-500 font-bold uppercase tracking-widest">المحاضرة المختارة</span>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-900">{lecture.title}</h3>
                </div>
              </div>
              <ChevronLeft className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:-translate-x-2" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={resetQuiz} 
          className="text-sm font-bold text-slate-500 flex items-center gap-2 hover:text-indigo-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 transition-all active:scale-95"
        >
          <RefreshCw size={16} /> تغيير المحاضرة
        </button>
        <div className="flex items-center gap-3">
           <div className="hidden sm:block text-left mr-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">التقدم الحالي</p>
             <p className="text-xs font-bold text-indigo-900">{currentQuestionIndex + 1} / {currentQuiz?.questions.length}</p>
           </div>
           <div className="w-12 h-12 rounded-full border-4 border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-sm">
             {Math.round(((currentQuestionIndex + 1) / (currentQuiz?.questions.length || 1)) * 100)}%
           </div>
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Progress bar line */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-slate-100">
           <div 
             className="h-full bg-indigo-600 transition-all duration-500 ease-out"
             style={{ width: `${((currentQuestionIndex + 1) / (currentQuiz?.questions.length || 1)) * 100}%` }}
           ></div>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl h-fit text-white shadow-lg shadow-indigo-100">
            <AlertCircle size={24} />
          </div>
          <p className="text-xl font-bold text-slate-800 leading-relaxed academic-font">
            {currentQuestion?.scenario}
          </p>
        </div>

        <div className="space-y-4 mb-10">
          {currentQuestion?.options.map((option, idx) => {
            const isCorrect = idx === currentQuestion.correctAnswer;
            const isSelected = selectedOption === idx;
            
            let btnClass = "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md";
            if (isSubmitted) {
              if (isCorrect) btnClass = "border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500";
              else if (isSelected) btnClass = "border-red-500 bg-red-50 opacity-70";
              else btnClass = "border-slate-100 bg-slate-50 opacity-40";
            } else if (isSelected) {
              btnClass = "border-indigo-600 bg-indigo-50 shadow-lg ring-1 ring-indigo-600";
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full p-5 rounded-2xl text-right border-2 transition-all flex items-center justify-between group ${btnClass}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                    isSelected || (isSubmitted && isCorrect) ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500'
                  }`}>
                    {String.fromCharCode(1571 + idx)}
                  </span>
                  <span className="font-bold text-slate-700">{option}</span>
                </div>
                {isSubmitted && isCorrect && <CheckCircle className="text-green-600" size={24} />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="text-red-600" size={24} />}
              </button>
            );
          })}
        </div>

        {isSubmitted && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
            {/* Detailed Academic Breakdown Section */}
            <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-600 hover:shadow-xl transition-all shadow-md mt-6">
              <div className="flex items-center gap-3 mb-4 text-indigo-900">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <h4 className="text-lg font-black academic-font">التحليل الأكاديمي المتعمق</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="mt-1 text-indigo-400">
                    <Lightbulb size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 text-sm leading-relaxed mb-4">
                      {currentQuestion?.explanation}
                    </p>
                  </div>
                </div>

                {/* Link back to Lecture Concepts */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3 text-xs font-black text-slate-500 uppercase tracking-tighter">
                    <Target size={14} className="text-indigo-600" />
                    <span>ارتباطات المفاهيم المركزية (Core Concepts)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lectureData?.keyConcepts.map((concept, cIdx) => (
                      <span key={cIdx} className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-indigo-700 border border-indigo-100 shadow-sm">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[11px] font-bold text-slate-400 italic">
                  <Brain size={14} />
                  <span>"الهدف من السؤال هو الربط بين السيناريو الواقعي والبنية النظرية للمنهج."</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full bg-indigo-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              <span className="text-lg">انتقل إلى السؤال التالي</span>
              <ArrowRightCircle size={22} className="transition-transform group-hover:translate-x-[-4px]" />
            </button>
          </div>
        )}

        {!isSubmitted && (
          <button 
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-900 transition-all shadow-xl disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Target size={22} />
            <span className="text-lg">تأكيد الإجابة النهائية</span>
          </button>
        )}
      </div>
      
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50/50 rounded-full border border-indigo-100">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <p className="text-sm text-indigo-800 font-medium italic academic-font">
             "القياس النفسي ليس مجرد أرقام، بل هو فهم للروح الإنسانية في سياقها الدينامي"
          </p>
        </div>
      </div>
    </div>
  );
};
