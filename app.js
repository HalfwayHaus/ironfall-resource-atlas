'use strict';
const RESOURCES=[
 ['lithium','Lithium','#b39bff'],['pyrochlore','Pyrochlore','#ff957d'],['gold','Gold','#f2cc66'],['beryllium','Beryllium','#9bdfb5'],['uranium','Uranium','#d7f56b'],['zinc','Zinc','#83c4ed'],['copper','Copper','#ed9c62'],['iron','Iron','#c2c9ce'],['lead','Lead','#9a9dda'],['nickel','Nickel','#c3cb91'],['silver','Silver','#d1e7ef'],['sulfur','Sulfur','#f1ec67'],['coal','Coal','#b5a495'],['redstone','Redstone','#f57580'],['lapis','Lapis lazuli','#719df6'],['diamond','Diamond','#73e9e4'],['emerald','Emerald','#50d892'],['bauxite','Bauxite','#e7ac9a'],['tar','Tar','#bc96ab'],['amethyst','Amethyst','#c48be8'],['nether_gold','Nether gold','#ffb83f'],['quartz','Nether quartz','#eee4dd']
].map(([id,name,color],i)=>({id,name,color,i}));
const $=id=>document.getElementById(id),fmt=n=>Math.round(n).toLocaleString('en-US');
const canvas=$('map'),ctx=canvas.getContext('2d'),heat=document.createElement('canvas'),hctx=heat.getContext('2d');
const ironView=new URLSearchParams(location.search).get('deposits')==='iron';
let grayMap=ironView,focus=ironView?RESOURCES.findIndex(ore=>ore.id==='iron'):0,visible=new Set([focus]),minBand=0,maxBand=23,opacity=.7;
let survey,bg;
let width=1,height=1,dpr=1,cx=15360,cz=7680,scale=.03,fitScale=.03,pointers=new Map(),drag=null,drawPending=false,ready=false;

function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function rangeLabel(){return `${minBand*16-64} to ${maxBand*16-49}`;}
function world(sx,sy){return [cx+(sx-width/2)/scale,cz+(sy-height/2)/scale];}
function screen(x,z){return [(x-cx)*scale+width/2,(z-cz)*scale+height/2];}
function requestDraw(){if(!drawPending){drawPending=true;requestAnimationFrame(()=>{drawPending=false;draw();});}}
function fit(){cx=15360;cz=7680;scale=fitScale;requestDraw();}
function resize(){const r=$('mapArea').getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);fitScale=Math.min((width-45)/30720,(height-110)/15360);if(!ready||scale<fitScale*.6)scale=fitScale;requestDraw();}
function layerUI() {
 const query = $('resourceSearch').value.toLowerCase();
 $('layerList').replaceChildren();
 for (const ore of RESOURCES) {
  if (!ore.name.toLowerCase().includes(query)) continue;
  const row = document.createElement('div');
  row.className = 'layer-row' + (focus === ore.i ? ' active' : '');
  row.style.setProperty('--ore', ore.color);

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = visible.has(ore.i);
  check.setAttribute('aria-label', `Show ${ore.name} layer`);
  check.addEventListener('change', () => {
   if (check.checked) {
    visible.add(ore.i);
    focus = ore.i;
   } else {
    visible.delete(ore.i);
   }
   rebuild();
  });

  const swatch = document.createElement('span');
  swatch.className = 'swatch';
  const name = document.createElement('button');
  name.className = 'layer-name';
  name.textContent = ore.name;
  name.setAttribute('aria-pressed', String(focus === ore.i));
  name.addEventListener('click', () => {
   focus = ore.i;
   visible.add(focus);
   rebuild();
  });
  row.append(check, swatch, name);
  $('layerList').append(row);
 }
}

function rebuild() {
 if (!survey) return;
 if (!visible.has(focus)) focus = visible.values().next().value;
 const ore = RESOURCES[focus];
 $('legend').hidden = !ore;
 if (ore) {
  $('legendName').textContent = ore.name;
  $('legendBar').style.background = `linear-gradient(90deg,${ore.color}22,${ore.color})`;
 }

 const {width: columns, height: rows, resources} = survey;
 const cellCount = columns * rows;
 hctx.clearRect(0, 0, columns, rows);
 const order = [...visible].sort((a, b) => Number(a === focus) - Number(b === focus));
 for (const index of order) {
  const {id, color} = RESOURCES[index];
  const bands = resources[id];
  const density = new Float64Array(cellCount);
  for (let band = minBand; band <= maxBand; band++) {
   const offset = band * cellCount;
   for (let i = 0; i < cellCount; i++) density[i] += densityWeights[bands[offset + i]];
  }
  const maximum = Math.max(...density);
  if (maximum === 0) continue;

  const [r, g, b] = rgb(color);
  density.forEach((count, i) => {
   if (count === 0) return;
   const strength = .06 + .85 * Math.pow(count / maximum, .65);
   hctx.fillStyle = `rgba(${r},${g},${b},${strength})`;
   hctx.fillRect(i % columns, Math.floor(i / columns), 1, 1);
  });
 }
 layerUI();
 requestDraw();
}

function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle='#12262c';ctx.fillRect(0,0,width,height);if(!bg)return;const [x0,z0]=screen(0,0),w=30720*scale,h=15360*scale;ctx.filter=grayMap?'grayscale(1)':'none';ctx.drawImage(bg,x0,z0,w,h);ctx.filter='none';ctx.fillStyle='rgba(8,19,22,.12)';ctx.fillRect(x0,z0,w,h);if(visible.size){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.globalAlpha=opacity;ctx.drawImage(heat,x0,z0,w,h);ctx.globalAlpha=1;ctx.imageSmoothingEnabled=true;}
 ctx.strokeStyle='#cedbd04d';ctx.lineWidth=1;ctx.strokeRect(x0,z0,w,h);
 const spacing=scale>.15?1000:scale>.06?2500:5000;ctx.font='10px Segoe UI';ctx.fillStyle='#eff5ead9';ctx.strokeStyle='#f3f7ea24';ctx.lineWidth=.5;ctx.textAlign='center';for(let x=spacing;x<30720;x+=spacing){const [sx]=screen(x,0);if(sx<45||sx>width-55)continue;ctx.beginPath();ctx.moveTo(sx,Math.max(z0,0));ctx.lineTo(sx,Math.min(z0+h,height));ctx.stroke();if(z0>=0&&z0<height-20){ctx.fillText(fmt(x),sx,Math.max(63,z0-7));}}
 for(let z=spacing;z<15360;z+=spacing){const [,sz]=screen(0,z);if(sz<55||sz>height-50)continue;ctx.beginPath();ctx.moveTo(Math.max(x0,0),sz);ctx.lineTo(Math.min(x0+w,width),sz);ctx.stroke();if(x0>0){ctx.textAlign='right';ctx.fillText(fmt(z),Math.max(40,x0-7),sz+3);}}
 const [spawnX,spawnZ]=screen(16141,5235);if(spawnX>0&&spawnX<width&&spawnZ>0&&spawnZ<height){ctx.strokeStyle='#fff9';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(spawnX-5,spawnZ);ctx.lineTo(spawnX+5,spawnZ);ctx.moveTo(spawnX,spawnZ-5);ctx.lineTo(spawnX,spawnZ+5);ctx.stroke();if(scale>.08){ctx.font='10px Segoe UI';ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText('Spawn',spawnX+8,spawnZ-7);}}
 const distance=100/scale;const pow=10**Math.floor(Math.log10(distance)),bar=[1,2,5,10].map(n=>n*pow).reduce((a,b)=>Math.abs(b-distance)<Math.abs(a-distance)?b:a);$('scaleLabel').textContent=fmt(bar)+' blocks';ctx.strokeStyle='#edf3e7';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(width/2-bar*scale/2,height-45);ctx.lineTo(width/2+bar*scale/2,height-45);ctx.stroke();$('originalLink').href=`https://ironfall.org/bluemap/#world:${Math.round(cx)}:0:${Math.round(cz)}:1000:0:0:0:1:flat`;}
function zoom(f,x=width/2,y=height/2){const [wx,wz]=world(x,y);scale=Math.max(fitScale*.7,Math.min(2,scale*f));cx=wx-(x-width/2)/scale;cz=wz-(y-height/2)/scale;requestDraw();}

function pointerMove(e) {
 if (!ready) return;
 const rect = canvas.getBoundingClientRect();
 const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
 if (pointers.has(e.pointerId)) pointers.set(e.pointerId, [sx, sy]);
 if (pointers.size === 2) {
  const [a, b] = pointers.values();
  const distance = Math.hypot(a[0] - b[0], a[1] - b[1]);
  if (drag?.pinch && distance > 0) zoom(distance / drag.pinch, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  drag = {pinch: distance};
  return;
 }
 if (drag && pointers.size === 1) {
  cx = drag.cx - (sx - drag.x) / scale;
  cz = drag.cz - (sy - drag.y) / scale;
  requestDraw();
  return;
 }
 const [x, z] = world(sx, sy);
 $('coordinates').textContent = `X ${fmt(x)} · Z ${fmt(z)}`;
}

canvas.addEventListener('pointerdown', e => {
 if (!ready) return;
 canvas.setPointerCapture(e.pointerId);
 const r = canvas.getBoundingClientRect();
 const x = e.clientX - r.left, y = e.clientY - r.top;
 pointers.set(e.pointerId, [x, y]);
 drag = {x, y, cx, cz};
});
canvas.addEventListener('pointermove', pointerMove);
function endPointer(e) {
 pointers.delete(e.pointerId);
 const remaining = pointers.values().next().value;
 drag = remaining ? {x: remaining[0], y: remaining[1], cx, cz} : null;
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('wheel', e => {
 e.preventDefault();
 const r = canvas.getBoundingClientRect();
 zoom(Math.exp(-e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top);
}, {passive: false});

$('zoomIn').onclick=()=>zoom(1.6);
$('zoomOut').onclick=()=>zoom(1/1.6);
$('fit').onclick=fit;
$('resourceSearch').oninput=layerUI;
$('showAll').onclick=()=>{visible=new Set(RESOURCES.map(o=>o.i));rebuild();};
$('hideAll').onclick=()=>{visible.clear();rebuild();};
$('opacity').oninput=e=>{opacity=+e.target.value/100;$('opacityValue').textContent=e.target.value+'%';requestDraw();};
$('grayscaleToggle').onchange=e=>{grayMap=e.target.checked;requestDraw();};
$('mobileLayers').onclick=()=>$('sidebar').classList.toggle('open');
$('jumpForm').onsubmit=e=>{
 e.preventDefault();
 if ($('jumpX').value === '' || $('jumpZ').value === '') return;
 cx = +$('jumpX').value;
 cz = +$('jumpZ').value;
 scale = Math.max(scale, Math.min(width, height) / 3000);
 requestDraw();
};
$('methodButton').onclick=()=>$('methodDialog').showModal();
$('closeMethod').onclick=()=>$('methodDialog').close();
$('methodDialog').onclick=e=>{if(e.target===$('methodDialog'))$('methodDialog').close();};

for(let b=0;b<24;b++){for(const id of ['minDepth','maxDepth']){const option=document.createElement('option');option.value=b;option.textContent=String(b*16-64+(id==='maxDepth'?15:0));$(id).append(option);}}$('maxDepth').value=23;
function setDepth(){const val=$('depth').value;$('customDepth').hidden=val!=='custom';if(val==='all'){minBand=0;maxBand=23;}else if(val==='deep'){minBand=0;maxBand=3;}else if(val==='lower'){minBand=4;maxBand=7;}else if(val==='upper'){minBand=8;maxBand=23;}else{minBand=+$('minDepth').value;maxBand=+$('maxDepth').value;if(maxBand<minBand){maxBand=minBand;$('maxDepth').value=maxBand;}}$('depthNote').textContent='Y '+rangeLabel();rebuild();}$('depth').onchange=setDepth;$('minDepth').onchange=setDepth;$('maxDepth').onchange=setDepth;

// Estimate each bucket by the midpoint of its quarter-octave range before summing depth bands.
const densityWeights = Float64Array.from({length: 256}, (_, bucket) =>
 bucket === 0 ? 0 : bucket === 1 ? 4 : 2 ** ((bucket + 10.5) / 4)
);

async function loadSurvey() {
 let buffer;
 if (window.IRONFALL_INLINE_DATA) {
  buffer = Uint8Array.from(atob(window.IRONFALL_INLINE_DATA), c => c.charCodeAt(0));
 } else {
  const response = await fetch('data/resource-gradients.json.gz');
  if (!response.ok) throw Error(`Resource gradients could not be loaded (${response.status}).`);
  buffer = await response.arrayBuffer();
 }
 const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
 const data = await new Response(stream).json();
 const expectedSize = data.width * data.height * 24;
 for (const {id} of RESOURCES) {
  const bands = Uint8Array.from(atob(data.resources[id]), char => char.charCodeAt(0));
  if (bands.length !== expectedSize) throw Error(`Unexpected gradient data size for ${id}.`);
  data.resources[id] = bands;
 }
 return data;
}

async function boot() {
 try {
  resize();
  bg = new Image();
  bg.src = window.IRONFALL_INLINE_BASEMAP || 'assets/bluemap-world.webp';
  [survey] = await Promise.all([loadSurvey(), bg.decode()]);
  heat.width = survey.width;
  heat.height = survey.height;
  $('scanBadge').textContent = `FULL SCAN · ${(survey.chunks / 1e6).toFixed(1)}M CHUNKS`;
  $('methodDetails').textContent = `The survey scanned ${fmt(survey.chunks)} saved chunks across ${fmt(survey.regionFiles)} region files. The overlay uses ${fmt(survey.width * survey.height)} regional density cells.`;
  $('coverageDetails').textContent = `Coverage spans X 0–30,719, Z 0–15,359 and Y −64–319. Scan errors: ${survey.scanErrors}.`;
  ready = true;
  $('grayscaleToggle').checked = grayMap;
  rebuild();
  fit();
  $('loading').hidden = true;
 } catch (e) {
  $('loadingMessage').textContent = e.message;
  $('scanBadge').textContent = 'Load error';
  console.error(e);
 }
}
new ResizeObserver(resize).observe($('mapArea'));
boot();
