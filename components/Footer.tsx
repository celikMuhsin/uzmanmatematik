
import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <h3 className="text-white text-xl font-bold flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
             </div>
             UzmanMatematik
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            En güncel teknolojilerle donatılmış, öğrenci odaklı eğitim platformu. Geleceğin başarısını bugünden inşa ediyoruz.
          </p>
          <div className="flex space-x-4">
            <Facebook size={20} className="hover:text-indigo-400 cursor-pointer" />
            <Twitter size={20} className="hover:text-indigo-400 cursor-pointer" />
            <Instagram size={20} className="hover:text-indigo-400 cursor-pointer" />
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Hızlı Bağlantılar</h4>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Ana Sayfa</li>
            <li className="hover:text-white cursor-pointer transition-colors">Ders Programı</li>
            <li className="hover:text-white cursor-pointer transition-colors">Sıkça Sorulan Sorular</li>
            <li className="hover:text-white cursor-pointer transition-colors">Gizlilik Politikası</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">İletişim Bilgileri</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-indigo-500 flex-shrink-0" />
              <span>Ankara Teknoloji Vadisi, Blok B, No: 42</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-indigo-500" />
              <span>+90 (212) 555 01 01</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-indigo-500" />
              <span>info@uzmanmatematik.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Bültene Katılın</h4>
          <p className="text-sm mb-4 text-slate-400">Yeniliklerden ve sınavlardan haberdar olun.</p>
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <input 
              type="email" 
              placeholder="E-posta adresi"
              className="bg-transparent border-none focus:ring-0 text-sm flex-grow px-3 text-white"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-bold transition-all">
              Kaydol
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} UzmanMatematik. Tüm hakları saklıdır.
      </div>
    </footer>
  );
};

export default Footer;
