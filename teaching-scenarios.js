/* One row is one price scenario, shared by the plotted dots and calculation table. */
(() => {
  const M = window.CpaTeachingModels;
  const unique = values => values.sort((a,b)=>a-b).filter((v,i,a)=>!i||Math.abs(v-a[i-1])>1e-8);
  window.CpaPriceScenarios = (spec, s) => {
    const lesson = spec.lesson || spec.n;
    let prices, columns, cells, unit='元/股', priceLabel='到期股价（元）', digits=2;
    if (lesson===5) {
      const type=s.type, short=!!spec.short, fee=s.fee, even=M.position(0,type,short,fee).breakeven;
      const local=s.zoom==='local', lo=local?25:0, hi=local?55:70;
      prices=[lo,30,37,even,45,hi].filter(x=>x>=lo&&x<=hi);
      columns=[`执行收入\n${short?'−':''}max(${type==='put'?'37−Sₜ':'Sₜ−37'},0)`,`期初期权费现金流\n${short?'收到':'支付'} ${fee}`,'净损益\n执行收入＋期初现金流'];
      cells=x=>{const v=M.position(x,type,short,fee);return[v.income,short?fee:-fee,v.profit];};
    } else if (lesson===7) {
      const t=s.type, stock=['protect','covered'].includes(t), cost=M.strategy(60,t).cost;
      prices=[0,40,50,60,70,80,120,...(t==='protect'?[64]:t==='covered'?[54]:[])];
      const first=stock?'① 股票市值\nSₜ':`① ${t==='short'?'卖出':'买入'}看涨\n${t==='short'?'−':''}max(Sₜ−60,0)`;
      const second=t==='covered'?'② 卖出看涨\n−max(Sₜ−60,0)':`② ${t==='short'?'卖出':'买入'}看跌\n${t==='short'?'−':''}max(60−Sₜ,0)`;
      columns=[first,second,'③ 组合收入\n①＋②',`④ 初始净投入\n${cost<0?'−（4＋6）＝−10，负值表示净收款':t==='protect'?'58＋6':t==='covered'?'58−4':'4＋6'}`,'净损益\n③−④'];
      cells=x=>{const v=M.strategy(x,t);return[v.a,v.b,v.income,v.cost,v.profit];};
    } else if (lesson===8) {
      prices=[0,30,50,60,80,100];unit='元（全部持仓）';
      columns=['① 股票市值\n100×Sₜ',`② 看跌收入\n${100*s.h}×max(60−Sₜ,0)`,'③ 总收入\n①＋②','④ 初始净投入\n6,000＋期权费','净损益\n③−④'];
      cells=x=>{const v=M.strategy(x,'protect',s.h);return[100*v.a,100*v.b,100*v.income,100*v.cost,100*v.profit];};
    } else if (lesson===9) {
      prices=[0,40,54,60,66,80,100];unit='元（全部持仓）';
      if(spec.n===39) {
        const v=M.equalCapital(s.s,s.div);prices=[0,40,60,62.5,65,72.9,80,100];
        columns=['甲股票市值\n1,000×Sₜ','甲看跌收入\n1,000×max(60−Sₜ,0)',`甲股利收入\n1,000×${v.div}`,'甲净损益\n股票＋看跌＋股利−62,500','乙看涨收入\n12,500×max(Sₜ−60,0)','乙净损益\n看涨收入−62,500'];
        cells=x=>{const a=M.equalCapital(x,s.div);return[a.stock,a.put,a.dividend,a.protectProfit,a.callIncome,a.callProfit];};
      } else {
        columns=['① 股票市值\n100×Sₜ','② 看涨空头支付\n−100×max(Sₜ−60,0)',`③ 股利收入\n100×${s.div}`,'④ 总流入\n①＋②＋③','净损益\n④−5,400'];
        cells=x=>[100*x,-100*M.call(x,60),100*s.div,100*(Math.min(x,60)+s.div),100*(Math.min(x,60)+s.div-54)];
      }
    } else if (lesson===10) {
      prices=[20,28,30.26,32,39,45,47.74,50,58];unit='万元（全部组合）';
      columns=['① 买入K28\n0.5×max(Sₜ−28,0)','② 卖出K39\n−max(Sₜ−39,0)','③ 买入K50\n0.5×max(Sₜ−50,0)','④ 总收入\n①＋②＋③','净损益\n④−1.13'];
      cells=x=>{const a=.5*M.call(x,28),b=-M.call(x,39),c=.5*M.call(x,50);return[a,b,c,a+b+c,a+b+c-1.13];};
    } else if (lesson===11) {
      const a=s.type==='one'?4000:8000,b=12000-a,fee=s.type==='one'?10:8,lo=7.763-fee/a,hi=7.763+fee/b;
      prices=[7.55,7.6,7.757,lo,7.763,hi,7.77,7.8,8];
      unit='万元人民币';priceLabel='到期汇率（元/欧元）';digits=5;
      columns=[`① 看跌收入\n${a}×max(7.763−汇率,0)`,`② 看涨收入\n${b}×max(汇率−7.763,0)`,'③ 总收入\n①＋②',`④ 支付期权费\n${fee}万元`,'净损益\n③−④'];
      cells=x=>{const p=a*M.put(x,7.763),c=b*M.call(x,7.763);return[p,c,p+c,fee,p+c-fee];};
    } else return null;
    const rows=unique([...prices,s.s]).map(price=>({price,values:cells(price)}));
    return {rows,columns,unit,priceLabel,digits};
  };
})();
