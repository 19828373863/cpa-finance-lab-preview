/* Chapter 6 teaching calculations. Values are not rounded before reuse. */
(function(root){'use strict';
const call=(s,k)=>Math.max(s-k,0),put=(s,k)=>Math.max(k-s,0);
function cdf(x){if(x===0)return .5;const z=Math.abs(x),t=1/(1+.2316419*z),a=Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)*t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x>0?1-a:a;}
function bs(s=104,k=100,t=.75,sigma=.25,r=.03,y=0){
 const a=s*Math.exp(-y*t),b=k*Math.exp(-r*t);
 if(t===0||sigma===0||s===0)return{call:Math.max(a-b,0),put:Math.max(b-a,0),a,b,d1:null,d2:null};
 const d1=(Math.log(s/k)+(r-y+sigma*sigma/2)*t)/(sigma*Math.sqrt(t)),d2=d1-sigma*Math.sqrt(t);
 return{call:a*cdf(d1)-b*cdf(d2),put:b*cdf(-d2)-a*cdf(-d1),a,b,d1,d2,n1:cdf(d1),n2:cdf(d2)};
}
function position(s,type='call',short=false,fee=3.8,k=37){const income=(short?-1:1)*(type==='put'?put(s,k):call(s,k));return{income,profit:income+(short?fee:-fee),breakeven:k+(type==='put'?-fee:fee)};}
function strategy(s,type='protect',h=1,div=0){
 const a=type==='protect'||type==='covered'?s+div:call(s,60)*(type==='short'?-1:1);
 const b=type==='covered'?-h*call(s,60):put(s,60)*h*(type==='short'?-1:1);
 const cost=type==='protect'?60+4*h:type==='covered'?60-6*h:type==='short'?-10:10;
 return{a,b,cost,income:a+b,profit:a+b-cost};
}
function equalCapital(s,div=2.7){
 const initialStock=60,strike=60,stockQty=1000,putQty=1000,putFee=2.5,callFee=5;
 const protectCost=stockQty*initialStock+putQty*putFee,budget=protectCost,callQty=budget/callFee,callCost=callQty*callFee;
 const stock=stockQty*s,putIncome=putQty*put(s,strike),dividend=stockQty*div,protectIncome=stock+putIncome+dividend,protectProfit=protectIncome-protectCost,callIncome=callQty*call(s,strike),callProfit=callIncome-callCost;
 return{s,div,initialStock,strike,stockQty,putQty,callQty,putFee,callFee,budget,protectCost,callCost,stock,put:putIncome,dividend,protectIncome,protectProfit,protectReturn:protectProfit/protectCost,callIncome,callProfit,callReturn:callProfit/callCost};
}
function replication(type='call',k=90){
 const f=type==='put'?put:call,up=f(105,k),down=f(71.4,k),h=(up-down)/(105-71.4),debtEnd=h*71.4-down,debt=debtEnd/1.025;
 return{up,down,h,debtEnd,debt,value:84*h-debt,q:(1.025-.85)/(1.25-.85)};
}
function binomial({s=96,k=100,u=1.25,d=.8,R=1.025,n=2,type='call',american=false}={}){
 const q=(R-d)/(u-d);if(!(d<R&&R<u))return{valid:false,q};
 const stocks=[],values=[],holds=[],exercise=[],delta=[];
 for(let t=0;t<=n;t++){stocks[t]=Array.from({length:t+1},(_,j)=>s*u**j*d**(t-j));values[t]=[];holds[t]=[];exercise[t]=[];delta[t]=[];}
 const f=type==='put'?put:call;values[n]=stocks[n].map(x=>f(x,k));holds[n]=[...values[n]];exercise[n]=values[n].map(v=>v>0);
 for(let t=n-1;t>=0;t--)for(let j=0;j<=t;j++){
  const hold=((1-q)*values[t+1][j]+q*values[t+1][j+1])/R,now=f(stocks[t][j],k);
  holds[t][j]=hold;values[t][j]=american?Math.max(hold,now):hold;exercise[t][j]=american&&now>hold+1e-10;
  delta[t][j]=(values[t+1][j+1]-values[t+1][j])/(stocks[t+1][j+1]-stocks[t+1][j]);
 }
 return{valid:true,q,R,n,k,type,stocks,values,holds,exercise,delta,value:values[0][0]};
}
function crr(n=6){const T=.5,dt=T/n,u=Math.exp(.4068*Math.sqrt(dt)),d=1/u,R=(1+.04/12)**(12*dt);return{dt,u,d,...binomial({s:50,k:52.08,u,d,R,n})};}
const annuity=(r,n)=>(1-(1+r)**-n)/r;
function expansion(type='wearable'){
 const a=type==='wearable'?{cost:1000,base:[200,300,400,400,400],later:[800,800,800,800,800],k:2000,t:3,r:.1,wacc:.2,sigma:.35}:{cost:1500,base:[600,600,300,100],later:[1500,1500,1500,600,200],k:3200,t:2,r:.03,wacc:.15,sigma:.25};
 a.baseNPV=a.base.reduce((v,c,i)=>v+c/(1+a.wacc)**(i+1),-a.cost);a.s=a.later.reduce((v,c,i)=>v+c/(1+a.wacc)**(a.t+i+1),0);a.pvk=a.k/(1+a.r)**a.t;a.option=bs(a.s,a.k,a.t,a.sigma,Math.log(1+a.r)).call;a.total=a.baseNPV+a.option;return a;
}
function delay(k=1050,patent=false){
 const s=patent?120*annuity(.1,10):1000,up=patent?160*annuity(.1,9):1250,down=patent?90*annuity(.1,9):800,cu=patent?160:125,cd=patent?90:80;
 const qExact=(1.05*s-down-cd)/(up+cu-down-cd),q=patent?qExact:.3434,pu=call(up,k),pd=call(down,k),wait=(q*pu+(1-q)*pd)/1.05,now=s-k;
 return{s,up,down,cu,cd,q,qExact,pu,pd,wait,now,increment:wait-now,best:Math.max(0,now,wait)};
}
function equipment(){const high=50/1.05,low=12/1.05,base=(.5*(12+high)+.5*(4+low))/1.05,value=(.5*(12+high)+.5*(4+25))/1.05;return{high,low,base,value,npv:value-30,increment:value-base};}
function mine(){
 const n=5,u=Math.exp(.35),d=1/u,q=(1.05-d)/(u-d),salvage=[0,530,500,400,300,200],cash=[],v=[],base=[],hold=[];
 for(let t=0;t<=n;t++){cash[t]=Array.from({length:t+1},(_,j)=>290*u**j*d**(t-j)-100);v[t]=[];base[t]=[];hold[t]=[];}
 v[5]=base[5]=Array(6).fill(200);
 for(let t=4;t>=0;t--)for(let j=0;j<=t;j++){
  hold[t][j]=((1-q)*(cash[t+1][j]+v[t+1][j])+q*(cash[t+1][j+1]+v[t+1][j+1]))/1.05;
  v[t][j]=t?Math.max(hold[t][j],salvage[t]):hold[t][j];base[t][j]=((1-q)*(cash[t+1][j]+base[t+1][j])+q*(cash[t+1][j+1]+base[t+1][j+1]))/1.05;
 }
 return{u,d,q,salvage,cash,v,base,hold,value:v[0][0],increment:v[0][0]-base[0][0]};
}
const api={call,put,cdf,bs,position,strategy,equalCapital,replication,binomial,crr,annuity,expansion,delay,equipment,mine};
if(typeof module!=='undefined')module.exports=api;else root.CpaTeachingModels=api;
})(typeof window!=='undefined'?window:globalThis);
