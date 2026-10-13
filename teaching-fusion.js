/* Cash-flow composition: every animated point keeps the same horizontal price.
   Motion is an explanatory construction, not an intermediate market valuation. */
(function(root){'use strict';
const M=typeof module!=='undefined'?require('./teaching-models'):root.CpaTeachingModels;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),fmt=(x,d=2)=>(Math.abs(x)<1e-9?0:x).toLocaleString('zh-CN',{maximumFractionDigits:d});
function config(spec,state){
 const id=spec.lesson||spec.n,s={...state};let legs,cost,unit='元/股',knots=[60],costColumn=3;
 if(id===7){const t=s.type,stock=['protect','covered'].includes(t);legs=[{name:stock?'股票市值':t==='short'?'卖出看涨':'买入看涨',fn:x=>M.strategy(x,t).a},{name:t==='covered'?'卖出看涨':t==='short'?'卖出看跌':'买入看跌',fn:x=>M.strategy(x,t).b}];cost=M.strategy(s.s,t).cost;}
 else if(id===8){legs=[{name:'100股市值',fn:x=>100*x},{name:'看跌保护',fn:x=>100*s.h*M.put(x,60)}];cost=6000+400*s.h;unit='元（全部持仓）';}
 else if(id===9&&s.mode==='dividend'){legs=[{name:'100股市值',fn:x=>100*x},{name:'看涨空头',fn:x=>-100*M.call(x,60)},{name:'现金股利',fn:()=>100*s.div}];cost=5400;unit='元（全部持仓）';costColumn=null;}
 else if(id===10){legs=[{name:'买入K28',fn:x=>.5*M.call(x,28)},{name:'卖出双份K39',fn:x=>-M.call(x,39)},{name:'买入K50',fn:x=>.5*M.call(x,50)}];cost=1.13;unit='万元（全部组合）';knots=[28,39,50];costColumn=null;}
 else if(id===11){const a=s.type==='one'?4000:8000,b=12000-a;legs=[{name:'看跌收入',fn:x=>a*M.put(x,7.763)},{name:'看涨收入',fn:x=>b*M.call(x,7.763)}];cost=s.type==='one'?10:8;unit='万元人民币';knots=[7.763];}
 else return null;
 return{legs,cost,unit,knots,costColumn,id,strategy:s.type,protection:s.h,price:s.s,initial:s.step==='parts'?0:s.step==='income'?legs.length-1:legs.length};
}
function phase(c,position){
 const n=c.legs.length,p=clamp(position,0,n),sum=(x,count=n)=>c.legs.slice(0,count).reduce((a,l)=>a+l.fn(x),0);
 if(p===0)return{kind:'parts',p,t:0,index:0,value:x=>c.legs[0].fn(x),base:()=>0,sum};
 if(Math.abs(p-(n-1))<1e-8)return{kind:'income',p,t:1,index:n-1,value:x=>sum(x),base:()=>0,sum};
 if(p<n-1){const i=Math.ceil(p),t=p-i+1;return{kind:'add',p,t,index:i,base:x=>sum(x,i),piece:c.legs[i].fn,value:x=>c.legs[i].fn(x)+t*sum(x,i),sum};}
 const t=p-(n-1);return{kind:p===n?'profit':'cost',p,t,index:n,value:x=>sum(x)-t*c.cost,base:x=>sum(x),sum};
}
function mount(host,opts,c){
 const fig=host.closest('.tf'),NS='http://www.w3.org/2000/svg',make=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls||'';if(text!==undefined)e.textContent=text;return e;},svg=(tag,attrs={},text)=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;};
 const box=make('div','fusion-panel'),narration=make('p','fusion-narration'),equation=make('div','fusion-equation'),legend=make('div','fusion-legend'),scrub=make('div','fusion-scrub'),label=make('label','', '推演进度'),range=make('input'),progress=make('span','fusion-progress');
 range.type='range';range.min=0;range.max=c.legs.length;range.step=.01;range.id=fig.id+'-fusion-progress';range.setAttribute('aria-label','曲线合成推演进度');label.htmlFor=range.id;scrub.append(label,range,progress);
 const focusedLong=fig.dataset.figure==='37'&&c.id===7&&c.strategy==='long';
 const w=Math.min(960,Math.max(240,Math.round(host.clientWidth))),mobile=w<540,h=focusedLong?(mobile?420:360):(mobile?420:440),L=mobile?64:72,R=w-22,T=focusedLong?(mobile?48:36):(mobile?126:92),B=h-(focusedLong?98:72),x=opts.x||[0,120],inside=v=>v>=x[0]&&v<=x[1];
 const prices=[...new Set([x[0],x[1],...c.knots,c.price,...(opts.keys||[]).map(k=>k.x),...(fig._priceScenario?.rows.map(r=>r.price)||[])].filter(inside))].sort((a,b)=>a-b);
 const all=prices.flatMap(v=>{let sum=0;const vals=[0];for(const l of c.legs){sum+=l.fn(v);vals.push(l.fn(v),sum);}vals.push(sum-c.cost);return vals;});
 const rawLow=Math.min(...all),rawHigh=Math.max(...all),span=Math.max(1,rawHigh-rawLow),power=10**Math.floor(Math.log10(span/4)),step=([1,2,5,10].find(v=>v*power>=span/4)||10)*power,low=Math.floor(rawLow/step)*step,high=Math.ceil(rawHigh/step)*step,pad=Math.max(1,high-low)*.08,y=opts.fixedY||[low-pad,high+pad],X=v=>L+(v-x[0])/(x[1]-x[0])*(R-L),Y=v=>B-(v-y[0])/(y[1]-y[0])*(B-T);
 const chart=svg('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':'固定同一价格，把分项现金流逐点相加，再计入初始投入',class:'fusion-chart','data-x-domain':JSON.stringify(x),'data-y-domain':JSON.stringify(y)});chart.append(svg('title',{},'组合曲线的逐点合成'),svg('desc',{},'先看同一价格的分项金额，再把相加关系扩展到整条收入曲线，最后扣除初始投入。坐标轴在本视图内固定；移动中的曲线表示运算过程。'));
 const text=(a,b,t,cls='figure-label',anchor='start')=>{const e=svg('text',{x:a,y:b,class:cls,'text-anchor':anchor},t);chart.append(e);return e;};
 text(L,20,c.unit,'fusion-unit');for(const v of [...new Set([opts.fixedY?y[0]:low,0,opts.fixedY?y[1]:high])].filter(v=>v>=y[0]&&v<=y[1])){chart.append(svg('path',{d:`M${L} ${Y(v)}L${R} ${Y(v)}`,class:v===0?'figure-grid fusion-zero':'figure-grid',fill:'none'}));text(L-7,Y(v)+5,fmt(v,1),'figure-label','end');}
 chart.append(svg('path',{d:`M${L} ${T}L${L} ${B}L${R} ${B}`,class:'figure-axis',fill:'none'}));
 const ticks=(mobile?[x[0],(x[0]+x[1])/2,x[1]]:Array.from({length:5},(_,i)=>x[0]+(x[1]-x[0])*i/4)).filter(v=>!focusedLong||Math.abs(v-60)>1e-8);ticks.forEach((v,i)=>text(X(v),B+24,fmt(v,x[1]-x[0]<1?3:1),'figure-label',i===0?'start':i===ticks.length-1?'end':'middle'));text((L+R)/2,h-15,opts.xLabel||'到期股价（元/股）','fusion-axis-title','middle');
 for(const k of c.knots.filter(v=>v>x[0]&&v<x[1]))chart.append(svg('path',{d:`M${X(k)} ${T}L${X(k)} ${B}`,class:'figure-guide fusion-strike',fill:'none'}));
 const guide=svg('path',{d:`M${clamp(X(c.price),L,R)} ${T}L${clamp(X(c.price),L,R)} ${B}`,class:'figure-guide fusion-observation',fill:'none'});guide.style.display=inside(c.price)?'':'none';chart.append(guide);
 const groups=Array.from({length:4},()=>{const g=svg('g'),line=svg('path',{fill:'none'}),dots=[];g.append(line);for(const price of prices){const mark=svg('circle',{cx:X(price),r:4,'data-price':price}),hit=svg('circle',{cx:X(price),r:12,class:'tf-sample-hit','aria-hidden':'true'});hit.onclick=()=>fig._selectPrice(price);g.append(mark,hit);dots.push({price,mark,hit});}chart.append(g);return{g,line,dots};});
 const movement=svg('path',{fill:'none',class:'fusion-movement'}),arrow=svg('path',{class:'fusion-arrow'}),addition=svg('path',{fill:'none',class:'fusion-addition-bracket'}),annotations=svg('g',{class:'fusion-annotations'}),observation=svg('g',{class:'fusion-observation-label'});chart.append(movement,arrow,addition,annotations,observation);box.append(chart,legend,equation,narration,scrub);host.append(box);
 let pos=c.initial,playing=false,started=false,hasPlayed=false,raf=0,last=null,queue=[],partElapsed=0,startPos=pos,onUpdate=()=>{},onState=()=>{},disposed=false;
 const value=v=>v<0?'('+fmt(v,4)+')':fmt(v,4),expression=(values)=>values.map(value).join(' + ');
 const unit=c.unit.replace(/（.*）/,'').replace('人民币',''),priceUnit=opts.xLabel?.includes('汇率')?'':'元',priceFmt=v=>fmt(v,x[1]-x[0]<1?5:2),sum=x=>c.legs.reduce((a,l)=>a+l.fn(x),0),net=x=>sum(x)-c.cost;
 function defaultKeys(kind){
  if(kind==='income'){
   if(c.id===7&&['long','short'].includes(c.strategy))return[{x:60,y:0,title:'两份期权',detail:'都不行权'}];
   const k=c.id===10?39:c.knots[0],v=sum(k),title=c.id===7&&c.strategy==='protect'||c.id===8&&c.protection===1?'最低收入':c.id===7&&c.strategy==='covered'||c.id===9||c.id===10?'最高收入':'执行价处收入';
   return[{x:k,y:v,title,detail:fmt(v,4)+' '+unit}];
  }
  if(kind!=='profit')return[];
  const nodes=[...new Set([x[0],...c.knots,x[1]].filter(inside))].sort((a,b)=>a-b),roots=[];
  for(let i=0;i<nodes.length-1;i++){const a=nodes[i],b=nodes[i+1],va=net(a),vb=net(b);if(Math.abs(va)<1e-8&&Math.abs(vb)>1e-8)roots.push(a);if(va*vb<0)roots.push(a-va*(b-a)/(vb-va));if(Math.abs(vb)<1e-8&&Math.abs(va)>1e-8)roots.push(b);}
  const keyRoots=[...new Set(roots.map(v=>+v.toFixed(10)))].map(v=>({x:v,y:0,title:priceUnit?'回本股价':'回本汇率',detail:priceFmt(v)+priceUnit}));
  let extreme;if(c.id===7&&c.strategy==='protect'||c.id===7&&c.strategy==='long'||c.id===8&&c.protection===1||c.id===11)extreme={x:c.knots[0],y:net(c.knots[0]),title:'最大亏损',detail:fmt(-net(c.knots[0]),4)+' '+unit};
  else if(c.id===7&&['covered','short'].includes(c.strategy)||c.id===9||c.id===10){const k=c.id===10?39:c.knots[0];extreme={x:k,y:net(k),title:'最大盈利',detail:fmt(net(k),4)+' '+unit};}
  else if(c.id===8)extreme={x:60,y:net(60),title:'执行价处损益',detail:fmt(net(60),4)+' '+unit};
  const supplied=(opts.keys||[]).filter(k=>inside(k.x)&&(k.stage==='profit'||!k.stage)&&Math.abs(net(k.x)-k.y)<1e-6).map(k=>{const known=[...keyRoots,...(extreme?[extreme]:[])].find(v=>Math.abs(v.x-k.x)<1e-7&&Math.abs(v.y-k.y)<1e-6);return{...known,...k,title:k.title||known?.title||k.label||(Math.abs(k.y)<1e-8?'回本':'关键金额'),detail:k.detail||known?.detail||fmt(k.y,4)+' '+unit};});
  const result=[...supplied,...keyRoots,...(extreme?[extreme]:[])].filter(k=>inside(k.x)&&k.y>=y[0]&&k.y<=y[1]);
  return result.filter((k,i,a)=>!a.slice(0,i).some(v=>Math.abs(v.x-k.x)<1e-7&&Math.abs(v.y-k.y)<1e-6)).sort((a,b)=>a.x-b.x).slice(0,3);
 }
 function labelKeys(kind){
  const keys=defaultKeys(kind),key=JSON.stringify(keys);if(annotations.dataset.key===key)return;annotations.dataset.key=key;annotations.replaceChildren();
  if(focusedLong&&kind==='income'){
   annotations.dataset.layout='near-points';
   keys.forEach(k=>{const px=X(k.x),py=Y(k.y),group=svg('g',{'data-key-price':k.x,'data-key-value':k.y});
    group.append(svg('circle',{cx:px,cy:py,r:4,class:'fusion-key-dot figure-series-total'}),svg('path',{d:`M${px} ${py+5}L${px} ${py+11}`,class:'figure-guide fusion-key-leader',fill:'none'}),svg('text',{x:px,y:py+26,'text-anchor':'middle',class:'fusion-direct-label'},priceFmt(k.x)+priceUnit+'：'+k.title+k.detail));annotations.append(group);
   });
   return;
  }
  if(focusedLong&&kind==='profit'){
   annotations.dataset.layout='near-points';
   keys.forEach(k=>{const px=X(k.x),py=Y(k.y),group=svg('g',{'data-key-price':k.x,'data-key-value':k.y});
    group.append(svg('circle',{cx:px,cy:py,r:4,class:'fusion-key-dot figure-series-compare'}));
    if(Math.abs(k.y)<1e-8){const left=k.x<c.knots[0],direction=left?-1:1,xx=px+direction*15;
     group.append(svg('path',{d:`M${px} ${py}L${px+direction*10} ${py+12}`,class:'figure-guide fusion-key-leader',fill:'none'}),svg('text',{x:xx,y:py+24,'text-anchor':left?'end':'start',class:'fusion-direct-label'},priceFmt(k.x)+priceUnit+'回本'));
    }else{
     group.append(svg('path',{d:`M${px} ${py+5}L${px} ${B+7}`,class:'figure-guide fusion-key-leader',fill:'none'}),svg('text',{x:px,y:B+24,'text-anchor':'middle',class:'fusion-direct-label'},priceFmt(k.x)+priceUnit+'：'+k.title),svg('text',{x:px,y:B+49,'text-anchor':'middle',class:'fusion-direct-value'},k.detail));
    }
    annotations.append(group);
   });
   return;
  }
  delete annotations.dataset.layout;
  keys.forEach((k,i)=>{const xx=w*(i+1)/(keys.length+1),first=mobile?49:44,second=mobile?72:65,px=X(k.x),py=Y(k.y),group=svg('g',{'data-key-price':k.x,'data-key-value':k.y});
   group.append(svg('path',{d:`M${px} ${py}L${px} ${T-10}L${xx} ${T-30}L${xx} ${second+8}`,class:'figure-guide fusion-key-leader',fill:'none'}),svg('circle',{cx:px,cy:py,r:4,class:'fusion-key-dot '+(kind==='profit'?'figure-series-compare':'figure-series-total')}),svg('text',{x:xx,y:first,'text-anchor':'middle',class:'fusion-direct-label'},k.title),svg('text',{x:xx,y:second,'text-anchor':'middle',class:'fusion-direct-value'},k.detail));annotations.append(group);
  });
 }
 function paint(p){
  pos=clamp(p,0,c.legs.length);const f=phase(c,pos),a=c.legs.map(l=>l.fn(c.price)),income=a.reduce((v,x)=>v+x,0),priceLabel=opts.xLabel?.includes('汇率')?'到期汇率':'到期股价';
  box.dataset.position=pos;box.dataset.phase=f.kind;box.dataset.movingValue=f.value(c.price);box.dataset.price=c.price;fig.dataset.fusionStage=f.kind;range.value=pos;range.setAttribute('aria-valuetext',f.kind==='parts'?'分项现金流':f.kind==='add'?'相加第'+(f.index+1)+'项':f.kind==='income'?'合计收入':f.kind==='cost'?'计入初始投入':'净损益');progress.textContent=Math.round(pos/c.legs.length*100)+'%';
  let lines=[];
  if(f.kind==='parts'){
   narration.textContent=`看${c.legs.length===2?'两条腿':'各条腿'}：竖线上的点使用同一个${priceLabel}。先读出各项收入，再相加。`;
   equation.textContent=`${priceLabel} ${fmt(c.price,5)}${priceUnit}：`+c.legs.map((l,i)=>l.name+' '+value(a[i])).join('；')+' '+c.unit+'。';
   lines=c.legs.map((l,i)=>({name:l.name,fn:l.fn,cls:'fusion-leg-'+i+(i===c.legs.length-1?' fusion-hero':' fusion-support')}));
  }else if(f.kind==='add'){
   const previous=a.slice(0,f.index).reduce((v,x)=>v+x,0),next=a[f.index];
   narration.textContent=`第${f.index+1}项同价相加：${f.t<.3?'先看竖线处的金额相加；':'把同样的加法扩展到各个价格，'}“${c.legs[f.index].name}”按前${f.index}项累计金额竖直移动。移动演示仅表示相加过程，不是新的期权报价。`;
   equation.textContent=`${priceLabel} ${fmt(c.price,5)}${priceUnit}，同价相加目标：${fmt(previous,4)} + ${value(next)} = ${fmt(previous+next,4)}；当前移动演示：${value(next)} + ${fmt(f.t*100,1)}% × ${value(previous)} = ${fmt(f.value(c.price),4)} ${c.unit}。`;
   lines=[{name:'前'+f.index+'项累计',fn:f.base,cls:'figure-series-total fusion-support'},{name:c.legs[f.index].name+'原位置',fn:f.piece,cls:'fusion-origin fusion-support'},{name:'相加中的收入',fn:f.value,cls:'figure-series-total fusion-hero'}];
  }else if(f.kind==='income'){
   narration.textContent=c.id===7&&c.strategy==='long'?'同价相加形成 V 形收入；执行价60元时，两份期权都不行权，合计收入为0。':'同一价格的各项金额相加，连成合计收入曲线。下一步计入今天的初始投入。';
   equation.textContent=`${priceLabel} ${fmt(c.price,5)}${priceUnit}：`+expression(a)+' = '+fmt(income,4)+' '+c.unit+'。';lines=[{name:'合计收入',fn:f.sum,cls:'figure-series-total fusion-hero'}];
  }else{
   const receipt=c.cost<0;
   narration.textContent=f.kind==='cost'?`${receipt?'完整期初净收款':'完整初始净投入'}为 ${fmt(Math.abs(c.cost),4)} ${unit}；当前演示${receipt?'向上':'向下'}平移 ${fmt(f.t*100,1)}%。当前位移只表示运算位置，不代表新的费用或报价。`:receipt?`计入期初净收款 ${fmt(-c.cost,4)} ${unit}，净损益线向上移动同样金额。`:c.id===7&&c.strategy==='long'?`扣除费用：收入曲线整体向下移动10元。50—70元之间亏损；股价偏离60元超过10元才获利。`:`扣除初始净投入 ${fmt(c.cost,4)} ${unit}，收入曲线整体向下平移。`;
   equation.textContent=f.kind==='cost'?`${priceLabel} ${fmt(c.price,5)}${priceUnit}，当前平移：${fmt(income,4)} − ${value(f.t*c.cost)} = ${fmt(f.value(c.price),4)}；完成后：${fmt(income,4)} − ${value(c.cost)} = ${fmt(income-c.cost,4)} ${c.unit}。`:focusedLong?`${priceLabel} ${fmt(c.price,5)}${priceUnit}：看涨 ${fmt(a[0],4)} + 看跌 ${fmt(a[1],4)} = 合计 ${fmt(income,4)}；${fmt(income,4)} − 费用 ${value(c.cost)} = 净损益 ${fmt(income-c.cost,4)} ${c.unit}。`:`${priceLabel} ${fmt(c.price,5)}${priceUnit}：${expression(a)} = ${fmt(income,4)}；${fmt(income,4)} − ${value(c.cost)} = ${fmt(income-c.cost,4)} ${c.unit}。`;
   lines=[{name:'合计收入',fn:f.sum,cls:'figure-series-total fusion-support'},{name:f.kind==='profit'?'净损益':'扣投入的平移过程',fn:f.value,cls:'figure-series-compare fusion-hero'}];
  }
  const key=lines.map(l=>l.name).join('|');if(legend.dataset.key!==key){legend.dataset.key=key;legend.replaceChildren(...lines.map(l=>{const item=make('span','fusion-legend-item'),sample=make('i',l.cls);sample.setAttribute('aria-hidden','true');item.append(sample,document.createTextNode(l.name));return item;}));}
  groups.forEach(({g,line,dots},i)=>{const l=lines[i];if(!l){g.remove();return;}if(!g.isConnected)chart.insertBefore(g,movement);const hero=l.cls.includes('fusion-hero');g.setAttribute('class',hero?'fusion-hero-group':'fusion-support-group');line.setAttribute('class',l.cls+' fusion-curve');line.setAttribute('d',prices.map((v,j)=>(j?'L':'M')+X(v)+' '+Y(l.fn(v))).join(''));line.dataset.values=JSON.stringify(prices.map(v=>l.fn(v)));line.style.opacity=hero?f.kind==='add'?String(.12+.88*clamp((f.t-.16)/.36,0,1)):'1':f.kind==='parts'?'.6':'.35';line.style.strokeWidth=hero?'4':'2';if(hero)line.style.strokeDasharray='none';dots.forEach(({price,mark,hit})=>{const selected=Math.abs(price-c.price)<1e-8,cy=Y(l.fn(price));mark.setAttribute('cy',cy);mark.setAttribute('r',hero?6:4);mark.setAttribute('class',l.cls+' tf-sample'+(selected?' is-selected':''));mark.style.display=selected&&(hero||f.kind==='parts'||f.kind==='add')?'':'none';hit.setAttribute('cy',cy);let title=hit.querySelector('title');if(!title){title=svg('title');hit.append(title);}title.textContent=`${fmt(price,5)}：${l.name} ${fmt(l.fn(price),4)} ${c.unit}`;});});
  const moving=f.kind==='add'||f.kind==='cost',from=f.kind==='add'?f.piece(c.price):income,to=f.value(c.price),xx=clamp(X(c.price)+12,L+8,R-4),yy=Y(to),direction=Y(from)>yy?-1:1;
  movement.style.display=arrow.style.display=moving&&Math.abs(from-to)>1e-8?'':'none';movement.setAttribute('d',`M${xx} ${Y(from)}L${xx} ${yy}`);arrow.setAttribute('d',`M${xx} ${yy}L${xx-4} ${yy-direction*7}L${xx+4} ${yy-direction*7}Z`);
  movement.style.stroke=arrow.style.fill=f.kind==='cost'?'var(--figure-compare)':'var(--figure-total)';labelKeys(f.kind);
  addition.style.display=f.kind==='add'&&inside(c.price)?'':'none';if(f.kind==='add'){const ax=clamp(X(c.price)-12,L+12,R-12),base=f.base(c.price),target=base+f.piece(c.price);addition.setAttribute('d',`M${ax-5} ${Y(base)}L${ax} ${Y(base)}L${ax} ${Y(target)}L${ax-5} ${Y(target)}`);addition.style.stroke='var(--figure-total)';addition.style.strokeWidth='2';}
  observation.replaceChildren();if(inside(c.price)){const readout=f.kind==='parts'?`同价 ${priceFmt(c.price)}${priceUnit}`:(f.kind==='add'||f.kind==='cost'?'移动演示 ':'当前 ')+fmt(f.value(c.price),4)+' '+unit,topReadout=focusedLong&&['parts','income'].includes(f.kind);let labelY=topReadout?20:f.kind==='parts'?T-17:clamp(Y(f.value(c.price))-13,T+17,B-9);if(focusedLong&&f.kind==='profit'&&f.value(c.price)<0)labelY=Math.min(labelY,Y(0)-20);const label=svg('text',{x:0,y:labelY,class:'fusion-current-value'},readout);observation.append(label);const width=label.getComputedTextLength();label.setAttribute('x',topReadout?w-width-22:clamp(X(c.price)+9,L+5,Math.max(L+5,w-width-8)));}
  chart.setAttribute('aria-label',`${priceLabel} ${fmt(c.price,5)}${priceUnit}，${f.kind==='profit'?'净损益':f.kind==='income'?'合计收入':'当前计算金额'} ${fmt(f.value(c.price),4)} ${c.unit}。${narration.textContent}`);
  const current=fig.querySelector('.tf-scenario-table tr.is-current');fig.querySelectorAll('.fusion-active-cell').forEach(e=>e.classList.remove('fusion-active-cell'));if(current){const cells=[...current.querySelectorAll('td')],last=cells.length-1;const indexes=f.kind==='parts'?c.legs.map((_,i)=>i):f.kind==='add'?[...Array(f.index+1).keys()]:f.kind==='income'?[c.legs.length]:[c.legs.length,...(c.costColumn===null?[]:[c.costColumn]),last];indexes.forEach(i=>cells[i]?.classList.add('fusion-active-cell'));}
  onUpdate(f);return f;
 }
 function announce(){onState({playing,started,hasPlayed,position:pos,complete:pos===c.legs.length,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches});}
 function pause(){playing=false;cancelAnimationFrame(raf);last=null;announce();}
 const ease=t=>t*t*(3-2*t);
 function frame(time){if(!playing||disposed)return;if(last!==null)partElapsed+=Math.min(time-last,80);last=time;const segment=queue[0];if(!segment){playing=false;started=false;announce();return;}const t=Math.min(1,partElapsed/segment.duration);paint(startPos+(segment.to-startPos)*ease(t));if(t===1){queue.shift();startPos=pos;partElapsed=0;}raf=requestAnimationFrame(frame);}
 function run(target,from=pos,all=false){pause();paint(from);started=true;hasPlayed=true;startPos=from;partElapsed=0;last=null;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){paint(target);started=false;announce();return;}
  queue=all?[{to:0,duration:1100},...Array.from({length:c.legs.length},(_,i)=>[{to:i+1,duration:1900},{to:i+1,duration:800}]).flat()]:[{to:target,duration:Math.max(1000,Math.abs(target-from)*1600)},{to:target,duration:450}];playing=true;announce();raf=requestAnimationFrame(frame);
 }
 range.oninput=()=>{pause();started=false;hasPlayed=true;queue=[];paint(+range.value);announce();};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),reduce=()=>{if(reduced.matches&&playing){pause();started=false;paint(c.legs.length);announce();}};reduced.addEventListener('change',reduce);
 paint(c.initial);
 return{config:c,get position(){return pos;},get playing(){return playing;},get started(){return started;},bind(update,state){onUpdate=update;onState=state;paint(pos);announce();},restore(position){paint(position);announce();},pause,cancel(){pause();started=false;queue=[];},toggle(){if(playing){pause();return;}if(started&&queue.length){playing=true;last=null;announce();raf=requestAnimationFrame(frame);}else run(c.legs.length,0,true);},to(target,from=pos){run(target,from);},finish(){pause();started=false;hasPlayed=true;queue=[];paint(c.legs.length);announce();},destroy(){disposed=true;cancelAnimationFrame(raf);reduced.removeEventListener('change',reduce);}};
}
const api={config,phase,mount};if(typeof module!=='undefined')module.exports=api;else root.CpaCurveFusion=api;
})(typeof window!=='undefined'?window:globalThis);
