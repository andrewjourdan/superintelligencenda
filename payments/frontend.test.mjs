
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const elements=new Map();
const document={getElementById(id){if(!elements.has(id))elements.set(id,{disabled:false,textContent:'',classList:{remove(){}},addEventListener(name,fn){this[name]=fn;}});return elements.get(id);}};
const values=new Map();
const localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
const location={search:'?checkout=return'};
let assigned='',downloaded='',currentStatus='pending';
const window={location:{assign(url){assigned=url;}},addEventListener(){}};
const userNameInput={value:'Test'},userEmailInput={value:'test@example.com',checkValidity:()=>true};
const intelligenceEntities=[{checked:true}],US_STATES_LEGAL_DB=[{}];
const generateOmnibusContractText=()=>'OMNIBUS TEST',generateSingleStateContractText=()=>'STATE TEST';
const updateLiveCryptographicHash=async()=>{},showStatusMessage=()=>{};
const triggerTextDownload=(name,contents)=>{downloaded=contents;};
const fetch=async(url,opts={})=>{
 if(opts.method==='POST')return Response.json({order_id:'test-order',access_token:'private-token',checkout_url:'https://buy.stripe.com/test'});
 assert(opts.headers.Authorization==='Bearer private-token','order token required');
 if(url.endsWith('/credentials'))return Response.json({api_key:'snda_live_verified'});
 if(url.endsWith('/bundle'))return new Response('VERIFIED BUNDLE');
 return Response.json({status:currentStatus});
};
        const DELIVERY_API = 'https://api.superintelligencenda.com';
        const ORDER_STORAGE = 'snda.delivery.order.v1';
        let verifiedServiceKey = '';
        let deliveryPolling = false;
        function savedOrder() {
            try { return JSON.parse(localStorage.getItem(ORDER_STORAGE) || 'null'); }
            catch { return null; }
        }
        function deliveryStatus(text) {
            document.getElementById('orderDelivery').classList.remove('hidden');
            document.getElementById('deliveryStatusText').textContent = text;
        }
        async function orderRequest(path) {
            const order = savedOrder();
            if (!order) throw new Error('No saved order. Start checkout from this browser.');
            const response = await fetch(DELIVERY_API + '/v1/orders/' + order.order_id + path, {
                headers: {Authorization: 'Bearer ' + order.access_token}, cache: 'no-store'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error === 'payment_not_verified'
                    ? 'Payment is not verified yet. Please check again shortly.'
                    : 'Order access is unavailable. Check your payment status or contact support.');
            }
            return response;
        }
        async function downloadPaidBundle(automatic = false) {
            try {
                const response = await orderRequest('/bundle');
                triggerTextDownload('SuperintelligenceNDA-Paid-Document-Bundle.txt', await response.text());
                const order = savedOrder();
                localStorage.setItem(ORDER_STORAGE, JSON.stringify({...order, downloaded: true}));
                if (!automatic) deliveryStatus('Your verified document bundle has been downloaded.');
            } catch (error) { deliveryStatus(error.message); }
        }
        async function checkOrder() {
            if (!savedOrder()) return 'missing';
            const status = await (await orderRequest('')).json();
            if (status.status !== 'paid') {
                verifiedServiceKey = '';
                document.getElementById('universalPluginApiKeyDisplay').textContent = status.status === 'revoked' ? 'Access revoked' : 'Available after verified payment';
                document.getElementById('paidBundleBtn').disabled = true;
                document.getElementById('saveServiceConfigBtn').disabled = true;
                document.getElementById('apiKeyStatusBadge').textContent = status.status === 'revoked' ? 'ACCESS REVOKED' : 'AWAITING PAYMENT';
                deliveryStatus(status.status === 'revoked'
                    ? 'Access was revoked following a refund or payment dispute.'
                    : status.status === 'failed'
                    ? 'This checkout did not complete. You can start a new checkout.'
                    : 'Waiting for verified payment from Stripe. Some payment methods take longer to settle.');
                return status.status;
            }
            const credentials = await (await orderRequest('/credentials')).json();
            verifiedServiceKey = credentials.api_key;
            document.getElementById('universalPluginApiKeyDisplay').textContent = verifiedServiceKey;
            document.getElementById('apiKeyStatusBadge').textContent = 'SERVICE API ACTIVE';
            document.getElementById('paidBundleBtn').disabled = false;
            document.getElementById('saveServiceConfigBtn').disabled = false;
            deliveryStatus('Payment verified. Your saved document bundle and SuperintelligenceNDA API key are ready.');
            if (new URLSearchParams(location.search).get('checkout') === 'return' && !savedOrder().downloaded) {
                await downloadPaidBundle(true);
            }
            return 'paid';
        }
        async function resumeDelivery() {
            if (!savedOrder() || deliveryPolling) return;
            deliveryPolling = true;
            try {
                for (let attempt = 0; attempt < 24; attempt++) {
                    const status = await checkOrder();
                    if (status !== 'pending') break;
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (error) { deliveryStatus('Could not check payment yet. Use Check payment to retry.'); }
            finally { deliveryPolling = false; }
        }
        document.getElementById('executeNdaBtn').addEventListener('click', async () => {
            const button = document.getElementById('executeNdaBtn');
            try {
                // Persist access before redirecting; never treat redirect parameters as payment proof.
                localStorage.setItem('snda.storage.check','1');
                localStorage.removeItem('snda.storage.check');
                if (!userNameInput.value.trim() || !userEmailInput.value.trim() || !userEmailInput.checkValidity()) {
                    showStatusMessage('Enter your legal name and a valid contact email before checkout.', 'warning');
                    return;
                }
                if (!intelligenceEntities.some(entity => entity.checked)) {
                    showStatusMessage('Select at least one entity for your document snapshot.', 'warning'); return;
                }
                button.disabled = true;
                await updateLiveCryptographicHash();
                const bundle = [
                    'SUPERINTELLIGENCENDA.COM — SAVED DOCUMENT BUNDLE',
                    'These documents are templates. Payment does not establish third-party acceptance.',
                    generateOmnibusContractText(),
                    ...US_STATES_LEGAL_DB.map(state => generateSingleStateContractText(state))
                ].join('\n\n');
                const response = await fetch(DELIVERY_API + '/v1/orders', {
                    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({bundle})
                });
                if (!response.ok) throw new Error('Unable to prepare your order. Please retry shortly.');
                const order = await response.json();
                localStorage.setItem(ORDER_STORAGE, JSON.stringify({
                    order_id:order.order_id, access_token:order.access_token, downloaded:false
                }));
                window.location.assign(order.checkout_url);
            } catch (error) {
                showStatusMessage(error.message || 'Please enable browser storage before checkout.', 'warning');
                button.disabled = false;
            }
        });
        document.getElementById('paidBundleBtn').addEventListener('click', () => downloadPaidBundle());
        document.getElementById('checkPaymentBtn').addEventListener('click', () => {
            checkOrder().catch(error => deliveryStatus(error.message));
        });
        function serviceConfig() {
            return {
                service:'SuperintelligenceNDA',
                api_base:DELIVERY_API+'/v1',
                api_key:verifiedServiceKey,
                scope:['documents:read'],
                headers:{Authorization:'Bearer '+verifiedServiceKey},
                endpoints:{account:'/me',document_bundle:'/documents/bundle'},
                note:'For SuperintelligenceNDA only. Keep this credential private.'
            };
        }
        document.getElementById('saveServiceConfigBtn').addEventListener('click', () => {
            if (!verifiedServiceKey) return;
            triggerTextDownload('SuperintelligenceNDA-Private-API-Configuration.json', JSON.stringify(serviceConfig(),null,2));
        });
        window.addEventListener('DOMContentLoaded', resumeDelivery);


await document.getElementById('executeNdaBtn').click();
assert(assigned==='https://buy.stripe.com/test','redirects only after order persisted');
assert(savedOrder().access_token==='private-token','private access saved');
await checkOrder();
assert(document.getElementById('paidBundleBtn').disabled,'pending bundle locked');
assert(verifiedServiceKey==='','pending has no key');
currentStatus='paid';await checkOrder();
assert(verifiedServiceKey==='snda_live_verified','verified credential displayed');
assert(downloaded==='VERIFIED BUNDLE','verified bundle automatically downloaded');
assert(savedOrder().downloaded===true,'automatic download tracked');
assert(serviceConfig().scope[0]==='documents:read','scope limited to own documents');
currentStatus='revoked';await checkOrder();
assert(verifiedServiceKey==='','revoked key cleared');
export const result={checkoutPersistsOrder:true,pendingAccessLocked:true,verifiedDownload:true,revokedKeyCleared:true};
