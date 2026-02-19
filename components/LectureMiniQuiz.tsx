
import React, { useState, useMemo } from 'react';
import { Question } from '../types';
import { QUIZ_DATA } from '../constants/quizData';
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw, Award, Lightbulb } from 'lucide-react';

interface LectureMiniQuizProps {
  lectureId: number;
  lectureTitle: string;
  onClose: () => void;
}

export const LectureMiniQuiz: React.FC<LectureMiniQuizProps> = ({ lectureId, lectureTitle, onClose }) => {
  const lectureQuiz = QUIZ_DATA.find(q => q.lectureId === lectureId);
  
  // Select 3 random questions for a "Short Quiz"
  const questions = useMemo(() => {
    if (!lectureQuiz) return [];
    return [...lectureQuiz.questions].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [lectureQuiz]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl">
        <p className="text-slate-500">عذراً، لا تتوفر أسئلة لهذه المحاضرة حالياً.</p>
        <button onClick={onClose} className="mt-4 text-indigo-600 font-bold underline">العودة</button>
      </div>
    );
  }

  if (showResult) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="p-8 text-center bg-white rounded-3xl animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award size={40} className="text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2 academic-font">نتيجتك في الاختبار القصير</h3>
        <p className="text-slate-500 mb-6">لقد أجبت على {score} من أصل {questions.length} أسئلة بشكل صحيح.</p>
        
        <div className="relative w-full h-4 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-1000" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOption(null);
              setIsAnswered(false);
              setScore(0);
              setShowResult(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            <RotateCcw size={18} /> إعادة المحاولة
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-indigo-900 text-white rounded-xl font-bold hover:bg-indigo-800 transition-colors shadow-lg"
          >
            تمت المراجعة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-3xl shadow-inner animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">
          سؤال {currentIndex + 1} من {questions.length}
        </span>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
      </div>

      <h4 className="text-lg font-bold text-slate-800 mb-8 academic-font leading-relaxed">
        {currentQuestion.scenario}
      </h4>

      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((option, idx) => {
          const isCorrect = idx === currentQuestion.correctAnswer;
          const isSelected = selectedOption === idx;
          
          let style = "border-slate-100 bg-slate-50 hover:border-indigo-200";
          if (isAnswered) {
            if (isCorrect) style = "border-green-500 bg-green-50 text-green-700";
            else if (isSelected) style = "border-red-500 bg-red-50 text-red-700 opacity-70";
            else style = "border-slate-50 bg-slate-50 opacity-40";
          } else if (isSelected) {
            style = "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm";
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelect(idx)}
              className={`w-full p-4 rounded-2xl text-right border-2 transition-all flex items-center gap-4 group ${style}`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                isSelected || (isAnswered && isCorrect) ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-400'
              }`}>
                {String.fromCharCode(1571 + idx)}
              </span>
              <span className="font-bold">{option}</span>
            </button>
          );
        })}
      </div>

      {isAnswered ? (
        <div className="animate-in slide-in-from-top-2 duration-300 space-y-6">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3 items-start">
            <Lightbulb className="text-indigo-600 mt-1 flex-shrink-0" size={18} />
            <div className="text-sm">
              <span className="font-bold text-indigo-900 block mb-1">لماذا هذه الإجابة؟</span>
              <p className="text-slate-700 leading-relaxed italic">{currentQuestion.explanation}</p>
            </div>
          </div>
          <button 
            onClick={handleNext}
            className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-bold hover:bg-indigo-800 shadow-xl transition-all"
          >
            {currentIndex === questions.length - 1 ? "رؤية النتيجة النهائية" : "السؤال التالي"}
          </button>
        </div>
      ) : (
        <button 
          disabled={selectedOption === null}
          onClick={handleCheck}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-900 shadow-lg disabled:bg-slate-100 disabled:text-slate-400 transition-all"
        >
          تأكيد الإجابة
        </button>
      )}
    </div>
  );
};
