// core/accuracyEngine.js
// Combines multiple checks to produce a confidence score
const { rsiCalc, atrCalc } = require('./strategyFusion');

function computeConfidence(candles){
  // returns a 0-100 confidence based on indicators
  const closes = candles.map(c=>c.close);
  const rsi = rsiCalc(closes,14);
  const atr = atrCalc(candles,14);
  let score = 50;
  if(rsi < 30) score += 10;
  if(rsi > 70) score -= 10;
  if(atr && atr < 0.0004) score += 6;
  // add more heuristics...
  return Math.max(10, Math.min(99, Math.round(score)));
}

module.exports = { computeConfidence };
