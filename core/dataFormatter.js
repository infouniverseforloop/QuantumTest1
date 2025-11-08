// core/dataFormatter.js
function formatSignalForSend(sig){
  const s = {
    pair: sig.pair,
    direction: sig.direction,
    confidence: sig.confidence,
    entry: sig.entry,
    sl: sig.sl,
    tp: sig.tp,
    entry_ts: sig.entry_ts,
    expiry_ts: sig.expiry_ts,
    notes: sig.notes,
    branding: { owner: process.env.OWNER_NAME || 'David Mamun William' }
  };
  return s;
}
module.exports = { formatSignalForSend };
