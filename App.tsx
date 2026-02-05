import React, { useState } from 'react';
import { AppView } from './types';  // تأكد من وجود ملف types.ts أو types/index.ts يحتوي على enum AppView
import { Layout } from './components/layout';  // تأكد من أن الملف هو layout.tsx (حرف صغير)
import { ChatView } from './components/ChatView';  // تأكد من وجود ChatView.tsx
import { LecturesView } from './components/LecturesView';  // تأكد من وجود LecturesView.tsx
import { MeasurementView } from './components/MeasurementView';  // تأكد من وجود MeasurementView.tsx
import { QuizView } from './components/QuizView';  // تأكد من وجود QuizView.tsx
import { GlossaryView } from './components/GlossaryView';  // تأكد من وجود GlossaryView.tsx
import { GamesView } from './components/GamesView';  // تأكد من وجود GamesView.tsx

// المكون الرئيسي للتطبيق
const App: React.FC = () => {
  // حالة لإدارة العرض النشط (افتراضيًا: CHAT)
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);

  // دالة لعرض المكون المناسب بناءً على activeView
  const renderView = () => {
    switch (activeView) {
      case AppView.CHAT:
        return <ChatView />;
      case AppView.LECTURES:
        return <LecturesView />;
      case AppView.MEASUREMENT:
        return <MeasurementView />;
      case AppView.QUIZ:
        return <QuizView />;
      case AppView.GLOSSARY:
        return <GlossaryView />;
      case AppView.GAMES:
        return <GamesView />;
      default:
        return <ChatView />;  // العودة إلى الافتراضي إذا حدث خطأ
    }
  };

  return (
    // استخدام Layout كحاوية رئيسية، مع تمرير activeView و setActiveView
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </Layout>
  );
};

export default App;
