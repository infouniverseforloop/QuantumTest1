// core/strategyFusion.js
// Small collection of helpers used by compute logic: SMA, RSI, ATR
function sma(arr,n){ if(!arr || arr.length < n) return null; return arr.slice(-n).reduce((a,b)=>a+b,0)/n; }
function rsiCalc(closes, p=14){
  if(!closes || closes.length < p+1) return 50;
  let gains=0, losses=0;
  for(let i=closes.length-p;i<closes.length;i++){
    const d = closes[i] - closes[i-1];
    if(d>0) gains+=d; else losses+=Math.abs(d);
  }
  const avgG = gains/p, avgL = (losses/p) || 1e-8;
  const rs = avgG/avgL;
  return 100 - (100/(1+rs));
}
function atrCalc(candles, p=14){
  if(!candles || candles.length < p) return null;
  const trs = [];
  for(let i=1;i<candles.length;i++){
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i-1].close),
      Math.abs(candles[i].low - candles[i-1].close)
    );
    trs.push(tr);
  }
  const atr = trs.slice(-p).reduce((a,b)=>a+b,0)/p;
  return atr;
}
module.exports = { sma, rsiCalc, atrCalc };
