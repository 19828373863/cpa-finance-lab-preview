(()=>{'use strict';
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg',state={s:39,fee:3.8,full:false,step:2},K=37;
const fmt=n=>Math.abs(n)<1e-8?'0':Number(n.toFixed(4)).toLocaleString('zh-CN',{maximumFractionDigits:4});
let motion=null,copy=null,deltaY=0,originalPath=null;
function node(tag,a={},text){const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function txt(svg,x,y,text,anchor='start',cls='figure-label'){svg.append(node('text',{x,y,'text-anchor':anchor,'dominant-baseline':'central',class:cls},text));}
function path(svg,d,cls){const p=node('path',{d,class:cls,fill:'none'});svg.append(p);return p;}
function stop(message){if(motion){motion.onfinish=null;motion.cancel();motion=null;}copy?.remove();copy=null;originalPath?.classList.remove('is-muted');$('#pause').disabled=true;$('#finish').disabled=true;$('#pause').textContent='暂停';if(message)$('#motion-status').textContent=message;}
function scenarios(){return [{s:35,label:'不行权',key:'no'},{s:state.fee===3.8?39:K+state.fee/2,label:'行权仍亏',key:'loss'},{s:K+state.fee,label:'恰好回本',key:'even'},{s:K+state.fee+4.2,label:'开始盈利',key:'gain'}];}
function describe(s,payoff,profit){if(s<=K)return `到期股价不高于37元，执行净收入为0；${state.fee===0?'本例费用也为0，整笔损益为0。':`不行权仍损失已付费用${fmt(state.fee)}元。`}`;if(Math.abs(profit)<1e-8)return `行权得到${fmt(payoff)}元，刚好覆盖${fmt(state.fee)}元费用，整笔回本。`;return profit<0?`行权得到${fmt(payoff)}元，但尚未覆盖${fmt(state.fee)}元费用，因此整笔亏${fmt(-profit)}元。`:`行权得到${fmt(payoff)}元，扣除${fmt(state.fee)}元费用，整笔盈利${fmt(profit)}元。`;}
function draw(){
 const host=$('#call-plot'),w=Math.max(260,host.clientWidth),h=360,L=38,R=w-94,T=64,B=286,xMin=state.full?0:25,xMax=state.full?70:55,yMin=-14,yMax=state.full?35:20;
 const x=v=>L+(v-xMin)/(xMax-xMin)*(R-L),y=v=>B-(v-yMin)/(yMax-yMin)*(B-T),payoff=Math.max(state.s-K,0),profit=payoff-state.fee;
 const svg=node('svg',{viewBox:`0 0 ${w} ${h}`,width:w,height:h,role:'img','aria-labelledby':'call-svg-title call-svg-desc'});
 svg.append(node('title',{id:'call-svg-title'},'看涨买方：执行价与回本价不同'),node('desc',{id:'call-svg-desc'},`横轴为到期股价，纵轴为每股金额。执行价37元，回本价${fmt(K+state.fee)}元。实线为执行净收入，虚线为扣除${fmt(state.fee)}元后的净损益。当前股价${fmt(state.s)}元，收入${fmt(payoff)}元，净损益${fmt(profit)}元。关键情景表在图后。`));
 if(state.fee>0)svg.append(node('rect',{x:x(K),y:T,width:x(K+state.fee)-x(K),height:B-T,class:'figure-band'}));

 for(const v of [-10,0,10,20,...(state.full?[30]:[])]){path(svg,`M${L} ${y(v)}H${R}`,v===0?'figure-axis':'figure-grid');txt(svg,L-8,y(v),String(v),'end');}
 path(svg,`M${L} ${T}V${B}`,'figure-axis');
 for(const v of (state.full?[0,20,37,55,70]:[25,37,55])){path(svg,`M${x(v)} ${B}v5`,'figure-axis');txt(svg,x(v),B+21,String(v),'middle');}
 txt(svg,w-2,342,'到期股价 Sₜ（元）','end');
 for(const[v,label,cy]of state.fee===0?[[K,'1=2',26]]:[[K,'1',18],[K+state.fee,'2',46]]){path(svg,`M${x(v)} ${cy+14}V${B}`,'figure-guide');svg.append(node('circle',{cx:x(v),cy,r:label==='1=2'?18:11,class:'badge-circle'}));txt(svg,x(v),cy,label,'middle','figure-badge-text');}
 const xs=[xMin,K,xMax],d=offset=>xs.map((s,i)=>(i?'L':'M')+x(s)+' '+y(Math.max(s-K,0)-offset)).join(' ');
 const income=path(svg,d(0),'figure-series-main');income.id='income-line';originalPath=path(svg,d(state.fee),'figure-series-compare');originalPath.id='profit-line';
 const mainY=y(xMax-K),profitY=y(xMax-K-state.fee);if(state.fee===0)txt(svg,R+8,mainY,'收入=损益');else{const a=Math.max(T,mainY-8),b=Math.max(a+24,profitY+5);path(svg,`M${R} ${mainY}L${R+5} ${a}`,'figure-guide');txt(svg,R+8,a,'到期净收入');path(svg,`M${R} ${profitY}L${R+5} ${b}`,'figure-guide');txt(svg,R+8,b,'净损益');}
 svg.append(node('circle',{cx:x(K),cy:y(0),r:5,class:'key-circle'}));if(state.fee>0)svg.append(node('circle',{cx:x(K+state.fee),cy:y(0),r:5,class:'key-circle'}));
 path(svg,`M${x(state.s)} ${y(payoff)}V${y(profit)}`,'figure-axis');svg.append(node('rect',{x:x(state.s)-4,y:y(payoff)-4,width:8,height:8,class:'current-dot'}),node('rect',{x:x(state.s)-4,y:y(profit)-4,width:8,height:8,class:'current-dot current-loss'}));
 deltaY=state.fee*(B-T)/(yMax-yMin);host.replaceChildren(svg);
 $('#plot-range').textContent=state.full?'完整演示区间 · 0–70 元':'分界附近 · 25–55 元';$('#zoom').textContent=state.full?(state.s<25||state.s>55?'回到39元并放大分界':'放大两个分界'):'看完整范围';
}
function render(){
 const payoff=Math.max(state.s-K,0),profit=payoff-state.fee;for(const e of document.querySelectorAll('[data-fee]'))e.textContent=fmt(state.fee);for(const e of document.querySelectorAll('[data-even-number]'))e.textContent=fmt(K+state.fee);
 $('#current-stock').textContent=fmt(state.s);$('#payoff').textContent=fmt(payoff);$('#profit').textContent=fmt(profit);$('#substitution').textContent=`max(${fmt(state.s)} − 37, 0) − ${fmt(state.fee)} = ${fmt(profit)}`;$('#explanation').textContent=describe(state.s,payoff,profit);
 $('#stock').value=state.s;$('#stock-number').value=state.s;$('#stock').setAttribute('aria-valuetext',fmt(state.s)+'元');$('#fee').value=state.fee;$('#fee-number').value=state.fee;
 for(const c of scenarios()){const b=$(`[data-scenario=${c.key}]`);b.querySelector('span').textContent=fmt(c.s)+' 元';b.disabled=c.key==='loss'&&state.fee===0;b.title=b.disabled?'期权费为0时，没有行权仍亏的区间':'';b.setAttribute('aria-pressed',String(Math.abs(state.s-c.s)<1e-8));}
 document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.step)===state.step)));
 $('#step-explanation').textContent=[`先只算到期净收入：max(${fmt(state.s)} − 37, 0) = ${fmt(payoff)}。37元是执行价，与已付费用无关。`,`再把每一种股价对应的收入都减去${fmt(state.fee)}元。所有情景扣同一笔费用，所以整条线平行下移，当前损益为${fmt(profit)}元。`,state.fee===0?'费用为0时，两条线重合；执行价与回本价都为37元，不存在“行权仍亏”区间。':`回本时，Sₜ − 37 = ${fmt(state.fee)}，所以Sₜ = ${fmt(K+state.fee)}。37决定是否有执行收入，${fmt(K+state.fee)}决定是否赚回成本。`][state.step];
 $('#scenario-table').replaceChildren(...[0,35,37,...scenarios().slice(1).map(c=>c.s)].filter((x,i,a)=>a.indexOf(x)===i).map(s=>{const tr=document.createElement('tr'),p=Math.max(s-K,0),v=p-state.fee;for(const text of [fmt(s),fmt(p),fmt(v),describe(s,p,v)]){const td=document.createElement('td');td.textContent=text;tr.append(td);}return tr;}));
 draw();$('#call-lesson').dataset.state=JSON.stringify(state);$('#call-lesson').dataset.step=state.step;
}
function change(values){stop('条件已更新，可重新演示。');for(const e of document.querySelectorAll('[aria-invalid]'))e.removeAttribute('aria-invalid');Object.assign(state,values);if(state.s<25||state.s>55)state.full=true;$('#input-error').textContent='';render();}
for(const id of ['stock','fee']){const key=id==='stock'?'s':'fee',limit=id==='stock'?70:12;$('#'+id).addEventListener('input',e=>change({[key]:Number(e.target.value)}));$('#'+id+'-number').addEventListener('change',e=>{const n=e.target.valueAsNumber;if(!Number.isFinite(n)||n<0||n>limit){e.target.setAttribute('aria-invalid','true');$('#input-error').textContent=`请输入0到${limit}之间的${id==='stock'?'股价':'期权费'}，当前图仍使用上一个有效数值。`;return;}e.target.removeAttribute('aria-invalid');change({[key]:n});});}
document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>change({s:scenarios().find(c=>c.key===b.dataset.scenario).s})));
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{change({step:Number(b.dataset.step)});if(state.step===1)$('#play').click();}));
$('#zoom').addEventListener('click',()=>{stop();state.full=!state.full;if(!state.full&&(state.s<25||state.s>55))state.s=39;render();});
$('#play').addEventListener('click',()=>{stop();state.step=1;render();if(matchMedia('(prefers-reduced-motion: reduce)').matches||state.fee===0){$('#motion-status').textContent=state.fee===0?'费用为0，两条线重合，无需平移。':'已按减少动态效果设置直接展示最终关系。';return;}copy=originalPath.cloneNode();copy.removeAttribute('id');copy.classList.add('moving-copy');originalPath.after(copy);originalPath.classList.add('is-muted');motion=copy.animate([{transform:`translateY(${-deltaY}px)`},{transform:'translateY(0px)'}],{duration:1200,easing:'cubic-bezier(.4,0,.2,1)'});motion.onfinish=()=>stop('演示结束：整条收入线扣除同一笔费用。可以重播。');$('#pause').disabled=false;$('#finish').disabled=false;$('#motion-status').textContent='推导中：橙色辅助线整体下移；结果区保留最终金额。';});
$('#pause').addEventListener('click',()=>{if(!motion)return;if(motion.playState==='paused'){motion.play();$('#pause').textContent='暂停';$('#motion-status').textContent='继续演示整条线扣除费用。';}else{motion.pause();$('#pause').textContent='继续';$('#motion-status').textContent='已暂停；中间位置是推导过程，不是新的报价。';}});
$('#finish').addEventListener('click',()=>stop('已直接显示最终损益线。'));
$('#reset').addEventListener('click',()=>{Object.assign(state,{s:39,fee:3.8,full:false,step:2});for(const n of document.querySelectorAll('[aria-invalid]'))n.removeAttribute('aria-invalid');change({});$('#transfer-form').reset();$('#transfer-feedback').textContent='';});
$('#transfer-form').addEventListener('submit',e=>{e.preventDefault();const a=new FormData(e.currentTarget).get('answer');$('#transfer-feedback').textContent=a==='b'?'判断正确：行权收入为52−50=2元，扣4元费用后净损益−2元；回本需要股价达到54元。':a==='a'?'2元只是执行净收入。还要扣今天已经支付的4元费用，净损益是−2元；回本价为54元。':'即使整笔仍亏，行权也比不行权多收回2元。不行权损失4元，行权后只亏2元；回本价为54元。';});
let theme=document.documentElement.dataset.theme||'system';$('#appearance').value=theme;$('#appearance').addEventListener('change',e=>{theme=e.target.value;if(theme==='system')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=theme;try{localStorage.setItem('cpa-reader-appearance',theme);}catch{}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop('已停止播放，可重新演示。');});window.addEventListener('pagehide',()=>stop());matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches)stop('已停止动画，保留最终结果。');});
let tableWasOpen=false;window.addEventListener('beforeprint',()=>{stop();tableWasOpen=$('.equivalent').open;$('.equivalent').open=true;});window.addEventListener('afterprint',()=>{$('.equivalent').open=tableWasOpen;});
new ResizeObserver(()=>{stop();draw();}).observe($('#call-plot'));render();
})();
