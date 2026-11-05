(()=>{'use strict';
const $=id=>document.getElementById(id),screens=['home','game','result','about'];let best=+(localStorage.getItem('covaBest')||0),score=0,potions=0,lives=3,playing=false,paused=false,player=1,items=[],hazards=[],frame=0,raf=0,sound=true,audio=null;
$('bestHome').textContent=best;
function show(id){screens.forEach(s=>$(s).classList.toggle('active',s===id));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('selected',b.dataset.go===id||(id==='result'&&b.dataset.go==='game')))}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{if(b.dataset.go==='game')start();else{stop();show(b.dataset.go)}});
function beep(freq=520,d=.08){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();let o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=freq;g.gain.value=.045;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch(e){}}
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♫':'♪';if(sound)beep()};
$('play').onclick=start;$('again').onclick=start;$('homeBtn').onclick=()=>show('home');$('back').onclick=()=>show('home');
$('about').addEventListener('click',e=>{if(e.target.id==='back')show('home')});
function start(){cancelAnimationFrame(raf);score=0;potions=0;lives=3;player=1;items=[];hazards=[];frame=0;playing=true;paused=false;updateHud();show('game');draw();raf=requestAnimationFrame(loop)}
function stop(){playing=false;cancelAnimationFrame(raf)}
function updateHud(){$('score').textContent=score;$('potions').textContent=potions;$('lives').textContent=lives}
function move(d){if(!playing||paused)return;player=Math.max(0,Math.min(2,player+d));beep(330,.04)}
$('left').onpointerdown=e=>{e.preventDefault();move(-1)};$('right').onpointerdown=e=>{e.preventDefault();move(1)};
let sx=0;const canvas=$('board');canvas.addEventListener('pointerdown',e=>{sx=e.clientX});canvas.addEventListener('pointerup',e=>{let dx=e.clientX-sx;if(Math.abs(dx)>18)move(dx>0?1:-1)});
document.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='a')move(-1);if(e.key==='ArrowRight'||e.key==='d')move(1);if(e.key===' '&&playing)togglePause()};
$('pause').onclick=togglePause;function togglePause(){if(!playing)return;paused=!paused;$('pause').textContent=paused?'▶ Continuar':'Ⅱ Pausa';if(!paused)raf=requestAnimationFrame(loop);else cancelAnimationFrame(raf)}
function draw(){const c=canvas.getContext('2d'),w=390,h=620;c.clearRect(0,0,w,h);let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#24153b');g.addColorStop(1,'#0d0a1b');c.fillStyle=g;c.fillRect(0,0,w,h);
c.fillStyle='#ffffff';for(let i=0;i<45;i++){let x=(i*79+13)%w,y=(i*137+frame*.35)%h;c.globalAlpha=.3+(i%4)*.12;c.fillRect(x,y,2,2)}c.globalAlpha=1;
c.fillStyle='#f4c978';c.beginPath();c.arc(320,72,31,0,7);c.fill();c.fillStyle='#24153b';c.beginPath();c.arc(333,60,28,0,7);c.fill();
for(let i=0;i<3;i++){let x=65+i*130;c.fillStyle='#ffffff0b';c.fillRect(x-48,0,96,h);c.strokeStyle='#ffffff12';c.beginPath();c.moveTo(x+48,0);c.lineTo(x+48,h);c.stroke()}
c.font='24px serif';c.textAlign='center';items.forEach(o=>{c.fillText(o.type==='p'?'🧪':'✨',65+o.lane*130,o.y)});hazards.forEach(o=>c.fillText('🦇',65+o.lane*130,o.y));
c.font='48px serif';c.fillText('🧙‍♀️',65+player*130,535);
c.fillStyle='#f4c978';c.font='11px sans-serif';c.fillText('BOSQUE ENCANTADO · NOCHE '+(1+Math.floor(score/100)),195,25);
if(paused){c.fillStyle='#090614bb';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='bold 28px Cinzel,serif';c.fillText('PAUSA',195,310)}
}
function loop(){if(!playing||paused)return;frame++;if(frame%48===0)items.push({lane:Math.floor(Math.random()*3),y:-20,type:'p'});if(frame%75===0)items.push({lane:Math.floor(Math.random()*3),y:-20,type:'s'});if(frame%95===0)hazards.push({lane:Math.floor(Math.random()*3),y:-20});
items.forEach(o=>o.y+=4.1);hazards.forEach(o=>o.y+=4.4);
items=items.filter(o=>{if(o.y>500&&o.y<555&&o.lane===player){if(o.type==='p'){potions++;score+=25;beep(740)}else{score+=10;beep(600)}return false}return o.y<650});
hazards=hazards.filter(o=>{if(o.y>500&&o.y<555&&o.lane===player){lives--;beep(130,.2);if(lives<=0){finish();return false}}return o.y<650});
if(frame%8===0)score+=1;updateHud();draw();raf=requestAnimationFrame(loop)}
function finish(){playing=false;cancelAnimationFrame(raf);if(score>best){best=score;localStorage.setItem('covaBest',best);$('bestHome').textContent=best} $('finalScore').textContent=score;$('finalPotions').textContent=potions;$('rank').textContent=score>500?'HECHICERA SUPREMA':score>250?'GUARDIANA DE LA LUNA':'APRENDIZ DE LA COVA';$('resultTitle').textContent=score>500?'¡Leyenda de la noche!':'¡Hechizo completado!';show('result');beep(880,.2)}
$('share').onclick=async()=>{let msg=`¡He conseguido ${score} puntos y ${potions} ingredientes en La Noche Encantada de A Cova Meiga! 🌙🧙‍♀️ ¿Puedes superarme?`;try{if(navigator.share)await navigator.share({title:'A Cova Meiga · La noche encantada',text:msg,url:location.href});else{await navigator.clipboard.writeText(msg+' '+location.href);toast('Texto copiado para compartir')}}catch(e){}};
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
draw();
})();