(()=>{'use strict';
const $=s=>document.querySelector(s),names={official:'官方教材原文',detailed:'精讲',recap:'串讲'},versions=Object.keys(names);
const stateKey='cpa-ch06-three-textbooks-v1',content=$('#reader-content'),cache=new Map(),index=new Map(),editionPoints=new Map();
let manifest,original,mathCells,imageNotes,unit='u01',version='official',point='',appearance='light',requestId=0,scrollTimer,scrollFrame,loading=false,pending=null,pointAnchor=null,explicitPoint='',readingPoint='',readingScrollIntent=false;
const pageNav=$('#page-nav'),pageTocToggle=$('#page-toc-toggle'),readingTools=$('.reading-tools'),chapterNav=$('#chapter-nav'),chapterToggle=$('#sidebar-toggle');
function setText(selector,value){const node=$(selector);if(node)node.textContent=value;}
// Keep long formulas legible; make only overflowing regions keyboard-scrollable.
const formulaObserver=new ResizeObserver(entries=>{for(const {target:el} of entries){const overflow=el.scrollWidth>el.clientWidth+2;el.classList.toggle('is-overflowing',overflow);if(overflow){el.tabIndex=0;el.setAttribute('role','region');el.setAttribute('aria-label','长公式，可用左右方向键横向滚动');}else{el.removeAttribute('tabindex');el.removeAttribute('role');el.removeAttribute('aria-label');}}});
function getSaved(){try{return JSON.parse(localStorage.getItem(stateKey))||{};}catch{return {};}}
function save(){try{localStorage.setItem(stateKey,JSON.stringify({schema:1,unit,version,point}));localStorage.setItem('cpa-reader-appearance',appearance);}catch{}}
function applyAppearance(){document.documentElement.dataset.theme=appearance;$('#appearance').value=appearance;}
try{const t=localStorage.getItem('cpa-reader-appearance')||JSON.parse(localStorage.getItem('cpa-three-textbooks-v1'))?.appearance;if(['light','dark'].includes(t))appearance=t;}catch{}
applyAppearance();$('#appearance').addEventListener('change',e=>{appearance=e.target.value==='dark'?'dark':'light';applyAppearance();save();});
// Preserve the saved reading width after retiring the chart-width control.
document.documentElement.dataset.readingWidth=document.documentElement.dataset.readingWidth==='standard'?'standard':'wide';
function pageTocIsMobile(){return !!pageTocToggle&&pageTocToggle.getClientRects().length>0;}
let desktopChapterCollapsed=document.documentElement.dataset.chapterNav==='collapsed',mobileNavigation=pageTocIsMobile();
try{const saved=localStorage.getItem('cpa-reader-chapter-nav');if(['collapsed','expanded'].includes(saved))desktopChapterCollapsed=saved==='collapsed';}catch{}
function applyChapterNav(collapsed,returnFocus=false){document.documentElement.dataset.chapterNav=collapsed?'collapsed':'expanded';chapterToggle.setAttribute('aria-expanded',String(!collapsed));chapterToggle.textContent=collapsed?'展开目录':'收起目录';chapterNav.inert=collapsed;chapterNav.setAttribute('aria-hidden',String(collapsed));if(returnFocus)chapterToggle.focus();}
function closeMobileChapterNav(){if(pageTocIsMobile())applyChapterNav(true);}
applyChapterNav(mobileNavigation||desktopChapterCollapsed);
chapterToggle.addEventListener('click',()=>{const collapsed=document.documentElement.dataset.chapterNav!=='collapsed';if(pageTocIsMobile()){if(!collapsed)setPageToc(false);applyChapterNav(collapsed);if(!collapsed)(chapterNav.querySelector('[aria-current="page"]')||chapterNav.querySelector('button'))?.focus({preventScroll:true});}else{desktopChapterCollapsed=collapsed;applyChapterNav(collapsed);try{localStorage.setItem('cpa-reader-chapter-nav',collapsed?'collapsed':'expanded');}catch{}}});
function syncPageToc(){if(!pageNav)return;const hidden=pageTocIsMobile()&&document.documentElement.dataset.pageToc!=='open';pageNav.inert=hidden;pageNav.setAttribute('aria-hidden',String(hidden));pageTocToggle?.setAttribute('aria-expanded',String(!hidden&&document.documentElement.dataset.pageToc==='open'));}
function setPageToc(open,returnFocus=false){document.documentElement.dataset.pageToc=open?'open':'closed';syncPageToc();if(returnFocus)pageTocToggle?.focus();}
setPageToc(false);
pageTocToggle?.addEventListener('click',()=>{const open=document.documentElement.dataset.pageToc!=='open';if(open)closeMobileChapterNav();setPageToc(open);if(open&&pageTocIsMobile())(pageNav?.querySelector('[aria-current="location"]')||pageNav?.querySelector('button'))?.focus({preventScroll:true});});
window.addEventListener('resize',()=>{const mobile=pageTocIsMobile();if(mobile!==mobileNavigation){mobileNavigation=mobile;applyChapterNav(mobile||desktopChapterCollapsed);setPageToc(false);}else syncPageToc();},{passive:true});
async function getJSON(url){const r=await fetch(url);if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
function currentUnit(){return manifest?.units.find(u=>u.id===unit);}
function readingOffset(){let bottom=0;for(const node of document.querySelectorAll('.reader-header,.version-bar')){const css=getComputedStyle(node),rect=node.getBoundingClientRect();if(css.display!=='none'&&['fixed','sticky'].includes(css.position)&&rect.top<=bottom+2&&rect.bottom>0)bottom=Math.max(bottom,rect.bottom);}return bottom+16;}
function visiblePoint(){const nodes=[...content.children].filter(x=>x.matches('section'));let chosen=nodes[0];const top=readingOffset()+2;
 // A completed reading scroll confirms a location too. Focusing a version
 // control or laying out content must not replace it with a geometric neighbor.
 if(!readingScrollIntent&&readingPoint&&content.contains(document.getElementById(readingPoint)))return readingPoint;
 // Layout/focus scrolling can move scrollY without a reader choosing a new
 // topic. Keep the explicit visible point until intentional reading scroll.
 if(explicitPoint){const target=document.getElementById(explicitPoint),rect=target?.getBoundingClientRect();if(target&&content.contains(target)&&rect.bottom>top&&rect.top<window.innerHeight)return explicitPoint;explicitPoint='';}
 // Near the page end, a selected heading cannot always reach the top offset.
 // Keep that explicit location until the reader actually scrolls elsewhere.
 if(pointAnchor){const target=document.getElementById(pointAnchor.id),rect=target?.getBoundingClientRect();if(Math.abs(window.scrollY-pointAnchor.scrollY)<=1&&target&&content.contains(target)&&rect.bottom>top&&rect.top<window.innerHeight)return pointAnchor.id;pointAnchor=null;}
 for(const node of nodes){if(node.getBoundingClientRect().top<=top)chosen=node;else break;}return chosen?.id||'';}
function record(id){return index.get(id);}
function markPoint(id){document.querySelectorAll('#unit-toc button').forEach(b=>{if(b.dataset.point===id)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');});}
function closeReadingTools(){document.querySelectorAll('.reading-tools details[open]').forEach(d=>d.open=false);}
readingTools?.addEventListener('toggle',e=>{if(e.target.open)readingTools.querySelectorAll('details[open]').forEach(d=>{if(d!==e.target)d.open=false;});},true);
document.addEventListener('click',e=>{if(readingTools&&!readingTools.contains(e.target))closeReadingTools();if(!pageTocIsMobile())return;if(pageNav&&document.documentElement.dataset.pageToc==='open'&&!pageNav.contains(e.target)&&!pageTocToggle?.contains(e.target))setPageToc(false);if(document.documentElement.dataset.chapterNav==='expanded'&&!chapterNav.contains(e.target)&&!chapterToggle.contains(e.target))applyChapterNav(true);});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(pageTocIsMobile()&&document.documentElement.dataset.pageToc==='open'){e.preventDefault();setPageToc(false,true);return;}if(pageTocIsMobile()&&document.documentElement.dataset.chapterNav==='expanded'){e.preventDefault();applyChapterNav(true,true);return;}const opened=readingTools?.querySelector('details[open]');if(opened){e.preventDefault();closeReadingTools();opened.querySelector('summary').focus();}});
function matchTarget(u,fromId,next){
 const from=record(fromId),ids=from?.version==='official'?[fromId]:(from?.officialIds||[]);
 const candidates=u[next];
 if(next==='official')return candidates.find(p=>ids.includes(p.id))?.id||candidates[0]?.id;
 // Prefer the most specific overlapping topic; broader summaries remain fallbacks.
 const ranked=candidates.map((p,i)=>({p,i,score:(p.officialIds||[]).filter(id=>ids.includes(id)).length/Math.max(1,(p.officialIds||[]).length)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i);
 return ranked[0]?.p.id||candidates[0]?.id;
}
function editionTarget(u,fromId,next){
 const remembered=editionPoints.get(u.id+'/'+next),from=record(fromId),previous=record(remembered);
 const ids=p=>p?.version==='official'?[p.id]:(p?.officialIds||[]);
 // A coarse original section can cover several explanations. Returning to
 // the same topic restores the point the reader actually left in that edition.
 if(previous&&u[next].some(p=>p.id===remembered)&&ids(previous).some(id=>ids(from).includes(id)))return remembered;
 return matchTarget(u,fromId,next);
}
function routeHash(){try{const [u,v,p]=decodeURIComponent(location.hash.slice(1)).split('/');return{unit:u,version:v,point:p||''};}catch{return{};}}
function setLocation(push){const hash='#'+[unit,version,point].filter(Boolean).map(encodeURIComponent).join('/');if(location.hash!==hash)history[push?'pushState':'replaceState'](null,'',hash);}
function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);return b;}
function focusPoint(el){const target=el.querySelector('.section-heading h2,details.theory>summary,h2,h3,h4')||el;target.tabIndex=-1;target.focus({preventScroll:true});}
function showPoint(id,focus=false){const el=document.getElementById(id);if(!el||!content.contains(el))return;const theory=el.querySelector('details.theory');if(theory)theory.open=true;window.scrollTo({top:Math.max(0,window.scrollY+el.getBoundingClientRect().top-readingOffset()),behavior:'auto'});pointAnchor={id,scrollY:window.scrollY};explicitPoint=id;readingPoint=id;readingScrollIntent=false;point=id;markPoint(id);if(focus)focusPoint(el);save();setLocation(false);}
function combineHeadingNumber(section){const heading=section.querySelector('.section-heading h2'),number=section.querySelector('.section-heading .number');if(!heading||!number)return;const value=number.textContent.trim();if(value){heading.insertBefore(document.createTextNode(value+' '),heading.firstChild);heading.dataset.sectionNumber=value;}number.remove();}
// These authored calculations contain plain-text operators between MathML
// fragments. Group explicit, reviewed boundaries rather than guessing algebra
// from every paragraph. Text selectors inspect direct text nodes only; math
// selectors identify a notation source or a numbered arithmetic fragment.
const calculationGroups={
 'ch06-full-replication-call':[
  {lead:'第一步，列到期支付。',groups:[
   {id:'call-up',start:{text:'上涨时'},end:{text:')=15元'}},
   {id:'call-down',start:{text:'下跌时'},end:{text:')=0元'}}]},
  {lead:'第二步，求股票数量。',groups:[
   {id:'call-share-count',start:{text:'Δ=('},end:{text:')=0.4464285714股'}}]},
  {lead:'第三步，求借款。',groups:[
   {id:'call-down-stock-value',start:{arithmetic:0},end:{text:'元，恰好用于还债',through:'元'}},
   {id:'call-loan',start:{text:'L=31.875/'},end:{text:'元。',through:'元'}}]},
  {lead:'第四步，计算成本。',groups:[
   {id:'call-current-cost',start:{math:'C₀'},end:{text:'元，最终报价',through:'元'}}]}
 ],
 'ch06-full-hedging-principle':[
  {lead:'复制关系是',groups:[
   {id:'hedge-replication',start:{math:'C₀',occurrence:0},end:{text:'−L。',through:'−L'}},
   {id:'hedge-rearrangement',start:{text:'移项得Δ',from:'Δ'},end:{text:'=L：',through:'=L'}}]},
  {lead:'例题中，买入0.4464285714股、卖出一份期权，今天净支出',groups:[
   {id:'hedge-current-cost',start:{arithmetic:0},end:{text:'元。',through:'元'}}]},
  {lead:'上涨时组合价值',groups:[
   {id:'hedge-up-value',start:{arithmetic:0},end:{text:'元；下跌时为',through:'元'}},
   {id:'hedge-down-value',start:{arithmetic:1},end:{text:'元。确定收益率',through:'元'}},
   {id:'hedge-return',start:{text:'31.875/'},end:{arithmetic:2}}]}
 ],
 'ch06-full-risk-neutral-example':[
  {lead:'由两个到期股价得到上、下行乘数：',groups:[
   {id:'risk-up-multiplier',start:{text:'u=105/'},end:{arithmetic:0}},
   {id:'risk-down-multiplier',start:{text:'d=71.4/'},end:{arithmetic:1}},
   {id:'risk-period-rate',start:{text:'半年r=2.5%'},end:{text:'半年r=2.5%'}}]},
  {lead:'先求到期支付：',groups:[
   {id:'risk-call-up',start:{text:'上涨时'},end:{text:'＝max(105−90,0)＝15元'}},
   {id:'risk-call-down',start:{text:'下跌时'},end:{text:'＝max(71.4−90,0)＝0元'}}]},
  {lead:'第一步，q=(',groups:[
   {id:'risk-up-weight',start:{text:'q=('},end:{text:')=0.4375'}}]},
  {lead:'第二步，半年后期权的风险中性期望支付=',groups:[
   {id:'risk-expected-payment',start:{text:'风险中性期望支付=',from:'='},end:{text:'元。',through:'元'}}]},
  {lead:'第三步，折现一期：',groups:[
   {id:'risk-current-cost',start:{math:'C₀'},end:{text:'元，与复制法相同',through:'元'}}]},
  {lead:'一般式为',groups:[
   {id:'risk-general-price',start:{math:'V₀'},end:{text:']/(1+r)。',through:']/(1+r)'}},
   {id:'risk-up-coefficient',start:{text:'(1+r−d)/[(u−d)(1+r)]'},end:{text:'(1+r−d)/[(u−d)(1+r)]'}},
   {id:'risk-down-coefficient',start:{text:'(u−1−r)/[(u−d)(1+r)]'},end:{text:'(u−1−r)/[(u−d)(1+r)]'}}]}
 ]
};
function calculationBoundary(paragraph,spec,isEnd){
 const children=[...paragraph.childNodes];
 if(spec.text){
  const matches=[];
  for(const node of children){if(node.nodeType!==Node.TEXT_NODE)continue;let at=node.textContent.indexOf(spec.text);while(at!==-1){matches.push({node,at});at=node.textContent.indexOf(spec.text,at+spec.text.length);}}
  if(matches.length!==1)return null;
  const {node,at}=matches[0];
  if(spec.from&&!spec.text.endsWith(spec.from)||spec.through&&!spec.text.startsWith(spec.through))return null;
  return{node,offset:isEnd?at+(spec.through||spec.text).length:at+spec.text.length-(spec.from||spec.text).length};
 }
 const maths=children.filter(node=>node.nodeType===Node.ELEMENT_NODE&&node.matches('.authored-math'));
 const matches=spec.arithmetic!==undefined?maths.filter(node=>node.dataset.formulaKind==='arithmetic'):maths.filter(node=>node.dataset.formulaSource===spec.math);
 const selected=matches[spec.arithmetic??spec.occurrence??0];
 if(!selected||spec.arithmetic===undefined&&spec.occurrence===undefined&&matches.length!==1)return null;
 return{node:paragraph,offset:children.indexOf(selected)+(isEnd?1:0)};
}
function groupCalculations(section,id){
 for(const rule of calculationGroups[id]||[]){
  const paragraphs=[...section.querySelectorAll('p')].filter(p=>p.textContent.startsWith(rule.lead));
  if(paragraphs.length!==1){console.warn('Calculation paragraph boundary missing:',id,rule.lead);continue;}
  const paragraph=paragraphs[0],before=paragraph.textContent,ranges=[];
  for(const group of rule.groups){
   const start=calculationBoundary(paragraph,group.start,false),end=calculationBoundary(paragraph,group.end,true);
   if(!start||!end){console.warn('Calculation token boundary missing:',id,group.id);continue;}
   const range=document.createRange();range.setStart(start.node,start.offset);range.setEnd(end.node,end.offset);
   if(range.collapsed){console.warn('Calculation boundary is empty:',id,group.id);continue;}
   // A closing sentence mark belongs beside its equation, including when the
   // whole equation needs its own scrolling line. No following prose is moved.
   let tail=end.node,offset=end.offset;
   if(tail===paragraph){tail=paragraph.childNodes[offset];offset=0;}
   if(tail?.nodeType===Node.TEXT_NODE&&/[，。；：]/.test(tail.textContent[offset]||' '))range.setEnd(tail,offset+1);
   ranges.push({range,id:group.id});
  }
  // Work backwards so extracting a later group cannot split an earlier token.
  ranges.sort((a,b)=>a.range.compareBoundaryPoints(Range.START_TO_START,b.range));
  for(const {range,id:groupId} of ranges.reverse()){
   const wrap=document.createElement('span');wrap.className='formula-scroll calculation-group';wrap.dataset.calculationGroup=groupId;
   const line=document.createElement('span');line.className='calculation-line';line.append(range.extractContents());
   // MathML fragments now share one complete scroll surface and one hint.
   line.querySelectorAll('.formula-scroll').forEach(fragment=>fragment.replaceWith(...fragment.childNodes));
   const tail=line.lastChild;if(tail?.nodeType===Node.TEXT_NODE&&/[，。；：]$/.test(tail.textContent)){const mark=document.createElement('span');mark.className='equation-punctuation';mark.textContent=tail.textContent.slice(-1);tail.textContent=tail.textContent.slice(0,-1);line.append(mark);}
   wrap.append(line);range.insertNode(wrap);
  }
  if(paragraph.textContent!==before)throw new Error('Calculation text changed: '+id);
 }
}
// Compose complete inline expressions without parsing their algebra or changing
// any source character, precision, MathML subtree, sign or unit. Unknown prose
// and unmatched brackets are boundaries, never guessed mathematical operands.
function normalizeCalculationRuns(section){
 const originalText=section.textContent,originalMath=[...section.querySelectorAll('math')].map(node=>node.outerHTML);
 const functions=new Set(['max','min','ln','exp','PV','NPV','abs','log']);
 const units=/^(万元人民币|瑞士法郎|美元\/吨|元\/股|万元|美元|澳元|港元|元|股|吨|年)/;
 // This authored recurrence uses adjacent qV as multiplication. Recognize only
 // this complete expression; arbitrary English words remain prose boundaries.
 const knownRuns=section.id==='ch06-full-binomial-multiperiod'?['V(i,j)=[qV(i+1,j+1)+(1−q)V(i+1,j)]/(1+r)']:[];
 const lex=/\uFFFC|\d+(?:,\d{3})*(?:\.\d+)?(?:[eE][+−-]?\d+)?|[A-Za-z]+|[Α-Ωα-ω]|[₀-₉ₜᵤ⁰¹²³⁴⁵⁶⁷⁸⁹ⁱʲⁿᵗ⁽⁾⁻ˣ\u0304]+|[=＝≈≠≤≥<>+＋−\-×÷*/^√%_()[\]{}.,|]|\s+/y;
 for(const paragraph of section.querySelectorAll('p,td')){
  if(paragraph.matches('.formula,.equation-set')||paragraph.closest('math,.calculation-group'))continue;
  const before=paragraph.textContent,parts=[];let source='';
  for(const node of paragraph.childNodes){const start=source.length;
   if(node.nodeType===Node.TEXT_NODE)source+=node.textContent;
   else if(node.nodeType===Node.ELEMENT_NODE&&node.matches('.authored-math:not(.is-equation),math,sub,sup'))source+='\uFFFC';
   else source+='\u0000';
   parts.push({start,end:source.length,node,atom:node.nodeType!==Node.TEXT_NODE});
  }
  const boundary=(offset,end)=>{const part=parts.find(x=>end?x.start<offset&&x.end>=offset:x.start<=offset&&x.end>offset);if(!part)return null;return part.atom?{node:paragraph,offset:[...paragraph.childNodes].indexOf(part.node)+(end?1:0)}:{node:part.node,offset:offset-part.start};};
  const ranges=[];let cursor=0,unsafe=false;
  const addRange=(start,end,known=false)=>{
   const label=paragraph.tagName==='P'&&source.slice(Math.max(0,start-2),start)==='借款'?'借款':'';
   if(label)start-=label.length;
   const first=boundary(start,false),last=boundary(end,true);
   if(first&&last){const range=document.createRange();range.setStart(first.node,first.offset);range.setEnd(last.node,last.offset);ranges.push({range,label,known});}
  };
  if(paragraph.tagName==='TD'){
   // A table has one existing scroll surface. Normalize only cells made wholly
   // of known mathematical tokens, including a lone number or MathML formula.
   let end=0,operands=0,depth=[],absolute=false,valid=true;
   while(end<source.length){lex.lastIndex=end;const match=lex.exec(source);
    if(!match){const unit=source.slice(end).match(units);if(unit&&source.slice(end+unit[0].length).trim()===''){end=source.length;break;}valid=false;break;}
    const token=match[0];if(/^[A-Za-z]+$/.test(token)&&token.length>1&&!functions.has(token)){valid=false;break;}
    if('([{'.includes(token))depth.push(token);
    else if(')]}'.includes(token)&&depth.pop()!=='([{'[')]}'.indexOf(token)]){valid=false;break;}
    if(token==='|')absolute=!absolute;
    if(token==='\uFFFC'||/^[\dA-Za-zΑ-Ωα-ω]/.test(token))operands++;
    end=lex.lastIndex;
   }
   if(valid&&!depth.length&&!absolute&&operands){const range=document.createRange();range.selectNodeContents(paragraph);ranges.push({range,label:'',known:false});}
   cursor=source.length;
  }
  while(cursor<source.length){
   const known=knownRuns.find(expression=>source.startsWith(expression,cursor));
   if(known){let end=cursor+known.length;if(/[，。；：]/.test(source[end]||' '))end++;addRange(cursor,end,true);cursor=end;continue;}
   // Never retry at an English word's tail after an unknown word is rejected.
   if(/[A-Za-z]/.test(source[cursor])){if(cursor>0&&/[A-Za-z]/.test(source[cursor-1])){cursor++;continue;}const word=source.slice(cursor).match(/^[A-Za-z]+/)[0];if(word.length>1&&!functions.has(word)){cursor+=word.length;continue;}}
   if(!/[A-Za-zΑ-Ωα-ω\d\uFFFC√(+−=＝]/.test(source[cursor])){cursor++;continue;}
   const start=cursor;let end=cursor,numbers=0,variables=0,atoms=0,operators=0,relation=false,depth=[],valid=true;
   while(end<source.length){lex.lastIndex=end;const match=lex.exec(source);if(!match)break;const token=match[0];
    if(/^[A-Za-z]+$/.test(token)&&token.length>1&&!functions.has(token))break;
    if(token===','&&!depth.length)break;
    if('([{'.includes(token)){depth.push(token);}
    else if(')]}'.includes(token)){if(depth.pop()!=='([{'[')]}'.indexOf(token)]){valid=false;break;}}
    if(token==='\uFFFC')atoms++;else if(/^\d/.test(token))numbers++;else if(/^[A-Za-zΑ-Ωα-ω]/.test(token))variables++;
    if(/[=＝≈≠≤≥<>]/.test(token))relation=true;
    if(/[=＝≈≠≤≥<>+＋−\-×÷*/^√]/.test(token))operators++;
    end=lex.lastIndex;
   }
   while(end>start&&/\s/.test(source[end-1]))end--;
   if(depth.length||!valid){unsafe=true;cursor=Math.max(end,start+1);continue;}
   const meaningful=(relation&&(numbers+variables+atoms>0))||(operators>0&&numbers+variables+atoms>1);
   if(!meaningful){cursor=Math.max(end,start+1);continue;}
   const unit=source.slice(end).match(units);if(unit)end+=unit[0].length;
   if(/[，。；：]/.test(source[end]||' '))end++;
   addRange(start,end);
   cursor=Math.max(end,start+1);
  }
  // A formula with Chinese operands or uncertain parentheses stays untouched.
  if(unsafe)continue;
  for(const [i,{range,label,known}] of ranges.reverse().entries()){
   const wrap=document.createElement('span');wrap.className=paragraph.tagName==='TD'?'calculation-group table-calculation':'formula-scroll calculation-group';wrap.dataset.calculationGroup='inline-'+i;
   const line=document.createElement('span');line.className='calculation-line';line.append(range.extractContents());
   if(known)line.dataset.knownCalculation='binomial-recurrence';
   if(label){const first=line.firstChild;if(first?.nodeType!==Node.TEXT_NODE||!first.textContent.startsWith(label))throw new Error('Calculation label boundary changed: '+section.id);const prefix=document.createElement('span');prefix.className='math-prose calculation-label';prefix.textContent=label;first.textContent=first.textContent.slice(label.length);line.prepend(prefix);}
   line.querySelectorAll('.formula-scroll').forEach(fragment=>fragment.replaceWith(...fragment.childNodes));
   const tail=line.lastChild;if(tail?.nodeType===Node.TEXT_NODE&&/[，。；：]$/.test(tail.textContent)){const mark=document.createElement('span');mark.className='equation-punctuation';mark.textContent=tail.textContent.slice(-1);tail.textContent=tail.textContent.slice(0,-1);line.append(mark);}
   wrap.append(line);range.insertNode(wrap);
  }
  if(paragraph.textContent!==before)throw new Error('Formula presentation text changed: '+section.id);
 }
 // Plain operands and MathML now share a font and baseline. Units/labels retain
 // the body face; operators receive spacing without replacing their characters.
 for(const line of section.querySelectorAll('.calculation-line')){
  const walker=document.createTreeWalker(line,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement.closest('math,.authored-math,.equation-punctuation')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){const text=node.textContent,fragment=document.createDocumentFragment();let last=0;
   const token=/万元人民币|瑞士法郎|美元\/吨|元\/股|万元|美元|澳元|港元|元|股|吨|年|\d+(?:,\d{3})*(?:\.\d+)?|[A-Za-z]+|[Α-Ωα-ω]|[₀-₉ₜᵤ⁰¹²³⁴⁵⁶⁷⁸⁹ⁱʲⁿᵗ⁽⁾⁻ˣ\u0304]+|[=＝≈≠≤≥<>+＋−\-×÷*/%_()[\]{}.,^√|]/g;
   for(const match of text.matchAll(token)){if(match.index>last){const prose=document.createElement('span');prose.className='math-prose';prose.textContent=text.slice(last,match.index);fragment.append(prose);}
    const value=match[0],span=document.createElement('span');span.textContent=value;
    if(units.test(value))span.className='math-prose';
    else if(/^\d/.test(value))span.className='math-number';
    else if(/^[A-Za-z]+$/.test(value))span.className=value.length===1||value==='qV'&&line.dataset.knownCalculation==='binomial-recurrence'?'math-variable':'math-function';
    else if(/[α-ω]/.test(value))span.className='math-variable';
    else if(/^[=＝≈≠≤≥<>+＋−\-×÷*/]$/.test(value)){span.className='math-operator';if(/[=＝≈≠≤≥<>]/.test(value))span.classList.add('is-relation');const previous=text.slice(0,match.index).trimEnd().slice(-1);if(/[+＋−\-]/.test(value)&&(!previous&&!node.previousSibling||/[=＝(\[,{+＋−\-×÷*/]/.test(previous)))span.classList.add('is-unary');}
    else span.className='math-symbol';
    fragment.append(span);last=match.index+value.length;
   }
   if(last<text.length){const prose=document.createElement('span');prose.className='math-prose';prose.textContent=text.slice(last);fragment.append(prose);}
   node.replaceWith(fragment);
  }
 }
 if(section.textContent!==originalText||JSON.stringify([...section.querySelectorAll('math')].map(node=>node.outerHTML))!==JSON.stringify(originalMath))throw new Error('Formula source changed: '+section.id);
}
function decorate(section,p){
 combineHeadingNumber(section);
 // Apply reading roles to authored prose without rewriting the source material.
 if(version!=='official'){
  section.querySelectorAll('details').forEach(answer=>{if(!/查看解析/.test(answer.querySelector('summary')?.textContent||''))return;if(answer.closest('.reading-exercise')){answer.classList.add('answer');return;}const question=answer.previousElementSibling;if(question?.tagName!=='P')return;const exercise=document.createElement('div');exercise.className='reading-exercise';question.before(exercise);exercise.append(question,answer);answer.classList.add('answer');});
  section.querySelectorAll('p').forEach(paragraph=>{const lead=paragraph.firstElementChild;if(lead?.tagName==='STRONG'&&/^(练习[一二三四五]?|再想一步|思考)$/.test(lead.textContent.trim())){paragraph.classList.add('reading-prompt');lead.classList.add('reading-label');}});
 }
 if(p.extension){const heading=section.querySelector('.section-heading');if(heading)heading.remove();const d=document.createElement('details');d.className='theory';const s=document.createElement('summary');s.textContent='理论拓展 · '+p.title;d.append(s);const n=document.createElement('p');n.className='theory-context';n.textContent='本段讨论特定模型条件下的边界。阅读教材主线后再展开，对照时保留合约与参数前提。';d.append(n);while(section.firstChild)d.append(section.firstChild);section.append(d);}
 if(version==='official'){
   const images=[...section.querySelectorAll('img')],notes=imageNotes[p.id]||[];
   if(images.length!==notes.length)throw new Error('Incomplete textbook image explanation: '+p.id);
   images.forEach((img,i)=>{const note=notes[i];if(note.cellText){img.replaceWith(document.createTextNode(note.cellText));return;}const explanation=document.createElement('aside');explanation.className='original-image-note';explanation.setAttribute('aria-label',note.label+'的文字说明，编者补充');const label=document.createElement('p');label.className='original-image-label';label.textContent='编者补充 · '+note.label+'的文字说明';explanation.append(label);const template=document.createElement('template');template.innerHTML=note.html;explanation.append(template.content);const parent=img.parentElement;if(parent.tagName==='P'&&parent.children.length===1&&!parent.textContent.trim())parent.replaceWith(explanation);else img.replaceWith(explanation);});
   section.querySelectorAll('td').forEach(cell=>{const tex=cell.textContent.trim();if(!cell.querySelector('math')&&mathCells[tex]){cell.dataset.originalTex=tex;cell.innerHTML=mathCells[tex];}});
   const issues=original.source.issues.filter(i=>i.blockId===p.id&&i.severity==='warning');if(issues.length){const note=document.createElement('div');note.className='transcription-note';note.textContent='原转换文件提示：'+issues.map(i=>i.detail).join(' ');section.prepend(note);}
 }
 section.querySelectorAll('table').forEach(table=>{const wrap=document.createElement('div');wrap.className='table-scroll';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',p.title+'，表格可横向滚动');table.before(wrap);wrap.append(table);});
 section.querySelectorAll('math').forEach(math=>{const wrap=document.createElement('span');wrap.className='formula-scroll'+(math.getAttribute('display')==='block'?' is-display':'');math.before(wrap);wrap.append(math);});
 // In derivations, give each complete equation its own line. Punctuation travels
 // with the equation so narrow screens never begin a line with a full stop.
 if(['ch06-full-bs-formula','ch06-full-bs-dividend-yield','ch06-full-replication-equations'].includes(p.id))section.querySelectorAll('[data-formula-kind=catalog]').forEach(el=>{if(!/[=＝]/.test(el.dataset.formulaSource)||el.closest('.takeaway'))return;el.classList.add('is-equation');const next=el.nextSibling,wrap=el.querySelector('.formula-scroll');if(next?.nodeType===Node.TEXT_NODE&&/^[，。；]/.test(next.textContent)){const punctuation=document.createElement('span');punctuation.className='equation-punctuation';punctuation.textContent=next.textContent[0];next.textContent=next.textContent.slice(1);wrap.append(punctuation);}});
 // Authored equation-only paragraphs form a centered, internally aligned set;
 // paragraphs containing Chinese explanations keep their normal prose flow.
 section.querySelectorAll('p:has(> .authored-math.is-equation)').forEach(paragraph=>{if([...paragraph.childNodes].every(node=>node.nodeType===Node.TEXT_NODE?!node.textContent.trim():node.nodeType===Node.ELEMENT_NODE&&node.matches('.authored-math.is-equation')))paragraph.classList.add('equation-set');});
 if(version==='detailed')groupCalculations(section,p.id);
 if(version!=='official')normalizeCalculationRuns(section);
 section.querySelectorAll('img').forEach(img=>{img.alt=img.alt||p.title+'：教材配图';img.decoding='async';});
}
async function navigate(nextUnit,nextVersion,nextPoint='',push=true,focus=false){
 if(!manifest)return;const u=manifest.units.find(x=>x.id===nextUnit);if(!u||!versions.includes(nextVersion))return;
 closeReadingTools();setPageToc(false);closeMobileChapterNav();clearTimeout(scrollTimer);cancelAnimationFrame(scrollFrame);scrollFrame=0;pointAnchor=null;explicitPoint='';readingPoint='';readingScrollIntent=false;const seq=++requestId;pending={unit:nextUnit,version:nextVersion,point:nextPoint};loading=true;content.setAttribute('aria-busy','true');$('#load-error').hidden=true;
 try{
  let data;if(nextVersion!=='official'){if(!cache.has(u.id))cache.set(u.id,getJSON('data/'+u.id+'.json'));try{data=await cache.get(u.id);}catch(e){cache.delete(u.id);throw e;}}
  if(seq!==requestId)return;
  unit=u.id;version=nextVersion;point=nextPoint&&u[version].some(p=>p.id===nextPoint)?nextPoint:'';
  const points=version==='official'?u.official.map(p=>original.blocks.find(b=>b.id===p.id)):data[version];
  setText('#unit-eyebrow',String(u.number).padStart(2,'0')+' · '+u.title);setText('#unit-title',u.title);setText('#unit-lead',u.lead);document.title=u.title+' · '+names[version]+' · 第六章';
  document.querySelectorAll('[data-version]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.version===version)));
  document.querySelectorAll('#chapter-toc button').forEach(b=>{if(b.dataset.unit===unit)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});if($('#unit-select'))$('#unit-select').value=unit;
  const notes={official:'原文 · 教材叙述、例题、公式与计算表。',detailed:'精讲 · 理解原理，逐步推导并完成计算。',recap:'串讲 · 梳理关系，回顾公式与关键结论。'};
  setText('#version-note',notes[version]);setText('#unit-contents-label','本页目录');
  $('#unit-toc').setAttribute('aria-label',u.title+'，本页目录，共'+points.length+'个知识点');
  setText('#source-notice',version==='official'?'2026 年《财务成本管理》· 用户上传教材转换文本。表格和长公式可横向滚动。':version==='detailed'?'配套讲解 · 与原文按主题对应；教学算例与教材例题分别标明。本文Δ亦称H，q表示风险中性上行概率。':'复习稿 · S₀表示现价，Sₜ表示到期价，X或K表示执行价格；计算前先确认单位、期限与利率口径。');
  const frag=document.createDocumentFragment();for(const p of points){let section;if(version==='official'){section=document.createElement('section');section.id=p.id;section.className='original-block';section.innerHTML=p.html;}else{const template=document.createElement('template');template.innerHTML=p.html;section=template.content.firstElementChild;}section.dataset.readingPoint=p.id;decorate(section,p);frag.append(section);}content.replaceChildren(frag);content.setAttribute('aria-label',u.title+' · '+names[version]);content.dataset.version=version;content.dataset.unit=unit;content.setAttribute('aria-busy','false');
  $('#unit-toc').replaceChildren(...points.map(p=>{const section=document.getElementById(p.id),heading=section?.querySelector('.section-heading h2');const b=button(heading?.textContent.trim()||p.title,()=>{closeReadingTools();setPageToc(false);showPoint(p.id,true);});b.className='page-toc-link';b.dataset.point=p.id;return b;}));markPoint(point||points[0]?.id);syncPageToc();
  formulaObserver.disconnect();content.querySelectorAll('.formula-scroll').forEach(el=>formulaObserver.observe(el));
  $('#unit-counter').textContent=u.number+' / 8';$('#previous').disabled=u.number===1;$('#next').disabled=u.number===8;
  $('#previous').textContent=u.number===1?'已到章首':'← '+manifest.units[u.number-2].title;$('#next').textContent=u.number===8?'已到章末':manifest.units[u.number].title+' →';
  save();setLocation(push);loading=false;$('#reader-status').textContent=u.title+'，已显示'+names[version];
  if(point){const selectedPoint=point;requestAnimationFrame(()=>{if(seq===requestId)showPoint(selectedPoint,focus);});}else{window.scrollTo(0,0);if(focus){const title=$('#unit-title'),first=content.querySelector('section');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}else if(first)focusPoint(first);}}
 }catch(error){if(seq!==requestId)return;loading=false;content.setAttribute('aria-busy','false');$('#load-error').hidden=false;$('#reader-status').textContent='内容载入失败，可以重试。';}
}
async function boot(){
 $('#load-error').hidden=true;
 try{
  [manifest,original,mathCells,imageNotes]=await Promise.all([getJSON('manifest.json'),getJSON('official.json'),getJSON('math-cells.json'),getJSON('official-image-notes.json')]);
  for(const u of manifest.units)for(const v of versions)for(const p of u[v])index.set(p.id,{...p,unit:u.id,version:v});
  $('#chapter-toc').replaceChildren(...manifest.units.map(u=>{const b=button('',()=>navigate(u.id,version,'',true,true));b.dataset.unit=u.id;const n=document.createElement('span');n.textContent=String(u.number).padStart(2,'0');b.append(n,document.createTextNode(u.title));return b;}));
  $('#unit-select').replaceChildren(...manifest.units.map(u=>{const o=document.createElement('option');o.value=u.id;o.textContent=String(u.number).padStart(2,'0')+' '+u.title;return o;}));
  const saved=getSaved(),hash=routeHash(),initial=manifest.units.some(u=>u.id===hash.unit)?hash:saved;
  await navigate(manifest.units.some(u=>u.id===initial.unit)?initial.unit:'u01',versions.includes(initial.version)?initial.version:'official',initial.point||'',false);
 }catch(e){$('#load-error').hidden=false;content.setAttribute('aria-busy','false');setText('#unit-title','第六章 · 期权价值评估');}
}
$('#retry').addEventListener('click',()=>{if(manifest&&pending)navigate(pending.unit,pending.version,pending.point,false);else boot();});
$('#unit-select')?.addEventListener('change',e=>navigate(e.target.value,version,'',true,true));
function finishReadingScroll(){readingScrollIntent=false;clearTimeout(scrollTimer);cancelAnimationFrame(scrollFrame);scrollFrame=0;if(readingPoint){point=readingPoint;markPoint(point);}}
document.querySelectorAll('[data-version]').forEach(b=>{b.addEventListener('pointerdown',finishReadingScroll);b.addEventListener('focus',finishReadingScroll);b.addEventListener('click',()=>{if(!manifest||b.dataset.version===version)return;const id=readingPoint||pointAnchor?.id||point||visiblePoint();editionPoints.set(unit+'/'+version,id);navigate(unit,b.dataset.version,editionTarget(currentUnit(),id,b.dataset.version),true,true);});});
$('#previous').addEventListener('click',()=>{const n=currentUnit()?.number;if(n>1)navigate(manifest.units[n-2].id,version,'',true,true);});
$('#next').addEventListener('click',()=>{const n=currentUnit()?.number;if(n<8)navigate(manifest.units[n].id,version,'',true,true);});
content.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'',id=href.includes('#')?decodeURIComponent(href.split('#')[1]):'',target=record(id);if(target){e.preventDefault();navigate(target.unit,target.version,id,true,true);}});
window.addEventListener('popstate',()=>{const s=routeHash();if(manifest)navigate(s.unit,s.version,s.point,false,true);});
function releaseExplicitPoint(e){
 if(e.type==='wheel'&&Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
 if(e.type==='keydown'&&(!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key)||e.target.closest?.('button,a,select,summary,input,textarea')))return;
 explicitPoint='';pointAnchor=null;readingScrollIntent=true;
}
window.addEventListener('wheel',releaseExplicitPoint,{passive:true});
window.addEventListener('touchmove',releaseExplicitPoint,{passive:true});
window.addEventListener('keydown',releaseExplicitPoint);
window.addEventListener('scroll',()=>{if(loading||!manifest)return;const seq=requestId;if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;if(!loading&&seq===requestId){point=visiblePoint();if(readingScrollIntent)readingPoint=point;markPoint(point);}});clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(loading||!manifest||seq!==requestId)return;point=visiblePoint();if(readingScrollIntent)readingPoint=point;readingScrollIntent=false;markPoint(point);save();setLocation(false);},250);},{passive:true});
window.addEventListener('scrollend',()=>{if(!loading&&readingScrollIntent){point=visiblePoint();readingPoint=point;readingScrollIntent=false;markPoint(point);save();setLocation(false);}},{passive:true});
boot();
})();
