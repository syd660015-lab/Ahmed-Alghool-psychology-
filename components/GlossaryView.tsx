
import React, { useState, useEffect } from 'react';
import { SYLLABUS } from '../constants';
import { Search, BookMarked, Filter, Plus, X, Trash2, Info, BookOpen, ExternalLink } from 'lucide-react';

interface CustomTerm {
  id: string;
  term: string;
  termEn: string;
  definition: string;
  lectureTitle: string;
  lectureId: number | string;
  isCustom: boolean;
}

export const GlossaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLecture, setSelectedLecture] = useState<number | 'all' | 'custom'>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [customTerms, setCustomTerms] = useState<CustomTerm[]>([]);

  // New term form state
  const [newTerm, setNewTerm] = useState('');
  const [newTermEn, setNewTermEn] = useState('');
  const [newDefinition, setNewDefinition] = useState('');

  // Load custom terms from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('academic_custom_terms');
    if (saved) {
      try {
        setCustomTerms(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse custom terms", e);
      }
    }
  }, []);

  // Save custom terms to localStorage
  useEffect(() => {
    localStorage.setItem('academic_custom_terms', JSON.stringify(customTerms));
  }, [customTerms]);

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDefinition.trim()) return;

    const term: CustomTerm = {
      id: Date.now().toString(),
      term: newTerm,
      termEn: newTermEn,
      definition: newDefinition,
      lectureTitle: 'مصطلح مضاف من الطالب',
      lectureId: 'custom',
      isCustom: true
    };

    setCustomTerms([term, ...customTerms]);
    setNewTerm('');
    setNewTermEn('');
    setNewDefinition('');
    setIsAddFormOpen(false);
  };

  const handleDeleteCustomTerm = (id: string) => {
    if (window.confirm('هل تريد حذف هذا المصطلح من قاموسك الشخصي؟')) {
      setCustomTerms(customTerms.filter(t => t.id !== id));
    }
  };

  const syllabusTerms = SYLLABUS.flatMap(l => 
    l.glossary.map(t => ({ 
      ...t, 
      id: `syllabus-${l.id}-${t.term}`, 
      lectureTitle: l.title, 
      lectureId: l.id,
      isCustom: false
    }))
  );

  const allTerms = [...customTerms, ...syllabusTerms];

  const filteredTerms = allTerms.filter(t => {
    const matchesSearch = t.term.includes(searchTerm) || t.termEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLecture = selectedLecture === 'all' || 
                           (selectedLecture === 'custom' && t.isCustom) ||
                           t.lectureId === selectedLecture;
    return matchesSearch && matchesLecture;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 academic-font">قاموس المصطلحات الأكاديمية</h2>
        <div className="w-24 h-1 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
        <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
          دليلك الشامل للمفاهيم الأساسية في علم النفس الدينامي ونظريات القياس. يمكنك الآن إضافة ملاحظاتك ومصطلحاتك الخاصة.
        </p>
      </div>

      <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن مصطلح (بالعربية أو الإنجليزية)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedLecture}
                onChange={(e) => setSelectedLecture(e.target.value === 'all' ? 'all' : (e.target.value === 'custom' ? 'custom' : Number(e.target.value)))}
                className="bg-transparent focus:outline-none text-xs font-bold text-slate-600 appearance-none pr-6 cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left center', backgroundSize: '12px' }}
              >
                <option value="all">كل المحاضرات</option>
                <option value="custom">المصطلحات المضافة</option>
                {SYLLABUS.map(l => (
                  <option key={l.id} value={l.id}>المحاضرة {l.id}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all text-sm shadow-lg ${
                isAddFormOpen ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
              }`}
            >
              {isAddFormOpen ? <X size={18} /> : <Plus size={18} />}
              <span className="hidden sm:inline">{isAddFormOpen ? 'إلغاء' : 'إضافة مصطلح'}</span>
            </button>
          </div>
        </div>

        {isAddFormOpen && (
          <form onSubmit={handleAddTerm} className="mt-4 p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-900 block px-1">المصطلح (بالعربية) *</label>
                <input
                  required
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="مثال: الشعور بالنقص"
                  className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-900 block px-1">English Term</label>
                <input
                  type="text"
                  value={newTermEn}
                  onChange={(e) => setNewTermEn(e.target.value)}
                  placeholder="e.g. Inferiority Feeling"
                  className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-sans shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-indigo-900 block px-1">التعريف الأكاديمي *</label>
              <textarea
                required
                rows={3}
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                placeholder="اكتب هنا شرحاً موجزاً ودقيقاً للمصطلح..."
                className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-800 transition-all shadow-md active:scale-[0.99]"
            >
              حفظ المصطلح في القاموس الشخصي
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((item) => (
            <div 
              key={item.id} 
              className={`flex flex-col bg-white rounded-[2rem] border transition-all duration-300 group overflow-hidden ${
                item.isCustom 
                  ? 'border-indigo-200 bg-indigo-50/5 hover:border-indigo-400 hover:shadow-2xl shadow-indigo-100' 
                  : 'border-slate-100 hover:border-indigo-300 hover:shadow-2xl shadow-slate-200'
              }`}
            >
              {/* Header: Term and EN translation */}
              <div className="p-6 pb-0 flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-900 transition-colors academic-font leading-tight">
                    {item.term}
                  </h3>
                  {item.termEn && (
                    <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-[10px] font-black font-sans tracking-wider uppercase shadow-sm">
                      {item.termEn}
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  {item.isCustom ? (
                    <button 
                      onClick={() => handleDeleteCustomTerm(item.id)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="حذف المصطلح"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                      <BookMarked size={20} />
                    </div>
                  )}
                </div>
              </div>

              {/* Body: Definition */}
              <div className="p-6 flex-1">
                <div className="relative">
                  <div className="absolute -right-4 top-0 bottom-0 w-1 bg-slate-100 rounded-full group-hover:bg-indigo-400 transition-colors"></div>
                  <p className="text-slate-600 text-sm leading-relaxed academic-font text-lg pr-2 italic">
                    {item.definition}
                  </p>
                </div>
              </div>

              {/* Footer: Metadata */}
              <div className={`px-6 py-4 flex items-center justify-between border-t transition-colors ${
                item.isCustom ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100'
              }`}>
                <div className="flex items-center gap-2">
                  {item.isCustom ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-tight">
                      <Info size={12} />
                      <span>مدخل شخصي</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-tight group-hover:bg-indigo-200 group-hover:text-indigo-800 transition-colors">
                      <BookOpen size={12} />
                      <span>محاضرة {item.lectureId}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold group-hover:text-indigo-600 transition-colors">
                   <span className="truncate max-w-[120px]">{item.lectureTitle}</span>
                   {!item.isCustom && <ExternalLink size={10} className="opacity-40" />}
                </div>
              </div>

              {/* Hover effect light flare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"></div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
            <div className="inline-flex p-8 bg-slate-50 rounded-full mb-6 border border-slate-100 shadow-sm">
              <Search size={48} className="text-slate-300" />
            </div>
            <h4 className="text-2xl font-bold text-slate-800 mb-2 academic-font">لم نجد أي تطابق</h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              عذراً، لم يتم العثور على مصطلحات تطابق بحثك الحالي "{searchTerm}". حاول استخدام كلمات مفتاحية أخرى.
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-8 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                تفريغ خانة البحث
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Decorative summary info */}
      <div className="flex justify-center pt-6">
        <div className="inline-flex items-center gap-6 px-8 py-3 bg-white border border-slate-100 rounded-full shadow-sm text-xs font-bold text-slate-500">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
             <span>إجمالي المصطلحات: {allTerms.length}</span>
           </div>
           <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             <span>مدخلاتك الخاصة: {customTerms.length}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
