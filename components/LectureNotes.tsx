
import React, { useState, useEffect } from 'react';
import { Save, FileText, Trash2, CheckCircle, Download } from 'lucide-react';

interface LectureNotesProps {
  lectureId: number;
}

export const LectureNotes: React.FC<LectureNotesProps> = ({ lectureId }) => {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const STORAGE_KEY = `lecture_note_${lectureId}`;

  useEffect(() => {
    const savedNote = localStorage.getItem(STORAGE_KEY);
    if (savedNote) {
      setNote(savedNote);
    }
  }, [lectureId]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, note);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    }, 600);
  };

  const handleClear = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الملاحظة؟')) {
      setNote('');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExport = () => {
    if (!note.trim()) {
      alert('لا توجد ملاحظات لتصديرها!');
      return;
    }

    const title = `ملاحظات المحاضرة رقم ${lectureId}`;
    const divider = '='.repeat(30);
    const content = `${title}\n${divider}\n\n${note}\n\n\nتم التصدير من منصة القياس النفسي الدينامي`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lecture_Notes_${lectureId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
          <FileText size={16} />
          <span>مفكرتي الشخصية لهذه المحاضرة</span>
        </div>
        <div className="flex items-center gap-2">
           {showSavedToast && (
             <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
               <CheckCircle size={12} /> تم الحفظ
             </span>
           )}
           <button 
             onClick={handleExport}
             className="p-1.5 text-indigo-600 hover:bg-white rounded-lg transition-colors"
             title="تصدير كملف نصي"
           >
             <Download size={16} />
           </button>
           <button 
             onClick={handleClear}
             className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
             title="حذف الملاحظة"
           >
             <Trash2 size={16} />
           </button>
        </div>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="اكتب هنا ملاحظاتك الخاصة، روابط إضافية، أو أسئلة تود طرحها على الدكتور..."
        className="w-full min-h-[120px] bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner"
      />

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save size={14} />
          )}
          حفظ الملاحظة
        </button>
      </div>
    </div>
  );
};
