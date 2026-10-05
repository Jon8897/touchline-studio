/* Preview only: the single-file version shows the home page first; buttons switch to the app and back. */
(function(){
  document.body.classList.remove('landing');
  const bar=document.createElement('div'); bar.className='demobanner homebar';
  bar.innerHTML='<span>You’re in the coaching app. In this preview everything saves on this device.</span> <a href="#" data-home>← Back to the home page</a>';
  document.querySelector('header.top').before(bar);
  const stopApp=()=>{try{Object.values(boards).forEach(b=>b.stop())}catch(e){}};
  function toSite(){document.body.classList.add('sitemode'); try{exitPlayer()}catch(e){} stopApp(); history.replaceState(null,'',location.pathname+location.search); scrollTo(0,0); try{renderDemo()}catch(e){}}
  function toApp(v){document.body.classList.remove('sitemode'); try{dBoard.stop();hBoard.stop()}catch(e){} show(v||'formations'); scrollTo(0,0)}
  window.goHome=toSite;
  document.getElementById('site').addEventListener('click',e=>{
    const a=e.target.closest('a[href]'); if(!a) return; const h=a.getAttribute('href');
    if(h==='/'){e.preventDefault(); scrollTo({top:0,behavior:'smooth'}); return}
    if(h==='/demo'||h.startsWith('/app')){e.preventDefault(); toApp(h.includes('signup')?'week':'formations'); return}
    if(h.startsWith('#')){e.preventDefault(); const t=document.querySelector(h); if(t) t.scrollIntoView({behavior:'smooth'})}
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-home]')||e.target.closest('.top .brand')){e.preventDefault(); toSite()}
  });
  addEventListener('hashchange',()=>{if(location.hash.startsWith('#w.')) document.body.classList.remove('sitemode')},true);
  const h=(window.__H0||'').slice(1);
  if(!(h.startsWith('w.')||['formations','positions','drills','sessions','coach','fitness','week'].includes(h))) toSite();
})();
