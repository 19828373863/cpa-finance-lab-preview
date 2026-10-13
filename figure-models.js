/* Deterministic teaching models. Inputs use the units stated beside each figure. */
(function(root){'use strict';
const call=(s,k)=>Math.max(s-k,0),put=(s,k)=>Math.max(k-s,0);
function position(s,type,premium){const payoff=(type.includes('put')?put(s,37):call(s,37))*(type.startsWith('short')?-1:1);return {payoff,profit:payoff+(type.startsWith('short')?premium:-premium)};}
function strategy(s,type){
 if(type==='protect')return {a:s,b:put(s,60),cost:64};
 if(type==='covered')return {a:s,b:-call(s,60),cost:54};
 const sign=type==='long'?1:-1;return {a:sign*call(s,60),b:sign*put(s,60),cost:sign*10};
}
function hedge(h){return {up:h*105-15,down:h*71.4,delta:15/(105-71.4)};}
function cdf(x){const z=Math.abs(x),t=1/(1+.2316419*z);const tail=Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)*t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x>=0?1-tail:tail;}
function bs(s,k,t,sigma,r=.03){if(t<=0)return call(s,k);if(s<=0)return 0;if(sigma<=0)return Math.max(s-k*Math.exp(-r*t),0);const d1=(Math.log(s/k)+(r+sigma*sigma/2)*t)/(sigma*Math.sqrt(t)),d2=d1-sigma*Math.sqrt(t);return s*cdf(d1)-k*Math.exp(-r*t)*cdf(d2);}
function tree(){const q=.5,R=1.025,terminal=[50,0,0],middle=[25/R,0];return {q,R,terminal,middle,today:middle[0]*q/R};}
function parity(s){return {call:call(s,100),cash:100,stock:s,put:put(s,100),total:Math.max(s,100)};}
function delay(k){const q=.3434,up=Math.max(1250-k,0),down=Math.max(800-k,0),wait=(q*up+(1-q)*down)/1.05,now=1000-k;return{up,down,wait,now,increment:wait-now,best:Math.max(0,wait,now)};}
const models={call,put,position,strategy,hedge,cdf,bs,tree,parity,delay};
if(typeof module!=='undefined'&&module.exports)module.exports=models;else root.CpaFigureModels=models;
})(typeof window!=='undefined'?window:globalThis);
