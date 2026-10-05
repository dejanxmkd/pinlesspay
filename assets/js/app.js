window.addEventListener('DOMContentLoaded',()=>{
  if(window.lucide) lucide.createIcons();
  document.querySelectorAll('[data-nav]').forEach(a=>{if(location.pathname.endsWith(a.getAttribute('href')))a.classList.add('active')});
  document.querySelectorAll('[data-demo-submit]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();const banner=document.querySelector('.success-banner');if(banner)banner.style.display='flex'}));
});
