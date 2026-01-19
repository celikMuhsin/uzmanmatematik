// carpanlara_ayirma.js - V13.0 (Hız Hesaplama, Kompakt Header, Mobil Düzen)

const SoruMotoru = {
    gecmisSorular: new Set(),

    random: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    karistir: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    temizlePolinom: function (metin) {
        return metin
            .replace(/([+\-])\s1x/g, '$1 x') // + 1x -> + x
            .replace(/^1x/g, 'x') // 1x başta -> x
            .replace(/\s+/g, ' ') // fazla boşlukları sil
            .replace(/\s\.\s/g, '')
            .replace(/\s·\s/g, '')
            .replace(/\(x/g, '(x')
            .replace(/x\^1/g, 'x');
    },

    // --- SORU TİPİ: Seviye 1 ---
    uretSeviye1: function () {
        const zar = Math.random();
        if (zar > 0.5) {
            const katsayi = this.random(2, 5);
            const kok = this.random(2, 5);
            const isaret = Math.random() > 0.5 ? '-' : '+';
            const sabit = katsayi * kok;
            const hamDogru = `${katsayi}(x ${isaret} ${kok})`;
            const hamYanlislar = [
                `${katsayi}(x ${isaret === '-' ? '+' : '-'} ${kok})`,
                `${katsayi}x ${isaret} ${kok}`,
                `${katsayi}(x ${isaret} ${kok * katsayi})`,
                `${kok}(x ${isaret} ${katsayi})`
            ];
            return {
                metin: `${katsayi}x ${isaret} ${sabit} ifadesinin çarpanlarına ayrılmış hali hangisidir?`,
                siklar: this.hazirlaSiklar(hamDogru, hamYanlislar),
                ipucu: "Her iki terimde de ortak olan bir sayı var mı? Onu parantez dışına çek."
            };
        } else {
            const n = this.random(2, 9);
            const kare = n * n;
            const hamDogru = `(x - ${n})(x + ${n})`;
            const hamYanlislar = [
                `(x - ${n})²`, `(x + ${n})²`, `(x - ${kare})(x + 1)`, `(x - ${n / 2})(x + ${n / 2})`
            ];
            return {
                metin: `x² - ${kare} ifadesinin çarpanlarına ayrılmış hali hangisidir?`,
                siklar: this.hazirlaSiklar(hamDogru, hamYanlislar),
                ipucu: "İki kare farkı özdeşliğini hatırla: a² - b² = (a-b)(a+b)"
            };
        }
    },

    // --- SORU TİPİ: Seviye 2 (Temel Özdeşlikler) ---
    uretSeviye2: function () {
        const zar = Math.random();
        const n = this.random(2, 10);

        if (zar > 0.5) {
            // İki Kare Farkı: x^2 - a^2
            const kare = n * n;
            const hamDogru = `(x - ${n})(x + ${n})`;
            const hamYanlislar = [
                `(x - ${n})²`,
                `(x + ${n})²`,
                `(x - ${n})(x - ${n})`,
                `(x + ${kare})(x - 1)`
            ];
            return {
                metin: `x² - ${kare} ifadesinin çarpanlarına ayrılmış hali nedir?`,
                siklar: this.hazirlaSiklar(hamDogru, hamYanlislar),
                ipucu: "İki kare farkı: x² - a² = (x-a)(x+a)"
            };
        } else {
            // Tam Kare: (x ± a)^2 -> x^2 ± 2ax + a^2
            const isaret = Math.random() > 0.5 ? '+' : '-';
            const katsayi = 2 * n;
            const kare = n * n;
            const hamDogru = `(x ${isaret} ${n})²`;
            const hamYanlislar = [
                `(x ${isaret === '+' ? '-' : '+'} ${n})²`,
                `(x ${isaret} ${n})(x ${isaret === '+' ? '-' : '+'} ${n})`,
                `(x ${isaret} ${kare})²`,
                `x² ${isaret} ${n}x + ${kare}`
            ];
            return {
                metin: `x² ${isaret} ${katsayi}x + ${kare} ifadesinin çarpanlarına ayrılmış hali hangisidir?`,
                siklar: this.hazirlaSiklar(hamDogru, hamYanlislar),
                ipucu: "Bu bir tam kare özdeşliğidir. Birincinin karesi, çarpımlarının 2 katı..."
            };
        }
    },

    // --- SORU TİPİ: Seviye 3 (Üç Terimli İfadeler) ---
    uretSeviye3: function () {
        // x^2 + bx + c -> (x+m)(x+n)
        let m, n;
        do {
            m = this.random(-6, 6);
            n = this.random(-6, 6);
        } while (m === 0 || n === 0);

        const b = m + n;
        const c = m * n;

        // Gösterim düzenleme: + - işaretleri
        const bYazi = b === 0 ? '' : (b > 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`);
        const cYazi = c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;

        // Doğru ve Yanlış Şıklar
        const hamDogru = `(x ${m > 0 ? '+' : '-'} ${Math.abs(m)})(x ${n > 0 ? '+' : '-'} ${Math.abs(n)})`;

        // Yanlışları üretirken işaretleri veya sayıları değiştir
        const hamYanlislar = [
            `(x ${m > 0 ? '-' : '+'} ${Math.abs(m)})(x ${n > 0 ? '-' : '+'} ${Math.abs(n)})`, // Ters işaret
            `(x ${m > 0 ? '+' : '-'} ${Math.abs(m)})(x ${n > 0 ? '-' : '+'} ${Math.abs(n)})`, // Bir ters
            `(x ${m > 0 ? '+' : '-'} ${Math.abs(m) + 1})(x ${n > 0 ? '+' : '-'} ${Math.abs(n)})`, // Sayı değiş
            `(x ${m > 0 ? '+' : '-'} ${Math.abs(n)})(x ${n > 0 ? '+' : '-'} ${Math.abs(m)})`  // Yer değiş (eğer m!=n ise işe yarar)
        ];

        // Gösterimde x^2 + 0x + c -> x^2 + c (olmamalı, while ile engellenebilir ama m+n=0 ise iki kare farkına döner, olsun sorun değil)
        let soruMetni = `x² ${bYazi} ${cYazi}`;
        if (b === 0) soruMetni = `x² ${cYazi}`; // İki kare farkı formatı olabilir ama seviye 3 kapsamında

        return {
            metin: `${soruMetni} ifadesinin çarpanlarına ayrılmış hali hangisidir?`,
            siklar: this.hazirlaSiklar(hamDogru, hamYanlislar),
            ipucu: "Çarpımları sabit sayıyı (c), toplamları ortadaki katsayıyı (b) veren iki sayı bul."
        };
    },

    // --- SORU TİPİ: Seviye 5 (Küp Açılımları) ---
    uretSeviye5: function () {
        const zar = Math.random();
        const a = this.random(1, 5);
        const kup = a * a * a;

        if (zar > 0.5) {
            // İki Küp Farkı: x^3 - a^3
            const hamDogru = `(x - ${a})(x² + ${a}x + ${a * a})`;
            const hamYanlislar = [
                `(x - ${a})(x² - ${a}x + ${a * a})`,
                `(x + ${a})(x² - ${a}x + ${a * a})`,
                `(x - ${a})³`,
                `(x - ${a})(x² + ${2 * a}x + ${a * a})`
            ];
            return {
                metin: `x³ - ${kup} ifadesinin açılımı hangisidir?`,
                siklar: this.hazirlaSiklar(hamDogru, hamYanlislar),
                ipucu: "İki küp farkı: a³ - b³ = (a-b)(a² + ab + b²)"
            };
        } else {
            // İki Küp Toplamı: x^3 + a^3
            const hamDogru = `(x + ${a})(x² - ${a}x + ${a * a})`;
            const hamYanlislar = [
                `(x + ${a})(x² + ${a}x + ${a * a})`,
                `(x - ${a})(x² + ${a}x + ${a * a})`,
                `(x + ${a})³`,
                `(x + ${a})(x² - ${2 * a}x + ${a * a})`
            ];
            return {
                metin: `x³ + ${kup} ifadesinin açılımı hangisidir?`,
                siklar: this.hazirlaSiklar(hamDogru, hamYanlislar),
                ipucu: "İki küp toplamı: a³ + b³ = (a+b)(a² - ab + b²)"
            };
        }
    },

    // --- SORU TİPİ 1: Sophie Germain ---
    uretSophieGermain: function () {
        const n = this.random(1, 2);
        const sabit = 4 * Math.pow(n, 4);
        const hamDogru = `(x² - ${2 * n}x + ${2 * n * n})(x² + ${2 * n}x + ${2 * n * n})`;
        const hamYanlislar = [
            `(x² + ${2 * n}x - ${2 * n * n})(x² - ${2 * n}x - ${2 * n * n})`,
            `(x² + ${n}x + ${2 * n * n})(x² - ${n}x + ${2 * n * n})`,
            `(x² + ${4 * n})²`, `(x⁴ + ${sabit / 2})(x⁴ + 2)`
        ];
        return {
            metin: `x⁴ + ${sabit} ifadesinin çarpanlarına ayrılmış hali hangisidir?`,
            siklar: this.hazirlaSiklar(hamDogru, hamYanlislar),
            ipucu: "Bu ifade Sophie Germain özdeşliğidir (a⁴ + 4b⁴). Terim ekleyip (tam kareye tamamlayıp) tekrar çıkarmayı dene."
        };
    },

    // --- SORU TİPİ 2: Değişken Değiştirme ---
    uretDegiskenDegistirme: function () {
        const val = 64;
        const hamDogru = `(x - 2)(x + 2)(x² + 2x + 4)(x² - 2x + 4)`;
        const hamYanlislar = [
            `(x - 2)³(x + 2)³`, `(x² - 4)(x⁴ - 4x² + 16)`,
            `(x - 4)(x + 4)(x⁴ + 16)`, `(x³ - 4)(x³ + 16)`
        ];
        return {
            metin: `x⁶ - ${val} ifadesinin çarpanlarına ayrılmış hali hangisidir?`,
            siklar: this.hazirlaSiklar(hamDogru, hamYanlislar),
            ipucu: "x⁶ ifadesini (x³)² olarak düşün. Önce iki kare farkını uygula, çıkan sonuçları küp açılımına göre tekrar ayır."
        };
    },

    hazirlaSiklar: function (dogru, yanlislar) {
        const temizDogru = this.temizlePolinom(dogru);
        const temizYanlislar = yanlislar.map(y => this.temizlePolinom(y));
        let siklar = temizYanlislar.map(text => ({ text, dogruMu: false }));
        siklar.push({ text: temizDogru, dogruMu: true });
        return this.karistir(siklar);
    },

    soruUret: function (seviye) {
        let soruData;
        let deneme = 0;
        if (seviye == 1) {
            do {
                soruData = this.uretSeviye1();
                deneme++;
            } while (this.gecmisSorular.has(soruData.metin) && deneme < 10);
        } else if (seviye == 2) {
            do {
                soruData = this.uretSeviye2();
                deneme++;
            } while (this.gecmisSorular.has(soruData.metin) && deneme < 10);
        } else if (seviye == 3) {
            do {
                soruData = this.uretSeviye3();
                deneme++;
            } while (this.gecmisSorular.has(soruData.metin) && deneme < 10);
        } else if (seviye == 4) {
            do {
                const zar = Math.random();
                if (zar > 0.5) soruData = this.uretSophieGermain();
                else soruData = this.uretDegiskenDegistirme();
                deneme++;
            } while (this.gecmisSorular.has(soruData.metin) && deneme < 10);
        } else if (seviye == 5) {
            do {
                soruData = this.uretSeviye5();
                deneme++;
            } while (this.gecmisSorular.has(soruData.metin) && deneme < 10);
        } else {
            return {
                metin: `Seviye ${seviye} soruları yapım aşamasında!`,
                siklar: [],
                ipucu: "..."
            };
        }
        if (deneme >= 10) this.gecmisSorular.clear();
        this.gecmisSorular.add(soruData.metin);
        // Durum izleme özellikleri ekle
        soruData.cozulduMu = false;
        soruData.secilenSikIndex = -1;
        return soruData;
    }
};

const Arayuz = {
    mevcutSeviye: 1, // Seviye 1 varsayılan oldu
    timer: 0,
    timerInterval: null,

    soruGecmisi: [],
    gecmisIndex: -1,
    dogruSayisi: 0,
    yanlisSayisi: 0,
    initialized: false,

    acilis: function () {
        const container = document.getElementById('math-exam-container');
        if (!container) return;

        if (!this.initialized) {
            this.stilEkle();
            container.innerHTML = this.getHtmlTemplate();
            this.initialized = true;
        }
        this.sifirlaVeBaslat();
    },

    durdur: function () {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = null;
    },

    getHtmlTemplate: function () {
        return `
            <div class="exam-card">
                <!-- Header: Sol(Zaman) - Orta(Hız) - Sağ(Puan) -->
                <div class="exam-header">
                    <div class="header-left">
                        <span id="exam-timer" class="timer-text">00:00</span>
                    </div>

                    <div class="header-center">
                        <span id="exam-speed" class="timer-text">
                        <span id="exam-speed" class="timer-text">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3,12 A9,9 0 1,1 21,12" /><line x1="12" y1="13" x2="19" y2="6" /><circle cx="12" cy="13" r="2" fill="currentColor" stroke="none"/></svg>
                            <span>0 <span class="speed-unit">so/sa</span></span>
                            <span class="speed-divider">|</span>
                            <span id="speed-correct" class="speed-metric speed-correct">0 <span class="speed-unit">do/sa</span></span>
                            <span class="speed-divider">|</span>
                            <span id="speed-wrong" class="speed-metric speed-wrong">0 <span class="speed-unit">ya/sa</span></span>
                        </span>
                    </div>
                    
                    <div class="header-right">
                         <div class="score-box score-wrong" id="wrong-box" style="display:none">0</div>
                         <div class="score-box score-correct" id="correct-box" style="display:none">0</div>
                    </div>
                </div>

                <!-- Soru Alanı -->
                <div id="soru-alani" class="question-area"></div>

                <!-- İpucu Metni -->
                <div id="ipucu-metni" class="hint-box" style="display:none;"></div>

                <!-- Footer Grid -->
                <div id="kontrol-paneli" class="control-panel">
                    <button onclick="Arayuz.oncekiSoru()" class="btn-action btn-secondary" id="btn-prev">
                        Geri
                    </button>

                    <button onclick="Arayuz.ipucuGoster()" class="btn-action btn-secondary btn-hint-trig">
                        İpucu
                    </button>

                    <div class="level-selector">
                        <select id="seviye-sec" onchange="Arayuz.seviyeDegistir(this.value)">
                            <option value="1" selected>Seviye 1</option>
                            <option value="2">Seviye 2</option>
                            <option value="3">Seviye 3</option>
                            <option value="4">Seviye 4</option>
                            <option value="5">Seviye 5</option>
                        </select>
                    </div>

                    <button onclick="Arayuz.sonrakiSoru()" class="btn-action btn-primary" id="btn-next">
                        İleri
                    </button>
                </div>
            </div>
        `;
    },

    sifirlaVeBaslat: function () {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer = 0;

        const tEl = document.getElementById('exam-timer');
        if (tEl) tEl.innerText = "00:00";

        const sEl = document.getElementById('exam-speed');
        if (sEl) {
            // Reset main speed icon/text only if needed, but here we just ensure structure is clean or reset values
            // Actually, we can just reset the inner values effectively by targeting IDs if we reconstructed it,
            // but since previous code replaced innerHTML, let's stick to that pattern for consistency, keeping the structured HTML.
            sEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3,12 A9,9 0 1,1 21,12" /><line x1="12" y1="13" x2="19" y2="6" /><circle cx="12" cy="13" r="2" fill="currentColor" stroke="none"/></svg> 
             <span>0 <span class="speed-unit">so/sa</span></span>
             <span class="speed-divider">|</span>
             <span id="speed-correct" class="speed-metric speed-correct">0 <span class="speed-unit">do/sa</span></span>
             <span class="speed-divider">|</span>
             <span id="speed-wrong" class="speed-metric speed-wrong">0 <span class="speed-unit">ya/sa</span></span>`;
        }

        this.dogruSayisi = 0;
        this.yanlisSayisi = 0;
        this.guncelleIstatistikUI();

        this.soruGecmisi = [];
        this.gecmisIndex = -1;
        SoruMotoru.gecmisSorular.clear();

        this.sonrakiSoru();

        this.timerInterval = setInterval(() => {
            this.timer++;

            // Timer Güncelle
            const dk = Math.floor(this.timer / 60).toString().padStart(2, '0');
            const sn = (this.timer % 60).toString().padStart(2, '0');
            const el = document.getElementById('exam-timer');
            if (el) el.innerText = `${dk}:${sn}`;

            // Hızlar
            const tamamlanan = this.gecmisIndex;
            let speed = 0;
            let dogruHiz = 0;
            let yanlisHiz = 0;

            if (this.timer > 0) {
                if (tamamlanan > 0) speed = Math.round((tamamlanan / this.timer) * 3600);
                if (this.dogruSayisi > 0) dogruHiz = Math.round((this.dogruSayisi / this.timer) * 3600);
                if (this.yanlisSayisi > 0) yanlisHiz = Math.round((this.yanlisSayisi / this.timer) * 3600);
            }

            const spEl = document.getElementById('exam-speed');
            // Re-render entire block to keep it synced
            if (spEl) spEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3,12 A9,9 0 1,1 21,12" /><line x1="12" y1="13" x2="19" y2="6" /><circle cx="12" cy="13" r="2" fill="currentColor" stroke="none"/></svg> 
            <span>${speed} <span class="speed-unit">so/sa</span></span>
            <span class="speed-divider">|</span>
            <span class="speed-metric speed-correct">${dogruHiz} <span class="speed-unit">do/sa</span></span>
            <span class="speed-divider">|</span>
            <span class="speed-metric speed-wrong">${yanlisHiz} <span class="speed-unit">ya/sa</span></span>`;

        }, 1000);
    },

    guncelleIstatistikUI: function () {
        const cBox = document.getElementById('correct-box');
        const wBox = document.getElementById('wrong-box');

        if (cBox) {
            cBox.innerText = this.dogruSayisi;
            cBox.style.display = this.dogruSayisi > 0 ? 'flex' : 'none';
        }

        if (wBox) {
            wBox.innerText = this.yanlisSayisi;
            wBox.style.display = this.yanlisSayisi > 0 ? 'flex' : 'none';
        }
    },

    seviyeDegistir: function (yeniSeviye) {
        this.mevcutSeviye = yeniSeviye;
        this.sifirlaVeBaslat();
    },

    sonrakiSoru: function () {
        if (this.gecmisIndex < this.soruGecmisi.length - 1) {
            this.gecmisIndex++;
            this.renderSoru(this.soruGecmisi[this.gecmisIndex]);
        } else {
            const yeniData = SoruMotoru.soruUret(this.mevcutSeviye);
            this.soruGecmisi.push(yeniData);
            this.gecmisIndex++;
            this.renderSoru(yeniData);
        }
        this.butonDurumlariniGuncelle();
    },

    oncekiSoru: function () {
        if (this.gecmisIndex > 0) {
            this.gecmisIndex--;
            this.renderSoru(this.soruGecmisi[this.gecmisIndex]);
            this.butonDurumlariniGuncelle();
        }
    },

    butonDurumlariniGuncelle: function () {
        const btnPrev = document.getElementById('btn-prev');
        if (btnPrev) {
            btnPrev.disabled = (this.gecmisIndex <= 0);
            btnPrev.style.opacity = (this.gecmisIndex <= 0) ? '0.5' : '1';
        }
    },

    renderSoru: function (soruData) {
        const alan = document.getElementById('soru-alani');
        const ipucuKutu = document.getElementById('ipucu-metni');
        if (ipucuKutu) ipucuKutu.style.display = 'none';

        if (soruData.siklar.length === 0) {
            alan.innerHTML = `<div class="math-text">${soruData.metin}</div>`;
            return;
        }

        const soruNo = this.gecmisIndex + 1;
        let html = `<div class="math-text"><span class="question-prefix">Soru ${soruNo}) </span>${soruData.metin}</div><div class="options-grid">`;

        soruData.siklar.forEach((sik, i) => {
            const harf = ["A)", "B)", "C)", "D)", "E)"][i];

            // Geçmişten gelen cevap kontrolü
            let ekSinif = '';
            let disabledAtt = soruData.cozulduMu ? 'disabled' : '';

            if (soruData.cozulduMu) {
                // Seçilen şıkkı işaretle
                if (i === soruData.secilenSikIndex) {
                    ekSinif = sik.dogruMu ? 'correct' : 'wrong';
                }
                if (sik.dogruMu) {
                    ekSinif += ' correct';
                }
            }

            html += `<button class="option-btn ${ekSinif}" onclick="Arayuz.kontrolEt(this, ${i}, ${sik.dogruMu})" ${disabledAtt}>
                <span class="option-label">${harf}</span>
                <span>${sik.text}</span>
            </button>`;
        });
        html += `</div>`;
        alan.innerHTML = html;
        this.aktifIpucu = soruData.ipucu;
    },

    kontrolEt: function (btn, index, dogruMu) {
        const guncelSoru = this.soruGecmisi[this.gecmisIndex];
        if (guncelSoru.cozulduMu) return;

        guncelSoru.cozulduMu = true;
        guncelSoru.secilenSikIndex = index;

        const butonlar = document.querySelectorAll('.option-btn');
        butonlar.forEach(b => b.disabled = true);

        if (dogruMu) {
            btn.classList.add('correct');
            this.dogruSayisi++;
        } else {
            btn.classList.add('wrong');
            this.yanlisSayisi++;
            // Doğru olanı bul ve yak
            butonlar.forEach((b, k) => {
                const sData = guncelSoru.siklar[k];
                if (sData.dogruMu) b.classList.add('correct');
            });
        }
        this.guncelleIstatistikUI();
    },

    ipucuGoster: function () {
        const kutu = document.getElementById('ipucu-metni');
        if (this.aktifIpucu) {
            kutu.innerHTML = this.aktifIpucu;
            kutu.style.display = 'block';
        }
    },

    stilEkle: function () {
        const style = document.createElement('style');
        style.innerHTML = `
            .exam-card { 
                background: white; 
                border-radius: 12px; 
                border: 1px solid #f3f4f6;
                box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
                max-width: 600px; 
                margin: 0 auto; 
                font-family: 'Inter', system-ui, sans-serif;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            /* --- HEADER (Kompakt ve Gri) --- */
            .exam-header {
                display: flex;
                justify-content: space-between; /* 3 Elemanı Yay */
                align-items: center;
                padding: 10px 15px;
                background: #fff;
                border-bottom: 1px solid #f3f4f6;
                height: 40px; 
                margin-bottom: 0;
            }
            
            /* Sol ve Sağ için sabit genişlik verilebilir veya flex ile dengelenebilir */
            .header-left, .header-right { 
                flex: 1; 
                display: flex; 
                align-items: center;
            }
            .header-right { justify-content: flex-end; gap: 6px; }

            .header-center {
                flex: 2;
                display: flex;
                justify-content: center;
            }

            .timer-text {
                font-size: 0.85rem; /* Standart boyut - Hepsi eşit */
                font-weight: 500;
                color: #6b7280;
                letter-spacing: 0.5px;
                font-variant-numeric: tabular-nums;
                display: flex;
                align-items: center;
                gap: 3px; 
            }

            .timer-text svg {
                position: relative;
                top: 2.5px; /* İkonu görsel olarak aşağı it */
            }
            
            .speed-unit {
                font-size: 0.7em; 
                opacity: 0.85;
                font-weight: 700;
                margin-left: 1px;
            }

            .speed-divider {
                color: #e5e7eb;
                margin: 0 3px; /* Daha havadar */
                font-size: 1.1em;
                font-weight: 300;
            }

            .speed-metric {
                font-size: 1em; /* Ana metinle aynı boyutta */
                display: flex;
                align-items: baseline;
            }

            .speed-correct { color: #22c55e; } /* Açık Yeşil (green-500) */
            .speed-wrong { color: #ef4444; } /* Açık Kırmızı (red-500) */

            /* --- RESPONSIVE HEADER DÜZENLEMESİ --- */
            @media (max-width: 480px) {
                .exam-header {
                    padding: 8px 10px;
                    gap: 5px;
                }
                .timer-text {
                    font-size: 0.8rem; /* Mobilde daha küçük */
                    gap: 3px;
                }
                .speed-unit {
                    font-size: 0.7em; /* Birimler daha da küçük */
                }
                .speed-divider {
                    margin: 0 2px; /* Ayıraçları sıkıştır */
                }
                .score-box {
                    padding: 2px 6px;
                    min-width: 20px;
                    font-size: 0.75rem;
                }
            }

            .score-box {
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                min-width: 24px;
            }

            .score-correct { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
            .score-wrong { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

            /* --- CONTENT --- */
            .question-area { 
                padding: 5px 15px 20px 15px; 
                flex: 1;
            }

            .math-text { 
                font-size: 0.95rem; 
                color: #000; 
                margin-bottom: 20px; 
                font-weight: 400; 
                text-align: left; 
                line-height: 1.5;
            }

            .question-prefix { font-weight: 800; color: #000; margin-right: 5px; }

            .options-grid { display: flex; flex-direction: column; gap: 8px; }

            .option-btn { 
                padding: 12px 14px; 
                border: 1px solid #e5e7eb; 
                border-radius: 8px; 
                background: white; 
                text-align: left; 
                cursor: pointer; 
                font-size: 0.95rem; 
                color: #000;
                display: flex;
                align-items: center;
                width: 100%;
            }
            .option-btn:hover { background: #f9fafb; border-color: #d1d5db; }

            .option-label { font-weight: 800; margin-right: 10px; color: #000; min-width: 20px; }

            /* --- FOOTER (GRID) --- */
            .control-panel { 
                padding: 10px 10px; 
                background: #fff; 
                border-top: 1px solid #f3f4f6; 
                display: grid;
                grid-template-columns: 1fr 1fr 1.2fr 1fr;
                gap: 8px; 
                align-items: center;
            }

            .btn-action {
                padding: 10px 0;
                border-radius: 6px; 
                border: none;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 36px;
            }

            .level-selector select {
                width: 100%;
                height: 36px;
                padding: 0 4px;
                border-radius: 6px;
                border: 1px solid #d1d5db;
                background: #f9fafb;
                color: #374151;
                font-weight: 600;
                font-size: 0.85rem;
                outline: none;
                text-align: center;
            }

            .btn-secondary { background: #e5e7eb; color: #374151; }
            .btn-secondary:hover { background: #d1d5db; }

            .btn-primary { background: #2563eb; color: white; }
            .btn-primary:hover { background: #1d4ed8; }

            .hint-box { 
                background: #f0fdf4; 
                color: #166534; 
                padding: 10px; 
                margin: 0 15px 15px 15px; 
                border-radius: 8px; 
                font-size: 0.85rem; 
                text-align: center;
                border: 1px solid #dcfce7;
            }
            
            .correct { background: #dcfce7 !important; border-color: #86efac !important; }
            .wrong { background: #fee2e2 !important; border-color: #fca5a5 !important; }
        `;
        document.head.appendChild(style);
    }
};

window.SoruMotoru = SoruMotoru;
window.Arayuz = Arayuz;