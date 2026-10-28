# NOORUL QURAN (نور القرآن)
### Children's Quran Recitation & Memorization App (Arabic & Hausa)
### App ɗin Koyon Karatun Alƙur'ani da Hadda na Yara Masu Shekaru 6–10

---

## 🌟 Bayani Game da App ɗin (About the App)

NOORUL QURAN app ne da aka kera na musamman don yara masu shekaru 6 zuwa 10. Yana koya karatun Alƙur'ani da hadda cikin Larabci da Hausa ta hanyar:
1. **Koyon Alƙur'ani (Learn Quran)**: Karanta ayoyi da fassarar Hausa, ma'anar kalma-da-kalma, da bayanin Tajwidi.
2. **Saurara da Maimaitawa (Listen & Repeat)**: Karatun Sheikh Al-Husary da Sheikh Alafasy tare da rikodin muryar yaro.
3. **Haddar Surori (Memorization Games)**: Wasan jera kalmomin aya (Word Puzzle), boye kalmomi (Blank Recall), da gwajin hadda.
4. **Ci gaban Karatu (Learning Progress)**: Taurari, lambobin yabo (badges), da shaidar kammalawa (Certificate).
5. **Surorin da ke Ciki**: Suratul Fatiha, Al-Ikhlas, Al-Falaq, An-Nas, Al-Kawthar, da Al-Asr.
6. **Aiki Koda Ba Intanet (100% Offline Capable)**: An tsara shi da Progressive Web App (PWA) da CacheStorage.

---

## 📱 Yadda Zaka Sanya App ɗin a Wayarka ta Android Ba Tare da Biya Ko Kobo Ba
### (How to Run/Install on Android Phone 100% Free - No Google Cloud Billing)

### HANYA TA 1: Sanyawa ta Shafukan Kyauta (Vercel, Netlify, ko GitHub Pages) - Mafi Sauƙi! ⭐⭐⭐⭐⭐
Wannan ita ce hanya mafi sauƙi da ba ta buƙatar katin banki ko kobo:

1. **Ta Vercel (Kyauta 100%)**:
   - Buɗe [vercel.com](https://vercel.com) a wayarka ko kwamfuta (kayi rajista da asusunka na Google/GitHub).
   - Danna **"Add New Project"** sannan ka loda (upload) wannan folda ta Noorul Quran.
   - Vercel zai baka link kyauta kamar haka: `https://noorul-quran.vercel.app`.
   - Buɗe wannan link a **Google Chrome** a wayarka ta Android.
   - Danna **"Sauke App"** ko digo uku (⋮) na Chrome sannan ka zaɓi **"Install app" (Sanya a fuskar waya)**.
   - Shi ke nan! App zai zama kamar manhajar waya ta asali kuma yana aiki ba tare da intanet ba.

2. **Ta Netlify Drop (Kawai Jefa Folda)**:
   - Buɗe [app.netlify.com/drop](https://app.netlify.com/drop).
   - Jefa foldar `dist` a ciki.
   - Zai baka link nan take ba tare da yin rajista mai wahala ba!

---

### HANYA TA 2: Mayar da shi Manhajar APK ta Android (PWABuilder) ⭐⭐⭐⭐
Idan kana son samun fayil ɗin `.apk` don turawa wayoyi ta Bluetooth ko Xender:
1. Loda shafinka a Vercel ko Netlify (misali: `https://your-app.vercel.app`).
2. Shiga shafin kyauta na Microsoft: [PWABuilder.com](https://www.pwabuilder.com).
3. Sanya link ɗin app ɗinka sannan ka danna **Start**.
4. Danna **Package for Android** -> Zai baka fayil ɗin **Android APK** kai tsaye don sanyawa a kowace wayar Android!

---

### HANYA TA 3: Gudunar da shi Kai Tsaye a Wayar Android (Termux)
Idan kana son gudanar da shi a wayarka ba tare da wani uwar garke (server) ba:
1. Sauke manhajar **Termux** daga F-Droid ko GitHub (kyauta ce).
2. A cikin Termux, rubuta:
   ```bash
   pkg update && pkg install nodejs git
   ```
3. Shigar da foldar `noorul-quran` sannan ka rubuta:
   ```bash
   npm install
   npm run dev -- --host
   ```
4. Buɗe Chrome a wayarka ka shiga `http://localhost:5173`.
5. Danna "Install app" don sanyawa a waya!

---

### HANYA TA 4: Gudunar da shi a Kwamfuta (Windows / Mac / Linux)
1. Cire fayilolin daga ZIP (Extract ZIP).
2. Buɗe Terminal ko Command Prompt a cikin foldar:
   ```bash
   npm install
   npm run dev
   ```
3. Buɗe browser a: `http://localhost:5173`.
4. Don gina fayilolin da ba sa buƙatar Node.js (Production Build):
   ```bash
   npm run build
   ```
   Fayilolin za su shiga cikin foldar `dist/`.

---

## 📜 Lasisi da Albarka (License)
NOORUL QURAN an yi shi ne don hidima ga Alƙur'ani mai girma da yaran al'ummar Musulmi. Kyauta ne ga kowa!
