/* Inline experiments: controls, plot and explanation share one model state. */
(()=>{'use strict';
const M=window.CpaFigureModels,NS='http://www.w3.org/2000/svg';
const configs={
 underlying:{no:'01',title:'买入权只取得超过执行价的部分',prompt:'把到期股价调到100元以下，再调到150元：买入权会怎样变化？',note:'沿用本段按100元买入一股的合约。图示到期执行收入，未扣期权费；并非今天的期权报价。',state:{s:150}},
 positions:{no:'02',title:'行权分界与回本分界，是两个位置',prompt:'先找“已经行权、整笔仍亏”的股价，再切到卖方看看。',note:'执行价37元，每份对应一股；默认看涨费3.8元、看跌费5.25元。忽略税费与资金时间价值。',state:{s:39,type:'long-call',premium:3.8}},
 strategies:{no:'03',title:'组合的形状，来自逐项相加',prompt:'先调低股价看保护性看跌的底线，再换抛补性看涨观察上限。',note:'保护：股票58＋看跌费6；抛补：股票58−看涨费4；对敲：总期权费10。执行价均60，一股配一份，忽略税费、股利与资金时间价值。',state:{s:45,type:'protect',parts:false}},
 value:{no:'04',title:'同一股价，等待机会会改变期权价值',prompt:'先保持期限不变，提高波动率；再把剩余期限调到0，观察两条线。',note:'模型演示：无股利欧式看涨，S₀=104、K=100、连续年率3%。BS假设沿用正文；正态概率采用数值近似，最终金额取两位。',state:{t:.75,sigma:25}},
 hedge:{no:'05',title:'配对数量合适，两种股价下的净额才相同',prompt:'先试一股配一份期权，再点“用Δ配比”，比较两行终值。',note:'沿用正文：S₀=84，半年后105或71.4，K=90，半年有效无风险利率2.5%。比较Δ股股票减一份看涨；仅针对该两状态模型。',state:{h:1}},
 tree:{no:'06',title:'从到期往回算，每一层都要折现',prompt:'依次点击“终点支付”“倒推一层”“回到今天”，看每个值从哪里来。',note:'S₀=96、K=100，半年分两季，每季u=1.25、d=0.8、r=2.5%，q=0.5。股价单位元；节点C为该时点的期权价值。',state:{step:2}},
 parity:{no:'07',title:'股价无论涨跌，两组资产到期总额相同',prompt:'把到期股价调到100元两侧，看哪个组成部分补足总额。',note:'同一无股利股票、相同执行价100、相同到期日的欧式期权。一股对应一份，现金项是今天买入、到期支付100的无风险资产。',state:{s:80}},
 delay:{no:'08',title:'可以等一年，会改变现在的投资选择',prompt:'先看投资成本1,050，再降到850：等待与立即投资谁更有利？',note:'单位万元。今天经营资产价值1,000，一年后除息价值1,250或800；两时点投资成本相同。q按教材取0.3434、r=5%；等待者第一年没有经营现金。',state:{k:1050}}
};
const mounts={
 'ch06-underlying':'underlying','ch06-full-call-profit':'positions','ch06-full-protective-example':'strategies',
 'ch06-full-time-value':'value','ch06-full-hedging-principle':'hedge','ch06-full-binomial-call-backward':'tree',
 'ch06-full-put-call-parity':'parity','ch06-full-real-delay-answer':'delay'
};
const recap={
 'recap-contracts':'ch06-underlying','recap-breakeven':'ch06-full-call-profit','recap-protection':'ch06-full-protective-example',
 'recap-value-parts':'ch06-full-time-value','recap-replication':'ch06-full-hedging-principle','recap-tree-example':'ch06-full-binomial-call-backward',
 'recap-parity':'ch06-full-put-call-parity','recap-delay':'ch06-full-real-delay-answer'
};
const number=(v,n=2)=>Math.abs(v)<1e-9?'0':Number(v.toFixed(n)).toLocaleString('zh-CN',{maximumFractionDigits:n});
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function svgEl(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;}
function addText(svg,x,y,t,cls='figure-label',anchor='start'){svg.append(svgEl('text',{x,y,class:cls,'text-anchor':anchor,'dominant-baseline':'central'},t));}
function path(svg,d,cls){svg.append(svgEl('path',{d,fill:'none',class:cls}));}
function canvas(fig,w,h,description){const s=svgEl('svg',{viewBox:`0 0 ${w} ${h}`,width:w,height:h,role:'img','aria-labelledby':fig.id+'-svg-title '+fig.id+'-svg-desc'});s.append(svgEl('title',{id:fig.id+'-svg-title'},fig.dataset.title),svgEl('desc',{id:fig.id+'-svg-desc'},description));return s;}
function chart(fig,host,{series,domain,range,ticks,cursor,breaks=[],xLabel='到期股价（元）'}){
 const w=Math.max(280,Math.min(680,host.clientWidth)),h=320,L=48,R=w-98,T=28,B=260;
 const x=v=>L+(v-domain[0])/(domain[1]-domain[0])*(R-L),y=v=>B-(v-range[0])/(range[1]-range[0])*(B-T);
 const s=canvas(fig,w,h,series.map(a=>a.name).join('、')+'随'+xLabel+'的变化；精确数值见图下计算。');
 for(const v of [...new Set([range[0],0,range[1]])]){path(s,`M${L} ${y(v)}H${R}`,'figure-grid');addText(s,L-8,y(v),number(v),'figure-label','end');}
 path(s,`M${L} ${T}V${B}H${R}`,'figure-axis');
 for(const v of ticks){addText(s,x(v),B+21,number(v),'figure-label','middle');}
 addText(s,R,B+48,xLabel,'figure-label','end');
 for(const v of breaks.filter(v=>v>=domain[0]&&v<=domain[1]))path(s,`M${x(v)} ${T}V${B}`,'figure-guide');
 const xs=[...new Set([...Array.from({length:101},(_,i)=>domain[0]+i*(domain[1]-domain[0])/100),...breaks])].filter(v=>v>=domain[0]&&v<=domain[1]).sort((a,b)=>a-b);
 const labels=[];for(const a of series){path(s,xs.map((v,i)=>(i?'L':'M')+x(v)+' '+y(a.fn(v))).join(' '),a.cls);labels.push({...a,actual:y(a.fn(domain[1]))});}
 labels.sort((a,b)=>a.actual-b.actual);let last=T-22;for(const a of labels){a.label=Math.max(T,Math.min(B,a.actual),last+22);last=a.label;}if(last>B){const over=last-B;for(const a of labels)a.label-=over;}
 for(const a of labels){path(s,`M${R} ${a.actual}L${R+10} ${a.label}`,'figure-guide');addText(s,R+15,a.label,a.name,'figure-label');}
 if(cursor!==undefined){path(s,`M${x(cursor)} ${T}V${B}`,'figure-guide');for(const a of series)s.append(svgEl('circle',{cx:x(cursor),cy:y(a.fn(cursor)),r:4.5,class:'figure-point'}));}
 host.replaceChildren(s);
}
function barRows(fig,host,rows,min,max){
 const w=Math.max(280,Math.min(680,host.clientWidth)),L=4,R=w-6,x=v=>L+(v-min)/(max-min)*(R-L),h=rows.length*92+24;
 const s=canvas(fig,w,h,'各行共用相同尺度。'+rows.map(r=>r.label+' '+number(r.value)+'。').join(''));
 rows.forEach((r,i)=>{const top=i*92+22;addText(s,4,top,r.label);addText(s,w-4,top,number(r.value), 'figure-label','end');
  if(r.segments){let start=0;for(const v of r.segments){if(v>0){s.append(svgEl('rect',{x:x(start),y:top+17,width:x(start+v)-x(start),height:24,class:'figure-bar-part'}));s.append(svgEl('rect',{x:x(start),y:top+17,width:x(start+v)-x(start),height:24,class:'figure-bar-frame'}));}start+=v;}path(s,`M${x(0)} ${top+43}H${x(r.value)}`,'figure-series-total');}else s.append(svgEl('rect',{x:Math.min(x(0),x(r.value)),y:top+17,width:Math.abs(x(r.value)-x(0)),height:24,class:r.cls||'figure-bar-total'}));
  path(s,`M${x(0)} ${top+13}V${top+45}`,'figure-axis');
  if(r.note)addText(s,4,top+62,r.note,'figure-label');
 });host.replaceChildren(s);
}
function drawTree(fig,host,step){
 const w=Math.max(280,Math.min(680,host.clientWidth)),small=w<620,model=M.tree();
 const stocks=[96,120,76.8,150,96,61.44],vals=[model.today,...model.middle,...model.terminal];
 const pos=small?[[w/2-56,28,112],[16,146,(w-52)/2],[w/2+10,146,(w-52)/2],[4,282,(w-48)/3],[(w-48)/3+24,282,(w-48)/3],[2*(w-48)/3+44,282,(w-48)/3]]:[[20,162,120],[260,94,120],[260,242,120],[500,32,120],[500,162,120],[500,292,120]];
 const s=canvas(fig,small?w:680,376,'两期股价树。到期支付50、0、0；一季节点24.390244、0；今天11.897680。图下说明当前倒推步骤。');
 for(const [a,b]of [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5]]){const p=pos[a],q=pos[b];path(s,small?`M${p[0]+p[2]/2} ${p[1]+62}L${q[0]+q[2]/2} ${q[1]}`:`M${p[0]+p[2]} ${p[1]+31}L${q[0]} ${q[1]+31}`,'figure-path-off');}
 if(small){addText(s,4,12,'今天');addText(s,4,127,'一季后');addText(s,4,263,'到期');}else{for(const[x,t]of [[80,'今天'],[320,'一季后'],[560,'到期']])addText(s,x,14,t,'figure-label','middle');}
 pos.forEach(([x,y,width],i)=>{const layer=i===0?2:i<3?1:0;const r=svgEl('rect',{x,y,width,height:62,rx:4,class:'figure-node'+(layer===step?' is-focus':'')});s.append(r);addText(s,x+width/2,y+19,'S '+number(stocks[i]),'figure-node-text','middle');addText(s,x+width/2,y+44,layer<=step?'C '+number(vals[i]):'C 待倒推','figure-node-value','middle');});host.replaceChildren(s);
}
function mount(section,id,version){
 if(version==='recap'&&recap[id]){const target=recap[id],key=mounts[target],p=el('p','figure-revisit');const a=el('a','',`打开互动图解：${configs[key].title}`);a.href='#'+target;p.append(a);section.append(p);return;}
 const key=mounts[id];if(version!=='detailed'||!key||!M)return;
 const c=configs[key],state={...c.state},fig=el('figure','lesson-figure teaching-figure');fig.id='interactive-'+key;fig.dataset.title=c.title;fig.dataset.experiment=key;
 const caption=el('figcaption');caption.append(el('span','experiment-number','互动图 6-'+c.no),el('span','experiment-title',c.title));fig.append(caption,el('p','fig-hint',c.prompt));
 if(key==='positions'){const link=el('a','figure-jump','新版教学图解：看清行权与回本 →');link.href='figure-lab/';caption.append(link);}
 const controls=el('div','experiment-controls'),units=el('p','plot-unit',key==='delay'?'单位：万元':key==='tree'?'S：股价 · C：期权价值（元）':key==='hedge'?'单位：元 · 股票数量按股计':'单位：元/股');
 const plot=el('div','experiment-plot'),result=el('div','experiment-result');result.setAttribute('role','status');result.setAttribute('aria-live','polite');result.setAttribute('aria-atomic','true');
 const buttons=el('div','experiment-actions'),reset=el('button','','还原本例');reset.type='button';buttons.append(reset);
 fig.append(controls,units,plot,result,buttons,el('p','figure-note',c.note));
 const refs=[];
 function range(label,k,min,max,step,unit='元'){
  const row=el('div','experiment-control'),uid=fig.id+'-'+k,lab=el('label','',label+'（'+unit+'）'),slider=el('input'),num=el('input');lab.htmlFor=uid;
  slider.type='range';num.type='number';slider.id=uid;num.setAttribute('aria-label',label+'，输入数值，单位'+unit);for(const e of [slider,num]){e.min=min;e.max=max;e.step=step;e.dataset.param=k;}
  row.append(lab,slider,num);controls.append(row);refs.push(()=>{slider.value=state[k];num.value=Number(state[k].toFixed(6));slider.setAttribute('aria-valuetext',number(state[k],6)+unit);});
  slider.addEventListener('input',()=>{state[k]=Number(slider.value);render();});
  num.addEventListener('change',()=>{if(num.value!==''&&Number.isFinite(num.valueAsNumber))state[k]=Math.max(min,Math.min(max,num.valueAsNumber));render();});
 }
 function choose(label,k,opts){const row=el('div','experiment-choice'),lab=el('label','',label),s=el('select'),uid=fig.id+'-'+k;s.id=uid;lab.htmlFor=uid;s.dataset.param=k;for(const[value,text]of opts){const o=el('option','',text);o.value=value;s.append(o);}row.append(lab,s);controls.append(row);refs.push(()=>s.value=state[k]);s.addEventListener('change',()=>{state[k]=s.value;if(key==='positions')state.premium=s.value.includes('put')?5.25:3.8;render();});}
 function action(text,fn){const b=el('button','',text);b.type='button';b.addEventListener('click',()=>{fn();render();});buttons.prepend(b);return b;}
 const names={protect:'保护性看跌',covered:'抛补性看涨',long:'多头对敲',short:'空头对敲'};
 if(key==='underlying')range('到期股价','s',0,160,1);
 if(key==='positions'){choose('期权头寸','type',[['long-call','看涨买方'],['short-call','看涨卖方'],['long-put','看跌买方'],['short-put','看跌卖方']]);range('到期股价','s',0,70,.25);range('期权费','premium',0,12,.05);action('跳到回本点',()=>state.s=37+(state.type.includes('put')?-state.premium:state.premium));}
 if(key==='strategies'){choose('组合策略','type',Object.entries(names));range('到期股价','s',0,120,1);const b=action('拆开看组成',()=>state.parts=!state.parts);refs.push(()=>{b.textContent=state.parts?'看总收入与损益':'拆开看组成';b.setAttribute('aria-pressed',state.parts);});}
 if(key==='value'){range('剩余期限','t',0,2,.05,'年');range('年化波动率','sigma',0,80,1,'%');}
 if(key==='hedge'){range('持股数量','h',0,1.5,'any','股');action('用Δ配比',()=>state.h=M.hedge(0).delta);}
 if(key==='tree'){for(const [n,t]of ['终点支付','倒推一层','回到今天'].entries()){const b=action(t,()=>state.step=n);b.dataset.step=n;refs.push(()=>b.setAttribute('aria-pressed',state.step===n));}buttons.replaceChildren(...[...buttons.children].sort((a,b)=>(a.dataset.step??9)-(b.dataset.step??9)));}
 if(key==='parity')range('到期股价','s',0,180,1);
 if(key==='delay')range('投资成本','k',800,1300,5,'万元');
 reset.addEventListener('click',()=>{Object.assign(state,c.state);render();});
 function resultText(main,calc){result.replaceChildren(el('p','experiment-equation',calc),el('p','experiment-conclusion',main));}
 function render(){refs.forEach(fn=>fn());fig.dataset.state=JSON.stringify(state);
  const main='figure-series-main',compare='figure-series-compare',total='figure-series-total',part='figure-series-part';
  if(key==='underlying'){chart(fig,plot,{series:[{name:'股票市值',fn:s=>s,cls:part},{name:'执行收入',fn:s=>M.call(s,100),cls:main}],domain:[0,160],range:[0,160],ticks:[0,100,160],breaks:[100],cursor:state.s});const p=M.call(state.s,100);resultText(state.s>100?'按100元买入，再按市价衡量，买入权带来差额收入。':'股票本身仍有市价；买入权此时没有正的执行收入。',`股票市值 ${number(state.s)}；执行收入 = max(${number(state.s)} − 100, 0) = ${number(p)}。`);}
  if(key==='positions'){const p=M.position(state.s,state.type,state.premium),put=state.type.includes('put'),seller=state.type.startsWith('short');chart(fig,plot,{series:[{name:'到期净收入',fn:s=>M.position(s,state.type,state.premium).payoff,cls:main},{name:'净损益',fn:s=>M.position(s,state.type,state.premium).profit,cls:compare}],domain:[0,70],range:seller?[-40,15]:[-15,40],ticks:[0,37,70],breaks:[37,37+(put?-state.premium:state.premium)],cursor:state.s});const action=put?state.s<37:state.s>37;resultText(`${action?'买方行权有正收入':'买方没有正的行权收入'}；当前${seller?'卖方':'买方'}${p.profit>1e-8?'盈利':p.profit< -1e-8?'亏损':'恰好回本'}。`,`${number(p.payoff)} ${seller?'+':'−'} ${number(state.premium)} = ${number(p.profit)}；回本股价 ${number(37+(put?-state.premium:state.premium))}。`);}
  if(key==='strategies'){const v=M.strategy(state.s,state.type),f=s=>M.strategy(s,state.type),isStock=['protect','covered'].includes(state.type);const series=state.parts?[{name:isStock?'股票':'看涨',fn:s=>f(s).a,cls:part},{name:state.type==='covered'?'看涨空头':'看跌',fn:s=>f(s).b,cls:part},{name:'合计收入',fn:s=>f(s).a+f(s).b,cls:total}]:[{name:'合计收入',fn:s=>f(s).a+f(s).b,cls:total},{name:'净损益',fn:s=>f(s).a+f(s).b-f(s).cost,cls:compare}];chart(fig,plot,{series,domain:[0,120],range:[-70,120],ticks:[0,60,120],breaks:[60],cursor:state.s});resultText(({protect:'买入看跌把到期收入托在60元；投入64元，最低净损益为−4元。',covered:'收入最高60元；投入54元，最高净损益6元，下跌仍会造成亏损。',long:'股价偏离60元超过10元，才能覆盖两份期权费。',short:'股价在50至70元之间盈利；继续偏离会增加履约损失。'})[state.type],`组成 ${number(v.a)} + (${number(v.b)}) = 收入 ${number(v.a+v.b)}；减初始净投入 ${number(v.cost)} = 损益 ${number(v.a+v.b-v.cost)}。`);}
  if(key==='value'){const c=M.bs(104,100,state.t,state.sigma/100),intrinsic=4;chart(fig,plot,{series:[{name:'模型价值',fn:s=>M.bs(s,100,state.t,state.sigma/100),cls:main},{name:'内在价值',fn:s=>M.call(s,100),cls:part}],domain:[60,140],range:[0,100],ticks:[60,100,140],breaks:[100],cursor:104,xLabel:'当前股价（元）'});resultText(state.t===0?'到期时，模型价值与执行收入重合，时间价值归零。':'在这个无股利欧式看涨模型中，曲线与内在价值线的间距就是时间价值。',`当前股价104：模型价值 ${number(c)} = 内在价值4 + 时间价值 ${number(c-intrinsic)}；波动率 ${number(state.sigma)}%。`);}
  if(key==='hedge'){const v=M.hedge(state.h),diff=v.up-v.down;barRows(fig,plot,[{label:'上涨到105',value:v.up,note:`股票 ${number(105*state.h)} − 期权支付15`},{label:'下跌到71.4',value:v.down,note:`股票 ${number(71.4*state.h)} − 期权支付0`}],-15,145);resultText(Math.abs(diff)<1e-7?'两个状态都留下31.875元，可以按无风险利率折现。':'两种状态仍有差额；改变持股数量，才能抵销期权支付的变化。',`终值差额 = ${number(v.up,6)} − ${number(v.down,6)} = ${number(diff,6)}。${Math.abs(diff)<1e-7?'今天成本 = 31.875 ÷ 1.025 = 31.097561。':''}`);}
  if(key==='tree'){drawTree(fig,plot,state.step);const m=M.tree();resultText(['先按到期股价计算行权收入；同一终点96元可由两条路径到达。','分别计算一季后两个节点。中间节点还未到期，需要保留下一季机会。','再把一季后的期权价值折回今天；两次倒推各折现一期。'][state.step],['max(150−100,0)=50；其余到期支付为0。',`上涨节点：(0.5×50 + 0.5×0) ÷ 1.025 = ${number(m.middle[0],6)}。`,`今天：(0.5×${number(m.middle[0],6)} + 0.5×0) ÷ 1.025 ≈ ${number(m.today)}。`][state.step]);}
  if(key==='parity'){const v=M.parity(state.s);barRows(fig,plot,[{label:'A · 看涨＋到期现金',value:v.total,segments:[v.call,v.cash],note:`看涨 ${number(v.call)} + 现金100`},{label:'B · 股票＋看跌',value:v.total,segments:[v.stock,v.put],note:`股票 ${number(v.stock)} + 看跌 ${number(v.put)}`}],0,180);resultText('两组资产在每个到期股价下都支付相同金额，因此今天成本应相等。',`到期两边都等于 ${number(v.total)}；今天 C₀ + PV(100) = S₀ + P₀。`);}
  if(key==='delay'){const v=M.delay(state.k);barRows(fig,plot,[{label:'立即投资',value:v.now,note:`1,000 − ${number(state.k)}`},{label:'等待一年',value:v.wait,note:`需求好：投后净额${number(v.up)}；需求差：${number(v.down)}`},{label:'现在放弃',value:0,note:'项目净现值为0'}],-300,250);resultText(v.now>v.wait&&v.now>0?'当前成本下，立即投资的净现值更高。':v.wait>0?'等待策略保留择机投资的权利，当前净现值最高。':'现在投资与等待均无正的净现值，可放弃。',`等待 = (0.3434×${number(v.up)} + 0.6566×${number(v.down)}) ÷ 1.05 = ${number(v.wait)}；相对立即投资的增值 ${number(v.increment)}。`);}
 }
 const intro=key==='underlying'?section.querySelector(':scope > p'):null,takeaway=section.querySelector('.takeaway');if(intro)intro.after(fig);else if(takeaway)takeaway.before(fig);else section.append(fig);render();
 const resize=()=>{if(fig.isConnected)render();};observers.push(new ResizeObserver(resize));observers.at(-1).observe(plot);
}
let observers=[];window.CpaFigures={mount,clear(){observers.forEach(o=>o.disconnect());observers=[];}};
})();
