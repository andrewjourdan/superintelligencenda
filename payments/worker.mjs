const encoder = new TextEncoder();
const ORIGIN = 'https://www.superintelligencenda.com';
const PAYMENT_LINK = 'https://buy.stripe.com/eVq6oJefs4aRcxGf6OfYY00';
const PAYMENT_LINK_ID = 'plink_1UdUHCPLxF0ESp8cJlU9fYN5';
const MAX_BODY = 900000;
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,'0')).join('');
const hash = async text => hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
async function hmac(secret, message) {
  const key = await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(message)));
}
async function signatureOK(raw, header, secret) {
  if (!secret || !header) return false;
  const fields = header.split(',').map(x => x.trim().split('='));
  const t = fields.find(x => x[0] === 't')?.[1];
  if (!/^\d+$/.test(t || '') || Math.abs(Date.now()/1000 - Number(t)) > 300) return false;
  const key = await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  for (const [,sig] of fields.filter(x => x[0] === 'v1')) {
    if (!/^[a-f0-9]{64}$/i.test(sig || '')) continue;
    const bytes = Uint8Array.from(sig.match(/../g),h=>parseInt(h,16));
    if (await crypto.subtle.verify('HMAC',key,bytes,encoder.encode(t+'.'+raw))) return true;
  }
  return false;
}
async function boundedBody(request, maximum=MAX_BODY) {
  if (Number(request.headers.get('content-length') || 0) > maximum) throw new Error('body_too_large');
  const reader=request.body?.getReader();
  if (!reader) return '';
  const chunks=[]; let length=0;
  while (true) {
    const {value,done}=await reader.read(); if(done) break;
    length+=value.byteLength;
    if(length>maximum){await reader.cancel();throw new Error('body_too_large');}
    chunks.push(value);
  }
  const bytes=new Uint8Array(length);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return new TextDecoder().decode(bytes);
}
function json(data,status=200) {
  return Response.json(data,{status,headers:{
    'Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin','Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'
  }});
}
function bearer(request) {return request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1] || '';}
async function license(env,id) {return 'snda_live_'+id.replaceAll('-','')+'.'+await hmac(env.TOKEN_SECRET,'license:'+id);}
async function orderForToken(env,id,token) {
  if(!/^[a-f0-9-]{36}$/.test(id) || !token) return null;
  return env.DB.prepare('SELECT * FROM orders WHERE id=? AND token_hash=?').bind(id,await hash(token)).first();
}
async function createOrder(request,env) {
  if(request.headers.get('origin')!==ORIGIN) return json({error:'origin_not_allowed'},403);
  if(!request.headers.get('content-type')?.includes('application/json')) return json({error:'json_required'},415);
  const ip=await hmac(env.TOKEN_SECRET,request.headers.get('cf-connecting-ip') || 'unknown');
  const bucket=Math.floor(Date.now()/3600000);
  const rate=await env.DB.prepare('INSERT INTO rate_limits (bucket,key,count) VALUES (?,?,1) ON CONFLICT(bucket,key) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,ip).first();
  if(rate.count>10) return json({error:'too_many_orders_try_later'},429);
  let body;try{body=JSON.parse(await boundedBody(request));}catch{return json({error:'invalid_or_oversized_order'},400);}
  if(typeof body.bundle!=='string' || body.bundle.length<100 || encoder.encode(body.bundle).length>800000 ||
      !body.bundle.includes('SUPERINTELLIGENCENDA.COM') || !body.bundle.includes('OMNIBUS')) return json({error:'invalid_document_bundle'},400);
  const id=crypto.randomUUID(), token=crypto.randomUUID()+crypto.randomUUID();
  const key=await license(env,id);
  await env.DB.prepare('INSERT INTO orders (id,token_hash,license_hash,bundle,created_at,status) VALUES (?,?,?,?,?,?)')
    .bind(id,await hash(token),await hash(key),body.bundle,Math.floor(Date.now()/1000),'pending').run();
  const checkout=new URL(PAYMENT_LINK);checkout.searchParams.set('client_reference_id',id);
  return json({order_id:id,access_token:token,checkout_url:checkout.href},201);
}
async function webhook(request,env) {
  let raw;try{raw=await boundedBody(request,1500000);}catch{return json({error:'payload_too_large'},413);}
  if(!await signatureOK(raw,request.headers.get('stripe-signature'),env.STRIPE_WEBHOOK_SECRET))return json({error:'invalid_signature'},400);
  let event;try{event=JSON.parse(raw);}catch{return json({error:'invalid_json'},400);}
  if(!event.livemode)return json({received:true,ignored:'test_event'});
  const s=event.data?.object;
  if(!s)return json({error:'missing_object'},400);
  if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)){
    if(s.payment_link!==PAYMENT_LINK_ID || s.payment_status!=='paid' || s.mode!=='payment' ||
       !(s.amount_total>0) || !(s.amount_subtotal>0) ||
       (s.currency==='usd' && s.amount_subtotal!==27500))return json({received:true,ignored:'not_a_paid_bundle'});
    const id=s.client_reference_id;
    if(!/^[a-f0-9-]{36}$/.test(id || ''))return json({received:true,ignored:'unlinked_checkout'});
    const intent=typeof s.payment_intent==='string'?s.payment_intent:s.payment_intent?.id;
    if(!intent)return json({error:'missing_payment_intent'},400);
    const result=await env.DB.prepare(`UPDATE orders SET
      status=CASE WHEN status='revoked' OR EXISTS(SELECT 1 FROM revoked_intents WHERE payment_intent=?) THEN 'revoked' ELSE 'paid' END,
      session_id=?,payment_intent=?,paid_at=COALESCE(paid_at,?),amount_paid=?,currency=?
      WHERE id=? AND (session_id IS NULL OR session_id=?)`)
      .bind(intent,s.id,intent,event.created,s.amount_total,s.currency,id,s.id).run();
    if(!result.meta.changes)return json({error:'order_not_found_or_already_linked'},409);
    console.log(JSON.stringify({event:'payment_verified',order_id:id}));
  }else if(['charge.refunded','charge.dispute.created'].includes(event.type)){
    const intent=typeof s.payment_intent==='string'?s.payment_intent:s.payment_intent?.id;
    if(intent)await env.DB.batch([
      env.DB.prepare('INSERT OR IGNORE INTO revoked_intents (payment_intent,created_at) VALUES (?,?)').bind(intent,event.created),
      env.DB.prepare("UPDATE orders SET status='revoked' WHERE payment_intent=?").bind(intent)
    ]);
  }else if(['checkout.session.async_payment_failed','checkout.session.expired'].includes(event.type)){
    if(s.payment_link===PAYMENT_LINK_ID)await env.DB.prepare("UPDATE orders SET status='failed' WHERE id=? AND status='pending'").bind(s.client_reference_id || '').run();
  }
  return json({received:true});
}
async function authenticatedOrder(request,env,id) {
  const order=await orderForToken(env,id,bearer(request));
  if(!order)return {error:json({error:'invalid_order_access'},401)};
  if(order.status!=='paid')return {error:json({error:'payment_not_verified',status:order.status},402)};
  return {order};
}
async function apiOrder(request,env) {
  const token=bearer(request);
  if(!token.startsWith('snda_live_') || token.length>200)return null;
  return env.DB.prepare("SELECT * FROM orders WHERE license_hash=? AND status='paid'").bind(await hash(token)).first();
}
function receipt(order) {return {
  order_id:order.id,paid_at:new Date(order.paid_at*1000).toISOString(),
  amount_paid:order.amount_paid,currency:order.currency.toUpperCase(),
  stripe_checkout_session:order.session_id,document_sha256:order.bundle_hash,
  scope:'SuperintelligenceNDA document access only',
  note:'Payment verification is not proof of third-party assent or legal enforceability.'
};}
async function bundleResponse(order) {
  order.bundle_hash=await hash(order.bundle);
  return new Response(order.bundle+'\n\nPAYMENT RECEIPT\n'+JSON.stringify(receipt(order),null,2),{headers:{
    'Content-Type':'text/plain; charset=utf-8',
    'Content-Disposition':'attachment; filename="SuperintelligenceNDA-Complete-Bundle.txt"',
    'Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'
  }});
}
export default {
  async fetch(request,env) {
    try{
      const url=new URL(request.url),path=url.pathname;
      if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{
        'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'Authorization,Content-Type',
        'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin','Access-Control-Max-Age':'600'}});
      if(path==='/health' && request.method==='GET')return json({service:'SuperintelligenceNDA delivery',status:'ok'});
      if(path==='/webhooks/stripe' && request.method==='POST')return await webhook(request,env);
      if(path==='/v1/orders' && request.method==='POST')return await createOrder(request,env);
      const match=path.match(/^\/v1\/orders\/([a-f0-9-]{36})(?:\/(bundle|credentials))?$/);
      if(match && request.method==='GET'){
        const [ ,id,action]=match;
        const order=await orderForToken(env,id,bearer(request));
        if(!order)return json({error:'invalid_order_access'},401);
        if(!action)return json({order_id:id,status:order.status});
        const access=await authenticatedOrder(request,env,id);if(access.error)return access.error;
        if(action==='bundle')return await bundleResponse(order);
        return json({api_key:await license(env,id),api_base:'https://api.superintelligencenda.com/v1',
          scope:['documents:read'],note:'This credential works only with SuperintelligenceNDA endpoints.'});
      }
      if(['/v1/me','/v1/documents/bundle'].includes(path) && request.method==='GET'){
        const order=await apiOrder(request,env);if(!order)return json({error:'invalid_or_revoked_api_key'},401);
        if(path==='/v1/documents/bundle')return bundleResponse(order);
        return json({order_id:order.id,scope:['documents:read'],service:'SuperintelligenceNDA',payment_verified:true});
      }
      return json({error:'not_found'},404);
    }catch(error){
      console.error(JSON.stringify({event:'request_failed',type:error?.name || 'Error'}));
      return json({error:'service_temporarily_unavailable'},503);
    }
  },
  async scheduled(event,env){
    const now=Math.floor(Date.now()/1000);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM orders WHERE status IN ('pending','failed') AND created_at<?").bind(now-30*86400),
      env.DB.prepare('DELETE FROM rate_limits WHERE bucket<?').bind(Math.floor(Date.now()/3600000)-48)
    ]);
  }
};
export {signatureOK,hash,hmac,license};
