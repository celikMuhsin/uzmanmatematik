
import { Lesson, Question } from './types';

export const LESSONS: Lesson[] = [
  {
    id: 'mat1',
    name: 'Matematik 1',
    topics: [
      { id: 't1', name: 'Sayılar', content: 'Sayılar konusu detayları...' },
      { id: 't2', name: 'Fonksiyonlar', content: 'Fonksiyonlar konusu detayları...' },
      { id: 't3', name: 'Polinomlar', content: 'Polinomlar konusu detayları...' },
    ]
  },
  {
    id: 'mat2',
    name: 'Geometri',
    topics: [
      { id: 't4', name: 'Üçgenler', content: 'Üçgenler konusu detayları...' },
      { id: 't5', name: 'Çember', content: 'Çember konusu detayları...' },
    ]
  },
  {
    id: 'fiz1',
    name: 'Fizik',
    topics: [
      { id: 't6', name: 'Vektörler', content: 'Vektörler konusu detayları...' },
      { id: 't7', name: 'Kuvvet ve Hareket', content: 'Kuvvet konusu detayları...' },
    ]
  }
];

// Added topicId: 't1' to fix the missing property error
export const MOCK_QUESTIONS: Question[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  topicId: 't1',
  text: `Soru ${i + 1}: Aşağıdaki ifadenin sonucunu bulunuz. $$ f(x) = \\int_{0}^{\\infty} e^{-x^2} dx $$ ise sonucun karesi nedir?`,
  options: [
    `$$ \\frac{\\pi}{2} $$`,
    `$$ \\sqrt{\\pi} $$`,
    `$$ \\pi $$`,
    `0`,
    `1`
  ],
  correctAnswer: 2,
  hint: i % 3 === 0 ? { text: "İpucu: Gauss integrali formülünü hatırlayınız." } : undefined
}));

export const SLIDER_ITEMS = [
  {
    image: 'https://picsum.photos/seed/edu1/1200/400',
    title: 'Yeni Nesil Sınav Sistemine Hoş Geldiniz',
    description: 'En güncel matematik ve fen bilimleri soruları ile kendinizi test edin.'
  },
  {
    image: 'https://picsum.photos/seed/edu2/1200/400',
    title: 'LaTeX Desteği ile Karmaşık Formüller',
    description: 'Soruları okurken gözünüz yorulmasın, matematiksel ifadeler en net haliyle ekranınızda.'
  },
  {
    image: 'https://picsum.photos/seed/edu3/1200/400',
    title: 'Hız ve Başarı Analizi',
    description: 'Çözdüğünüz testlerin ardından puanınızı ve sürenizi görün, kendinizi geliştirin.'
  }
];