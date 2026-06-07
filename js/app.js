import { DATA } from './data.js?v=__BUILD_HASH__';
import { CATS } from './cats.js?v=__BUILD_HASH__';
import { SELFDUA } from './selfdua.js?v=__BUILD_HASH__';

// Build identifier — replaced with the git hash at deploy time (see build.mjs).
const BUILD_HASH = '__BUILD_HASH__';

// Vue is provided as a global by js/vendor/vue.global.prod.js (loaded before this module)
const { createApp } = Vue;

createApp({
  data(){ return {
    gender:'m', name:'', father:'', scale:1, activeTab:'duaa', now:Date.now(),
    duaaMode:'mayyit', // 'mayyit' = الدعاء للميت | 'self' = الدعاء لنفسك
    duaaIndex:0, showSettings:false, showIndex:false,
    dark:false, wake:false, wakeSupported:('wakeLock' in navigator),
    playing:false, speed:9, playTimer:null, version:'1.1',
    canInstall:false,
    buildHash:BUILD_HASH, updateReady:false, checkingUpdate:false, upToDate:false, offlineReady:false,
    selectedCats:[],
    catList:[{key:'child',title:'الطفل / الصغير',badge:'مأثور'},{key:'parents',title:'الوالدان',badge:'مأثور'},{key:'ill',title:'مريض / مبتلى (السرطان)',badge:'دعاء عام'},{key:'martyr',title:'الشهيد (الأصناف الخمسة)',badge:'دعاء عام'}],
    showWizard:false, wizardStep:0,
    wizardSteps:[
      {icon:'🤲',title:'أهلاً بك',body:'تطبيقٌ لأدعية العمرة: تدعو به <b>للميّت</b> أو <b>لِنَفْسك</b>، مع مناسك الطواف والسعي والأذكار. كل شيء يعمل دون إنترنت ويُحفظ تلقائياً. هذه جولة سريعة.'},
      {icon:'📖',title:'تبويب الدعاء',body:'كل دعاء في شريحة مستقلّة. مرِّر لأعلى/أسفل للتنقّل، أو استخدم أسهم لوحة المفاتيح ومفتاح المسافة على الحاسوب.'},
      {icon:'⚙️',title:'الإعدادات',body:'من الزرّ ⚙ أعلى اليسار: اختر <b>«لِمَن تدعو؟»</b> (للميّت / لِنَفْسي)، وفي وضع الميّت بدِّل الصيغة (مذكّر/مؤنّث/جمع) وأدخل اسم المتوفّى، وفعِّل الوضع الليلي، واضبط سرعة التشغيل التلقائي.'},
      {icon:'🏷️',title:'محاور وتصنيفات الأدعية',body:'في وضع <b>«للميّت»</b> أضِف من الإعدادات أدعيةً حسب حاله (طفل، والدان، مريض، شهيد) تُلحق بعد الدعاء الأساسي. وفي وضع <b>«لِنَفْسي»</b> تجد سبعة محاور جامعة (الثبات، اليقين، المحبة، المغفرة، الرزق، الوالدان، القبول). وكلٌّ موسومٌ (مأثور / دعاء عام).'},
      {icon:'🛠️',title:'شريط الأدوات',body:'أسفل تبويب الدعاء: 📑 الفهرس للقفز إلى أي دعاء، و▶ التشغيل التلقائي، و − / + لتكبير وتصغير الخط، و ⤢ لملء الشاشة.'},
      {icon:'🕋',title:'الطواف والسعي',body:'عدّاد لكلٍّ منهما (٧ أشواط) مع مؤقّت يحسب الوقت الكلّي وزمن كل شوط، إضافةً إلى دعاء البداية والأدعية المستحبّة.'},
      {icon:'📿',title:'أدعية وتسبيح',body:'تبويب «أدعية» فيه التلبية ودخول المسجد الحرام وماء زمزم وغيرها. وتبويب «تسبيح» عدّاد أذكار مع أهداف (٣٣ / ١٠٠).'},
      {icon:'🖨️',title:'الطباعة و PDF',body:'من الإعدادات زرّ «طباعة / PDF» يُخرج الدعاء كاملاً باسم المتوفّى؛ اختر «حفظ كـ PDF» لمشاركته مع الآخرين.'},
      {icon:'💾',title:'الحفظ التلقائي',body:'كل اختياراتك (الصيغة، الاسم، حجم الخط، العدّادات، آخر موضع) تُحفظ تلقائياً وتبقى عند إعادة فتح الملف على المتصفّح نفسه.'},
      {icon:'⚖️',title:'تبويب الحقوق',body:'تبويب «حقوق» يبيّن أن العمل وقفٌ لكل مسلم صدقةً جارية، ويذكر معلومات الدعاء والبرمجة والتواصل ورقم الإصدار.'},
      {icon:'✅',title:'جاهز',body:'يمكنك إعادة فتح هذا الشرح في أي وقت من زرّ «؟ شرح التطبيق» داخل الإعدادات. تقبّل الله منك صالح الأعمال.'}
    ],
    people:[],
    C:{ tawaf:{count:0,laps:[],running:false,startEpoch:null,acc:0,lapAcc:0},
        saee:{count:0,laps:[],running:false,startEpoch:null,acc:0,lapAcc:0} },
    azkar:[ {short:'سبحان الله',text:'سُبْحَانَ اللهِ',target:33},
            {short:'الحمد لله',text:'الْحَمْدُ لِلَّهِ',target:33},
            {short:'الله أكبر',text:'اللهُ أَكْبَرُ',target:33},
            {short:'لا إله إلا الله',text:'لَا إِلَهَ إِلَّا اللهُ',target:100},
            {short:'الاستغفار',text:'أَسْتَغْفِرُ اللهَ',target:100},
            {short:'حرّ',text:'تسبيح حرّ',target:0} ],
    zikrIdx:0,
    tasbih:{count:0,rounds:0}
  };},
  computed:{
    fullName(){ if(this.gender==='p') return ''; const n=this.name.trim(); if(!n) return ''; const f=this.father.trim();
      if(!f) return n; return n+(this.gender==='m'?' بن ':' بنت ')+f; },
    slides(){ const out=[];
      if(this.duaaMode==='self'){
        out.push({cls:'title', inner:this.selfTitleHTML()});
        this.buildCatSlides(SELFDUA, out);
      } else {
        const base=DATA[this.gender];
        for(let i=0;i<base.length;i++){ const it=base[i];
          const inner=it.id==='title'?this.titleHTML():this.injectName(it.html,it.id);
          out.push({cls:it.cls||it.c,inner}); }
        this.buildCatSlides(this.selectedCats.map(k=>CATS[k]).filter(Boolean), out);
      }
      const n=out.length; return out.map((s,i)=>({cls:s.cls,inner:s.inner,num:i+1,total:n})); },
    progress(){ const n=this.slides.length||1; return Math.min(100,Math.round((this.duaaIndex+1)/n*100)); },
    printTitle(){ if(this.duaaMode==='self') return 'دُعَاءٌ لِنَفْسِي'; if(this.gender==='p') return 'دُعَاءٌ لِلْأَمْوَاتِ'; const fn=this.fullName; if(fn) return 'دُعَاءٌ لِـ'+(this.gender==='m'?'الْمَرْحُومِ':'الْمَرْحُومَةِ')+' '+fn;
      return this.gender==='m'?'دُعَاءُ الْمَيِّتِ':'دُعَاءُ الْمَيِّتَةِ'; },
    printItems(){ return this.slides.slice(1).map(s=>s.inner); },
    zikr(){ return this.azkar[this.zikrIdx]; },
    shortHash(){ const h=this.buildHash||''; return (h && h!=='__BUILD'+'_HASH__') ? h.slice(0,7) : 'dev'; }
  },
  watch:{
    duaaMode(v){ this.persist('duaaMode',v); this.duaaIndex=0; this.keepSlide(); },
    gender(v){ this.persist('duaaGender',v); this.keepSlide(); },
    name(){ this.persist('duaaName',this.name); this.keepSlide(); },
    father(){ this.persist('duaaFather',this.father); this.keepSlide(); },
    scale(v){ document.documentElement.style.setProperty('--scale',v); this.persist('duaaScale',v); },
    C:{deep:true,handler(v){ this.persist('hajjState',JSON.stringify(v)); }},
    activeTab(v){ this.persist('duaaTab',v); if(v!=='duaa') this.stopPlay(); },
    dark(v){ document.body.classList.toggle('dark',v); this.persist('duaaDark',v?'1':'0'); },
    wake(v){ this.persist('duaaWake',v?'1':'0'); if(v) this.reqWake(); else this.relWake(); },
    speed(v){ this.persist('duaaSpeed',v); if(this.playing){ this.stopPlay(); this.startPlay(); } },
    people:{deep:true,handler(v){ this.persist('duaaPeople',JSON.stringify(v)); }},
    tasbih:{deep:true,handler(v){ this.persist('tasbih',JSON.stringify(v)); }},
    zikrIdx(v){ this.persist('zikrIdx',v); },
    selectedCats:{deep:true,handler(v){ this.persist('selectedCats',JSON.stringify(v)); this.keepSlide(); }}
  },
  methods:{
    esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); },
    nm(){ return '<span class="name-hl">'+this.esc(this.fullName)+'</span>'; },
    injectName(html,id){ if(this.gender==='p'||!this.name.trim()) return html;
      if(id==='open') return this.gender==='m'?html.replace('اغْفِرْ لَهُ','اغْفِرْ لِـ'+this.nm()):html.replace('اغْفِرْ لَهَا','اغْفِرْ لِـ'+this.nm());
      if(id==='id1') return this.gender==='m'?html.replace('عَبْدَكَ فِي ذِمَّتِكَ','عَبْدَكَ '+this.nm()+' فِي ذِمَّتِكَ'):html.replace('أَمَتَكَ فِي ذِمَّتِكَ','أَمَتَكَ '+this.nm()+' فِي ذِمَّتِكَ');
      if(id==='id2') return this.gender==='m'?html.replace('هَذَا عَبْدُكَ','هَذَا عَبْدُكَ '+this.nm()):html.replace('هَذِهِ أَمَتُكَ','هَذِهِ أَمَتُكَ '+this.nm());
      return html; },
    titleHTML(){ if(this.gender==='p'){ return '<div class="big-title">دُعَاءُ الْأَمْوَاتِ</div><div class="sub">هَذَا دُعَاءٌ لِأَمْوَاتِ الْمُسْلِمِينَ<br>اللهم اغفر لهم وارحمهم</div>'; }
      const t=this.gender==='m'?'دُعَاءُ الْمَيِّتِ':'دُعَاءُ الْمَيِّتَةِ'; let h='<div class="big-title">'+t+'</div>';
      if(this.name.trim()) h+='<div class="sub">'+(this.gender==='m'?'لِلْمَرْحُومِ':'لِلْمَرْحُومَةِ')+': '+this.nm()+'</div>';
      else h+='<div class="sub">هَذَا دُعَاءُ '+(this.gender==='m'?'الْمَيِّتِ':'الْمَيِّتَةِ')+' كَامِلاً<br>لِمَنْ أَرَادَ الاِحْتِفَاظَ بِهِ</div>'; return h; },
    snippet(html){ const t=html.replace(/<[^>]+>/g,'').replace(/[\u064B-\u0652]/g,'').trim(); return t.length>42?t.slice(0,42)+'…':t; },
    ar(s){ return String(s).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]); },
    fmt(ms){ let t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60; const p=n=>(n<10?'0':'')+n; return this.ar(h>0?h+':'+p(m)+':'+p(s):m+':'+p(s)); },
    elapsed(k){ const st=this.C[k]; return st.acc+(st.running&&st.startEpoch?this.now-st.startEpoch:0); },
    curLap(k){ return Math.max(0,this.elapsed(k)-this.C[k].lapAcc); },
    inc(k){ const st=this.C[k]; if(st.count>=7) return; if(!st.running&&st.count===0&&st.acc===0){st.running=true;st.startEpoch=Date.now();}
      const e=this.elapsed(k); st.laps.push(Math.max(0,e-st.lapAcc)); st.lapAcc=e; st.count++;
      if(st.count>=7){st.acc=this.elapsed(k);st.running=false;st.startEpoch=null;} if(navigator.vibrate)navigator.vibrate(35); this.now=Date.now(); },
    dec(k){ const st=this.C[k]; if(st.count>0){st.count--; const last=st.laps.pop()||0; st.lapAcc=Math.max(0,st.lapAcc-last);
      if(!st.running&&st.count<7&&(st.acc>0||st.lapAcc>0)){st.running=true;st.startEpoch=Date.now();} this.now=Date.now();} },
    toggleTimer(k){ const st=this.C[k]; if(st.running){st.acc=this.elapsed(k);st.running=false;st.startEpoch=null;}else{st.running=true;st.startEpoch=Date.now();} this.now=Date.now(); },
    resetC(k){ this.C[k]={count:0,laps:[],running:false,startEpoch:null,acc:0,lapAcc:0}; this.now=Date.now(); },
    changeScale(d){ this.scale=Math.min(2.5,Math.max(0.5,Math.round((this.scale+d)*10)/10)); },
    setScale(v){ this.scale=v; },
    setGender(g){ this.gender=g; },
    setDuaaMode(m){ this.duaaMode=m; },
    // باني شرائح التصنيفات — مشترك بين دعاء الميت (CATS) ودعاء النفس (SELFDUA).
    buildCatSlides(list, out){
      for(const cat of list){ if(!cat) continue;
        out.push({cls:'catsep', inner:'<div class="cat-head"><div class="cat-badge '+(cat.badge==='مأثور'?'b-auth':'b-gen')+'">'+cat.badge+'</div><div class="cat-title">'+cat.title+'</div><div class="cat-note">'+cat.note+'</div></div>'});
        const items=cat.byGender ? (cat.items[this.gender]||cat.items.m) : cat.items;
        for(const h of items){ if(h&&typeof h==='object'&&h.sub){ out.push({cls:'catsub', inner:'<div class="cat-sub">'+h.sub+'</div>'}); continue; } const L=h.replace(/<[^>]+>/g,'').length; const cl=L<160?'s-lg':(L<300?'s-md':'s-sm'); out.push({cls:cl, inner:'<div class="dua">'+h+'</div>'}); } }
    },
    selfTitleHTML(){ return '<div class="big-title">دُعَاءٌ لِنَفْسِي</div><div class="sub">أَدْعِيَةٌ جَامِعَةٌ تَدْعُو بِهَا لِنَفْسِكَ<br>أَثْنَاءَ الطَّوَافِ وَالسَّعْيِ وَفِي كُلِّ حِينٍ</div>'; },
    nextStep(){ if(this.wizardStep < this.wizardSteps.length-1) this.wizardStep++; else this.finishWizard(); },
    finishWizard(){ this.showWizard=false; try{ localStorage.setItem('tutorialDone','1'); }catch(e){} },
    openWizard(){ this.wizardStep=0; this.showSettings=false; this.showWizard=true; },
    tap(){ this.tasbih.count++; if(navigator.vibrate)navigator.vibrate(20);
      const tg=this.zikr.target; if(tg>0 && this.tasbih.count>=tg){ this.tasbih.rounds++; this.tasbih.count=0; if(navigator.vibrate)navigator.vibrate([60,40,60]); } },
    resetTasbih(){ this.tasbih={count:0,rounds:0}; },
    pickZikr(i){ this.zikrIdx=i; this.tasbih={count:0,rounds:0}; },
    // أشخاص
    savePerson(){ const n=this.name.trim(); if(!n) return; this.people.push({name:n,father:this.father.trim(),gender:this.gender}); },
    loadPerson(i){ const p=this.people[i]; this.name=p.name; this.father=p.father||''; this.gender=p.gender||'m'; this.showSettings=false; },
    delPerson(i){ this.people.splice(i,1); },
    // تشغيل تلقائي
    startPlay(){ if(this.playTimer){clearInterval(this.playTimer);this.playTimer=null;} this.playTimer=setInterval(()=>{ const el=this.$refs.duaa,sl=el.querySelectorAll('.slide'),h=window.innerHeight,cur=Math.round(el.scrollTop/h);
        if(cur<sl.length-1) sl[cur+1].scrollIntoView({behavior:'smooth'}); else this.stopPlay(); }, this.speed*1000); },
    stopPlay(){ this.playing=false; if(this.playTimer){clearInterval(this.playTimer);this.playTimer=null;} },
    togglePlay(){ if(this.playing) this.stopPlay(); else { this.playing=true; this.startPlay(); } },
    // ملء الشاشة
    toggleFS(){ try{ if(!document.fullscreenElement){ (document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen).call(document.documentElement); } else { (document.exitFullscreen||document.webkitExitFullscreen).call(document); } }catch(e){} },
    // wake lock
    async reqWake(){ try{ this.wl=await navigator.wakeLock.request('screen'); }catch(e){} },
    relWake(){ try{ if(this.wl){ this.wl.release(); this.wl=null; } }catch(e){} },
    // تثبيت التطبيق (PWA)
    async doInstall(){ if(!this.deferredPrompt) return; this.deferredPrompt.prompt();
      try{ await this.deferredPrompt.userChoice; }catch(e){} this.deferredPrompt=null; this.canInstall=false; },
    // التحقّق من التحديثات
    async checkUpdate(){
      this.upToDate=false; this.checkingUpdate=true;
      let newer=false;
      try{ if(this.swReg) await this.swReg.update(); }catch(e){}
      try{
        const r=await fetch('version.json?_='+Date.now(),{cache:'no-store'});
        if(r.ok){ const j=await r.json(); if(j && j.hash && j.hash!==this.buildHash) newer=true; }
      }catch(e){}
      // a waiting worker also means a new version is ready
      if(this.swReg && this.swReg.waiting) this.updateReady=true;
      if(newer) this.updateReady=true;
      this.checkingUpdate=false;
      if(!this.updateReady){ this.upToDate=true; setTimeout(()=>{ this.upToDate=false; },4000); }
    },
    applyUpdate(){
      const w=this.swReg && this.swReg.waiting;
      if(w){ w.postMessage({type:'SKIP_WAITING'}); }   // controllerchange handler will reload
      else { window.location.reload(); }
    },
    // طباعة
    doPrint(){ this.showSettings=false; this.$nextTick(()=>{ setTimeout(()=>window.print(),120); }); },
    // فهرس + قفز
    jumpTo(i){ this.showIndex=false; this.$nextTick(()=>{ const sl=this.$refs.duaa.querySelectorAll('.slide'); if(sl[i]) sl[i].scrollIntoView(); }); },
    // تبويبات + تمرير
    keepSlide(){ this.$nextTick(()=>{ const el=this.$refs.duaa; if(el) el.scrollTop=this.duaaIndex*window.innerHeight; }); },
    onScrollDuaa(){ const el=this.$refs.duaa; this.duaaIndex=Math.round(el.scrollTop/window.innerHeight); this.saveScroll(); },
    onScrollTab(){ this.saveScroll(); },
    saveScroll(){ try{ const o={d:this.duaaIndex}; ['tawaf','saee','adia','tasbih','rights'].forEach(k=>{ const r=this.$refs[k]; if(r)o[k]=r.scrollTop; }); localStorage.setItem('scrollState',JSON.stringify(o)); }catch(e){} },
    showTab(name){ this.activeTab=name; if(name!=='duaa') this.showSettings=false;
      this.$nextTick(()=>{ const st=this.loadScroll();
        if(name==='duaa'&&this.$refs.duaa) this.$refs.duaa.scrollTop=this.duaaIndex*window.innerHeight;
        else if(this.$refs[name]) this.$refs[name].scrollTop=(st[name]||0); }); },
    persist(k,v){ try{ localStorage.setItem(k,v); }catch(e){} },
    loadScroll(){ try{ return JSON.parse(localStorage.getItem('scrollState')||'{}'); }catch(e){ return {}; } },
    loadAll(){ try{
      const g=localStorage.getItem('duaaGender'); if(g)this.gender=g;
      const nm=localStorage.getItem('duaaName'); if(nm!==null&&nm!==undefined)this.name=nm||'';
      const fa=localStorage.getItem('duaaFather'); if(fa)this.father=fa;
      const sc=localStorage.getItem('duaaScale'); if(sc)this.scale=parseFloat(sc);
      const hs=JSON.parse(localStorage.getItem('hajjState')||'null'); if(hs){this.C.tawaf=Object.assign(this.C.tawaf,hs.tawaf);this.C.saee=Object.assign(this.C.saee,hs.saee);}
      const ss=this.loadScroll(); if(ss&&typeof ss.d==='number')this.duaaIndex=ss.d;
      const tb=localStorage.getItem('duaaTab'); if(tb && ['duaa','tawaf','saee','adia','tasbih','rights'].includes(tb)) this.activeTab=tb;
      const dk=localStorage.getItem('duaaDark'); if(dk==='1')this.dark=true;
      const sp=localStorage.getItem('duaaSpeed'); if(sp)this.speed=parseInt(sp);
      const pe=JSON.parse(localStorage.getItem('duaaPeople')||'[]'); if(Array.isArray(pe))this.people=pe;
      const ts=JSON.parse(localStorage.getItem('tasbih')||'null'); if(ts)this.tasbih=ts;
      const zi=localStorage.getItem('zikrIdx'); if(zi)this.zikrIdx=parseInt(zi);
      const scats=JSON.parse(localStorage.getItem('selectedCats')||'[]'); if(Array.isArray(scats))this.selectedCats=scats;
      const dm=localStorage.getItem('duaaMode'); if(dm==='self'||dm==='mayyit')this.duaaMode=dm;
    }catch(e){} },
  },
  mounted(){
    this.deferredPrompt=null;
    window.addEventListener('beforeinstallprompt',(e)=>{ e.preventDefault(); this.deferredPrompt=e; this.canInstall=true; });
    window.addEventListener('appinstalled',()=>{ this.canInstall=false; this.deferredPrompt=null; });
    if('serviceWorker' in navigator){
      const swUrl=new URL('../sw.js?v='+encodeURIComponent(BUILD_HASH), import.meta.url);
      navigator.serviceWorker.register(swUrl).then((reg)=>{
        this.swReg=reg;
        if(navigator.serviceWorker.controller) this.offlineReady=true;
        if(reg.waiting && navigator.serviceWorker.controller) this.updateReady=true;
        reg.addEventListener('updatefound',()=>{ const nw=reg.installing; if(!nw) return;
          nw.addEventListener('statechange',()=>{ if(nw.state==='installed' && navigator.serviceWorker.controller) this.updateReady=true;
            if(nw.state==='activated') this.offlineReady=true; }); });
      }).catch(()=>{});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(this._reloading) return; this._reloading=true; window.location.reload(); });
    }
    this.loadAll();
    try{ if(!localStorage.getItem('tutorialDone')) this.showWizard=true; }catch(e){ this.showWizard=true; }
    document.documentElement.style.setProperty('--scale',this.scale);
    document.body.classList.toggle('dark',this.dark);
    setInterval(()=>{ this.now=Date.now(); },500);
    this.$nextTick(()=>{ const st=this.loadScroll();
      if(this.$refs.duaa) this.$refs.duaa.scrollTop=this.duaaIndex*window.innerHeight;
      ['tawaf','saee','adia','tasbih','rights'].forEach(k=>{ if(this.$refs[k]) this.$refs[k].scrollTop=(st[k]||0); }); });
    document.addEventListener('visibilitychange',()=>{ if(this.wake&&document.visibilityState==='visible') this.reqWake(); });
    window.addEventListener('keydown',(e)=>{ if(this.activeTab!=='duaa') return;
      if(e.key==='+'||e.key==='='){this.changeScale(0.1);return;} if(e.key==='-'||e.key==='_'){this.changeScale(-0.1);return;}
      const el=this.$refs.duaa,sl=el.querySelectorAll('.slide'),h=window.innerHeight,cur=Math.round(el.scrollTop/h);
      if(['ArrowDown','ArrowLeft','PageDown',' '].includes(e.key)){e.preventDefault(); if(cur<sl.length-1) sl[cur+1].scrollIntoView();}
      else if(['ArrowUp','ArrowRight','PageUp'].includes(e.key)){e.preventDefault(); if(cur>0) sl[cur-1].scrollIntoView();}
      else if(e.key==='Home'){sl[0].scrollIntoView();} else if(e.key==='End'){sl[sl.length-1].scrollIntoView();} });
    window.addEventListener('beforeunload',()=>this.saveScroll());
  }
}).mount('#app');
