
import React, { useState } from 'react';
import { SYLLABUS } from '../constants';
import { LectureMiniQuiz } from './LectureMiniQuiz';
import { LectureNotes } from './LectureNotes';
import { 
  Book, CheckCircle2, Brain, Network, Zap, Users, 
  EyeOff, Puzzle, Heart, Ruler, Palette, Activity,
  Info, Target, Shield, BookOpen, ClipboardCheck, X, PencilLine
} from 'lucide-react';

const getLectureIcon = (id: number) => {
  switch (id) {
    case 1: return Brain;
    case 2: return Network;
    case 3: return Zap;
    case 4: return Users;
    case 5: return EyeOff;
    case 6: return Puzzle;
    case 7: return Heart;
    case 8: return Ruler;
    case 9: return Palette;
    case 10: return Activity;
    case 11: return Shield;
    default: return Book;
  }
};

export const LecturesView: React.FC = () => {
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [openNotesId, setOpenNotesId] = useState<number | null>(null);

  const activeLecture = SYLLABUS.find(l => l.id === activeQuizId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 academic-font">مخطط المحاضرات الأكاديمية</h2>
        <div className="w-24 h-1 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
        <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
          دورة علم النفس الدينامي ونظريات القياس، تحت إشراف دكتور. أحمد حمدي عاشور الغول. كلية الآداب بجامعة العريش.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
        {SYLLABUS.map((lecture) => {
          const IconComponent = getLectureIcon(lecture.id);
          const isNotesOpen = openNotesId === lecture.id;
          
          return (
            <div 
              key={lecture.id} 
              className="relative bg-white rounded-3xl shadow-lg border-t-8 border-indigo-600 transition-all duration-500 ease-out group overflow-hidden hover:shadow-2xl hover:-translate-y-1 transform-gpu"
            >
              {/* Parallax Background Icon */}
              <div className="absolute -top-10 -left-10 opacity-[0.02] group-hover:opacity-[0.08] group-hover:translate-x-12 group-hover:-translate-y-12 group-hover:rotate-[45deg] transition-all duration-1000 ease-in-out pointer-events-none transform-gpu">
                <IconComponent size={240} />
              </div>

              <div className="p-8 relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-900 text-white p-4 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 group-hover:bg-indigo-700 transition-all duration-500 ease-out">
                      <IconComponent size={32} />
                    </div>
                    <div>
                      <span className="text-indigo-600 font-bold text-xs block mb-1 tracking-widest uppercase">المحاضرة {lecture.id}</span>
                      <h3 className="text-2xl font-bold text-slate-900 academic-font group-hover:text-indigo-900 transition-colors duration-300">{lecture.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="relative">
                    <p className="text-slate-700 leading-relaxed font-medium text-lg">
                      {lecture.description}
                    </p>
                  </div>

                  {/* Title Explanation Box */}
                  <div className="bg-slate-50 border-r-4 border-indigo-400 p-5 rounded-2xl group-hover:bg-indigo-50/50 group-hover:border-indigo-600 transition-all duration-500">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold mb-2 text-sm">
                      <Info size={16} />
                      <span>سياق المفهوم:</span>
                    </div>
                    <p className="text-slate-600 text-sm italic leading-relaxed">
                      {lecture.titleExplanation}
                    </p>
                  </div>

                  {/* Learning Goals */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <Target size={18} className="text-indigo-600" />
                      <span>المستهدف من المحاضرة:</span>
                    </div>
                    <ul className="grid grid-cols-1 gap-3">
                      {lecture.goals.map((goal, idx) => (
                        <li 
                          key={idx} 
                          className="flex items-start gap-3 text-sm text-slate-600 bg-white border border-slate-100 p-3 rounded-xl group-hover:border-indigo-200 group-hover:shadow-sm transition-all duration-300 transform group-hover:translate-x-1"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                    {lecture.keyConcepts.map((concept, idx) => (
                      <span 
                        key={idx} 
                        className="flex items-center gap-1 text-[10px] uppercase font-black text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes Section Toggle */}
                {isNotesOpen && <LectureNotes lectureId={lecture.id} />}

                {/* Quick Action Buttons */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                   <button 
                     onClick={() => setOpenNotesId(isNotesOpen ? null : lecture.id)}
                     className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 border-2 ${
                       isNotesOpen 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-inner' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50 shadow-sm'
                     }`}
                   >
                     <PencilLine size={20} />
                     <span>{isNotesOpen ? 'إغلاق الملاحظات' : 'ملاحظات شخصية'}</span>
                   </button>
                   <button 
                     onClick={() => setActiveQuizId(lecture.id)}
                     className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-900 transition-all shadow-xl active:scale-95"
                   >
                     <ClipboardCheck size={20} />
                     <span>اختبر فهمك</span>
                   </button>
                </div>
              </div>

              {/* Decorative base banner */}
              <div className="bg-slate-50 p-3 text-center border-t border-slate-100 group-hover:bg-indigo-900 group-hover:text-white transition-all duration-500">
                <span className="text-[9px] font-black tracking-widest uppercase opacity-40 group-hover:opacity-100">Arish University • Faculty of Arts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Quiz Modal Overlay */}
      {activeQuizId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setActiveQuizId(null)}
          ></div>
          <div className="relative w-full max-w-xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="bg-indigo-900 px-8 py-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <BookOpen size={24} className="text-indigo-300" />
                   <div>
                     <h3 className="text-xl font-bold academic-font">{activeLecture?.title}</h3>
                     <p className="text-xs text-indigo-300">اختبار سريع للمحتوى</p>
                   </div>
                </div>
                <button 
                  onClick={() => setActiveQuizId(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-2 bg-slate-50">
                <LectureMiniQuiz 
                  lectureId={activeQuizId} 
                  lectureTitle={activeLecture?.title || ''} 
                  onClose={() => setActiveQuizId(null)} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
