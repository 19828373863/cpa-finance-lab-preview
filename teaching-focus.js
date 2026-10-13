/* Concept comparisons use explicit, stable domains. Sliders move observations,
   never the viewing window. Income and profit remain separate quantities. */
(()=>{'use strict';
const NS='http://www.w3.org/2000/svg',M=window.CpaTeachingModels;
const fmt=(n,d=2)=>(Math.abs(n)<1e-9?0:n).toLocaleString('zh-CN',{maximumFractionDigits:d});
const fixed=(n,d)=>Number(n).toFixed(d),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const el=(tag,cls='',text)=>{const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const sv=(tag,a={},text)=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;};
function line(s,d,cls){const p=sv('path',{d,fill:'none',class:cls});s.append(p);return p;}
function text(s,x,y,value,cls='focus-tick',anchor='start'){const t=sv('text',{x,y,class:cls,'text-anchor':anchor},value);s.append(t);return t;}
function circle(s,x,y,cls,r=5){const p=sv('circle',{cx:x,cy:y,r,class:cls});s.append(p);return p;}
function panel(host,key,title,subtitle){const box=el('div','focus-panel');box.dataset.panel=key;box.append(el('h4','focus-heading',title),el('p','focus-subtitle',subtitle));host.append(box);return box;}
function chart(box,{key,x,y,xticks,yticks,h=400,bottom=62,right=24,unit,xlabel,desc,digits=0}){
 const w=Math.max(200,Math.round(box.getBoundingClientRect().width)),L=y[1]>999?64:48,R=w-right,T=38,B=h-bottom;
 const X=v=>L+(v-x[0])/(x[1]-x[0])*(R-L),Y=v=>B-(v-y[0])/(y[1]-y[0])*(B-T);
 const s=sv('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':desc,class:'focus-chart','data-domain-x':JSON.stringify(x),'data-domain-y':JSON.stringify(y),'data-panel':key});
 s.append(sv('title',{},desc),sv('desc',{},'坐标范围固定；当前价格、对应收入与净损益同时写在图下，滑块可用方向键操作。'));
 text(s,L,19,unit,'focus-unit');
 for(const v of yticks){line(s,`M${L} ${Y(v)}L${R} ${Y(v)}`,v===0?'focus-zero':'focus-grid');text(s,L-8,Y(v)+5,fmt(v),'focus-tick','end');}
 line(s,`M${L} ${T}L${L} ${B}L${R} ${B}`,'focus-axis');
 for(const v of xticks){line(s,`M${X(v)} ${B}L${X(v)} ${B+5}`,'focus-axis');text(s,X(v),B+24,digits?fixed(v,digits):fmt(v),'focus-tick','middle');}
 text(s,(L+R)/2,h-10,xlabel,'focus-axis-title','middle');box.append(s);
 return{s,w,h,L,R,T,B,X,Y,x,y};
}
function curve(g,fn,knots,cls){const xs=[...new Set([g.x[0],...knots.filter(v=>v>g.x[0]&&v<g.x[1]),g.x[1]])].sort((a,b)=>a-b);const p=line(g.s,xs.map((v,i)=>(i?'L':'M')+g.X(v)+' '+g.Y(fn(v))).join(''),cls);p.dataset.values=JSON.stringify(xs.map(v=>[v,fn(v)]));return p;}
function observation(g,price,value,cls){if(price<g.x[0]||price>g.x[1])return false;line(g.s,`M${g.X(price)} ${g.T}L${g.X(price)} ${g.B}`,'focus-observation');circle(g.s,g.X(price),g.Y(value),cls+' focus-current',6);return true;}
function label(g,x,y,lines,{anchor='start',cls='focus-key-label',lead}={}){
 const xx=clamp(x,g.L+4,g.R-4),rowHeight=20,width=Math.max(...lines.map(v=>[...String(v)].reduce((sum,ch)=>sum+(ch.charCodeAt(0)>255?15:8.5),0)))+12,left=anchor==='end'?xx-width:anchor==='middle'?xx-width/2:xx-6;
 if(lead)line(g.s,`M${lead[0]} ${lead[1]}L${xx} ${y+lines.length*rowHeight-8}`,'focus-leader');
 g.s.append(sv('rect',{x:Math.max(0,left),y:y-16,width:Math.min(width,g.w-Math.max(0,left)),height:lines.length*rowHeight+1,rx:2,class:'focus-label-backing'}));
 lines.forEach((v,i)=>text(g.s,xx,y+i*rowHeight,v,cls,anchor));
}
function amount(box,label,value,detail){const readout=el('div','focus-readout');readout.append(el('span','focus-readout-label',label),el('strong','',value),el('span','focus-readout-detail',detail));box.append(readout);}
function prepare(c,kind){c.fig.classList.add('tf-focus');c.fig.dataset.focusKind=kind;c.visual.classList.add('focus-host');}
function locked(c){
 prepare(c,'locked');
 c.context('沿用本章保护例：股票买价58元，执行价60元，看跌期权费6元；一份期权对应1股。下图比较到期收入，均以元/股计；净损益另扣初始投入，忽略股利、税费与资金时间价值。');
 c.range('同一个到期股价','s',50,0,120,1,'元/股');
 c.draw(()=>{
  const s=c.s.s,k=60,p=M.put(s,k),income=s+p,host=el('div','focus-pair focus-locked');host.dataset.price=s;c.visual.append(host);
  const left=panel(host,'protect','股票＋看跌：水平保底','股价低于60时，股票少1元，期权补1元。');
  const right=panel(host,'put','单独看跌：金额有上限','收入继续增加，到股价为0才达到最大值。');
  for(const[box,key]of[[left,'protect'],[right,'put']]){
   const g=chart(box,{key,x:[0,120],y:[0,130],xticks:[0,60,120],yticks:[0,60,120],h:400,unit:'到期收入（元/股）',xlabel:'到期股价（元/股）',desc:key==='protect'?'股票与看跌期权相加，在低股价区形成60元的收入底线':'看跌多头收入随股价下降而增加，股价0元时达到最大60元'});
   line(g.s,`M${g.X(k)} ${g.T+18}L${g.X(k)} ${g.B}`,'focus-strike');text(g.s,g.X(k),g.T+8,'执行价60','focus-key-label','middle');
   if(key==='protect'){
    curve(g,x=>x,[k],'focus-stock');curve(g,x=>M.put(x,k),[k],'focus-component');curve(g,x=>Math.max(x,k),[k],'focus-income');
    label(g,g.L+10,g.Y(k)-15,['收入底线60元']);
    text(g.s,g.X(24),g.Y(13),'股票','focus-part-label','middle');text(g.s,g.X(17),g.Y(50),'看跌','focus-part-label','middle');
    text(g.s,g.X(86),g.Y(105),'组合收入','focus-key-label','middle');observation(g,s,income,'focus-income');
    amount(box,`当前股价${fmt(s)}元`,`${fmt(s)}＋${fmt(p)}＝${fmt(income)}元`,'股票市值＋看跌执行净收入＝组合到期收入');
    const note=el('p','focus-profit-note',`初始投入58＋6＝64元；净损益 ${fmt(income)}−64＝${fmt(income-64)}元。`);note.dataset.profit=income-64;box.append(note);
   }else{
    curve(g,x=>M.put(x,k),[k],'focus-income');circle(g.s,g.X(0),g.Y(k),'focus-boundary',5);
    label(g,g.L+12,g.T+55,['最大收入60元','只在股价0元达到'],{lead:[g.X(0),g.Y(k)]});
    label(g,g.X(91),g.Y(0)-15,['最低收入0元'],{anchor:'middle'});observation(g,s,p,'focus-income');
    amount(box,`当前股价${fmt(s)}元`,`max(60−${fmt(s)}, 0)＝${fmt(p)}元`,'看跌执行净收入；低股价区没有水平封顶段');
    const note=el('p','focus-profit-note',`初始期权费6元；净损益 ${fmt(p)}−6＝${fmt(p-6)}元，最大净收益54元。`);note.dataset.profit=p-6;box.append(note);
   }
  }
  c.result(`同一股价${fmt(s)}元：组合收入${fmt(income)}元；单独看跌收入${fmt(p)}元。`,'左图的底线由两项抵销形成；右图的最大金额来自股价不能小于0。两图均画收入，净损益再减各自初始投入。',[]);
 });
}
function fx(c){
 prepare(c,'fx');
 c.context('教材欧元期权组合：执行汇率7.763人民币元/欧元；看涨费0.001、看跌费0.0005元/欧元。名义本金以万欧元计，因此计算结果为万元人民币。仅含期权，不含企业外币应收应付。');
 c.choose('名义本金','type','one',[['one','看跌4,000万＋看涨8,000万'],['two','看跌8,000万＋看涨4,000万']]);
 c.range('到期汇率','s',7.763,7.55,8,.00005,'人民币元/欧元');
 c.draw(()=>{
  const{s,type}=c.s,k=7.763,a=type==='one'?4000:8000,b=12000-a,fee=type==='one'?10:8,lo=k-fee/a,hi=k+fee/b,put=a*M.put(s,k),call=b*M.call(s,k),profit=put+call-fee;
  c.context(`当前组合：看跌${fmt(a)}万欧元＋看涨${fmt(b)}万欧元，总期权费${fee}万元人民币。教材执行汇率7.763人民币元/欧元；看涨费0.001、看跌费0.0005元/欧元。本金以万欧元计，计算结果为万元人民币；仅含期权，不含企业外币应收应付。`);
  const host=el('div','focus-pair focus-fx');host.dataset.price=s;host.dataset.breakevens=JSON.stringify([lo,hi]);host.dataset.maxLoss=fee;c.visual.append(host);
  const global=panel(host,'fx-full','完整波动范围','固定观察7.55—8.00；虚线框对应局部放大区。');
  const local=panel(host,'fx-local','执行价附近 · 局部放大','固定观察7.757—7.770，同一条净损益曲线。');
  const f=x=>a*M.put(x,k)+b*M.call(x,k)-fee;
  for(const[box,key,x,y,xticks,yticks]of[[global,'fx-full',[7.55,8],[-12,1950],[7.55,7.75,8],[0,1000,1950]],[local,'fx-local',[7.757,7.77],[-12,60],[7.757,k,7.77],[0,30,60]]]){
   const g=chart(box,{key,x,y,xticks,yticks,h:420,bottom:key==='fx-local'?116:64,unit:'净损益（万元人民币）',xlabel:'到期汇率（人民币元/欧元）',desc:key==='fx-full'?'固定完整汇率范围，净损益在执行汇率处最低，标出局部放大区域':'固定执行价附近范围，直接标出两侧回本汇率与最大亏损',digits:key==='fx-local'?3:2});
   line(g.s,`M${g.X(k)} ${g.T+16}L${g.X(k)} ${g.B}`,'focus-strike');curve(g,f,[lo,k,hi],'focus-profit');
   observation(g,s,f(s),'focus-profit');
   if(key==='fx-full'){
    text(g.s,g.X(k),g.T+8,'执行7.763','focus-key-label','middle');
    const xx=g.X(7.757),yy=g.Y(60),ww=g.X(7.77)-xx,hh=g.Y(-12)-yy;
    g.s.append(sv('rect',{x:xx,y:yy,width:ww,height:hh,class:'focus-zoom-region'}));
    label(g,g.X(k),g.Y(60)-52,['局部放大区'],{anchor:'middle',lead:[xx+ww/2,yy]});
    label(g,g.X(s),clamp(g.Y(f(s))-21,g.T+40,g.B-18),['当前 '+fixed(s,5)],{anchor:s>(x[0]+x[1])/2?'end':'start'});
   }else{
    text(g.s,g.X(k),g.T+8,'执行7.763','focus-key-label','middle');
    for(const[v,side]of[[lo,'下侧'],[hi,'上侧']]){circle(g.s,g.X(v),g.Y(0),'focus-breakeven');label(g,g.X(v)+(side==='下侧'?-8:8),g.Y(0)-51,[side+'回本',fixed(v,5)],{anchor:side==='下侧'?'end':'start',lead:[g.X(v),g.Y(0)]});}
    circle(g.s,g.X(k),g.Y(-fee),'focus-loss');line(g.s,`M${g.X(k)} ${g.Y(-fee)}L${g.X(k)+32} ${g.Y(-fee)+12}L${g.X(k)+32} ${g.B+43}L${g.X(k)} ${g.B+43}`,'focus-leader');label(g,g.X(k),g.B+65,[`最大亏损${fee}万元`],{anchor:'middle'});
   }
  }
  amount(global,'当前情景',`${fmt(put,4)}＋${fmt(call,4)}−${fee}＝${fmt(profit,4)}万元`,'看跌收入＋看涨收入−两份期权费＝组合净损益');
  amount(local,'回本所需变动',`下降${fixed(fee/a,5)} / 上升${fixed(fee/b,5)}`,'总费用÷该方向名义本金；本金越大，回本距离越短。');
  if(s<7.757||s>7.77)local.append(el('p','focus-outside','当前汇率超出局部范围，请在完整图观察当前点；两个坐标范围保持不变。'));
  else local.append(el('p','focus-outside',`当前${fixed(s,5)}在局部范围内；完整图与局部图观察的是同一个价格。`));
  c.result(`看跌收入${fmt(put,4)}＋看涨收入${fmt(call,4)}−总费用${fee}＝净损益${fmt(profit,4)}万元人民币。`,'两图的坐标范围始终固定。本金较大的一侧，只需更小的汇率变动即可回本。',[`下侧回本${fixed(lo,5)}；上侧回本${fixed(hi,5)}人民币元/欧元。`,`执行汇率7.763处，两份期权执行收入均为0，最大亏损为总费用${fee}万元。`]);
 });
}
function budget(c){
 prepare(c,'budget');
 c.range('两方案共同的到期股价','s',72.9,0,120,.1,'元/股');
 c.choose('期间股利情景','div',2.7,[[2.7,'已收到股利2.7元/股'],[0,'期间未分红']]);
 c.draw(()=>{
  const s=c.s.s,div=c.s.div,v=M.equalCapital(s,div),pay=div===0?'期间未分红':'已收到每股2.7元股利';
  c.context(`教材同本金比较：均投入62,500元，1年到期、K60、每份期权对应1股。甲：1,000股×60元＋1,000份看跌×2.5元；乙：12,500份看涨×5元。当前甲持股${pay}，乙不领取股利；图中以万元显示全持仓净损益。`);
  const host=el('div','focus-budget');host.dataset.price=s;host.dataset.dividendPerShare=div;host.dataset.budget=v.budget;host.dataset.protectProfit=v.protectProfit;host.dataset.callProfit=v.callProfit;host.dataset.protectReturn=v.protectReturn;host.dataset.callReturn=v.callReturn;c.visual.append(host);
  const plot=el('div','focus-panel focus-budget-panel');plot.append(el('p','focus-budget-scenario',`当前甲持股${pay}；股利仅归甲，乙不领取股利。两方案收益率都以62,500元为分母。`));host.append(plot);
  const g=chart(plot,{key:'budget',x:[0,120],y:[-7,70],xticks:[0,60,120],yticks:[-6.25,0,35,70],h:430,bottom:72,right:98,unit:'全持仓净损益（万元）',xlabel:'到期除息股价（元/股）',desc:'同一62,500元本金，比较股票加看跌保护与买入看涨的全持仓净损益。甲实线，乙虚线；股利只计入甲的持股。'});
  const a=x=>M.equalCapital(x,div).protectProfit/10000,b=x=>M.equalCapital(x,div).callProfit/10000;
  line(g.s,`M${g.X(60)} ${g.T+16}L${g.X(60)} ${g.B}`,'focus-strike');text(g.s,g.X(60),g.T+8,'执行价60','focus-key-label','middle');
  curve(g,a,[60],'focus-profit focus-budget-a');curve(g,b,[60],'focus-profit focus-budget-b');
  line(g.s,`M${g.R} ${g.Y(a(120))}L${g.R+8} ${g.Y(a(120))}`,'focus-leader');text(g.s,g.R+12,g.Y(a(120))+5,'甲：保护','focus-key-label');
  line(g.s,`M${g.R} ${g.Y(b(120))}L${g.R+8} ${g.Y(b(120))}`,'focus-leader');text(g.s,g.R+12,g.Y(b(120))+5,'乙：看涨','focus-key-label');
  const floor=M.equalCapital(0,div).protectProfit;label(g,g.L+10,g.Y(a(0))-16,[`甲最低净损益${fmt(floor)}元`]);label(g,g.L+10,g.Y(b(0))-12,['乙最多亏损62,500元']);
  line(g.s,`M${g.X(s)} ${g.T}L${g.X(s)} ${g.B}`,'focus-observation');
  const markA=circle(g.s,g.X(s),g.Y(a(s)),'focus-profit focus-budget-a focus-current',6),markB=circle(g.s,g.X(s),g.Y(b(s)),'focus-profit focus-budget-b focus-current',6);
  markA.dataset.plan='protect';markB.dataset.plan='call';markA.append(sv('title',{},`甲：${fmt(v.protectProfit)}元，收益率${fmt(v.protectReturn*100)}%`));markB.append(sv('title',{},`乙：${fmt(v.callProfit)}元，收益率${fmt(v.callReturn*100)}%`));
  const readouts=el('div','focus-budget-readouts');host.append(readouts);
  for(const[plan,title,profit,rate,rows]of[
   ['protect','甲 · 股票＋看跌保护',v.protectProfit,v.protectReturn,[['股票变现',`1,000×${fmt(s)}＝${fmt(v.stock)}元`],['看跌执行收入',`1,000×max(60−${fmt(s)}, 0)＝${fmt(v.put)}元`],['期间股利',`1,000×${fmt(div)}＝${fmt(v.dividend)}元`],['净损益',`${fmt(v.protectIncome)}−62,500＝${fmt(v.protectProfit)}元`],['收益率',`${fmt(v.protectProfit)}÷62,500＝${fmt(v.protectReturn*100)}%`]]],
   ['call','乙 · 买入12,500份看涨',v.callProfit,v.callReturn,[['看涨执行收入',`12,500×max(${fmt(s)}−60, 0)＝${fmt(v.callIncome)}元`],['净损益',`${fmt(v.callIncome)}−62,500＝${fmt(v.callProfit)}元`],['收益率',`${fmt(v.callProfit)}÷62,500＝${fmt(v.callReturn*100)}%`]]]
  ]){
   const box=el('div','focus-budget-plan');box.dataset.plan=plan;box.dataset.profit=profit;box.dataset.return=rate;
   box.append(el('h4','focus-heading',title),el('p','focus-budget-price',`同一到期股价${fmt(s)}元；${plan==='protect'?pay:'看涨持有人不领取股利'}`));const dl=el('dl','focus-budget-calculation');
   for(const[label,value]of rows){const dd=el('dd',label==='净损益'||label==='收益率'?'is-result':'',value);if(label==='收益率'){dd.dataset.return=plan;dd.dataset.value=rate;}if(label==='净损益'){dd.dataset.profit=plan;dd.dataset.value=profit;}dl.append(el('dt','',label),dd);}box.append(dl);readouts.append(box);
  }
  host.append(el('p','focus-budget-assumption','默认到期除息股价72.9元来自正文的股利折现假设。股利切换用于按同一股价隔离现金流，不重新预测股价或期权报价；本图忽略税费与资金时间价值。'));
  c.result(`甲净损益${fmt(v.protectProfit)}元，收益率${fmt(v.protectReturn*100)}%；乙净损益${fmt(v.callProfit)}元，收益率${fmt(v.callReturn*100)}%。`,'同样62,500元本金，乙对应的合约数量更多，股价上涨时损益增加更快，但到期作废会亏完本金。甲的股利只计入所选情景，两方案收益率都用相同初始本金作分母。',[`甲初始投入60,000＋2,500＝62,500元；乙初始投入12,500×5＝62,500元。`,`股价低于60元时，甲的股票与看跌收入合计锁定60,000元，再加本情景股利；乙看涨执行收入为0。`]);
 });
}
window.CpaTeachingFocus=Object.freeze({locked,fx,budget});
})();
