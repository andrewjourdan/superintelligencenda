import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const delivery=html.slice(html.indexOf('        const DELIVERY_API'),html.indexOf('        // Copy Universal API Key'));
const elements=new Map(),listeners=new Map(),windowListeners=new Map(),values=new Map();
const document={documentElement:{setAttribute(){}},addEventListener(name,fn){listeners.set(name,fn);},getElementById(id){
    if(!elements.has(id))elements.set(id,{disabled:false,textContent:'',setAttribute(){},classList:{remove(){}},addEventListener(name,fn){this[name]=fn;}});
    return elements.get(id);
}};
const localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
let requests=0,deferCredentials=false,releaseCredentials,credentialsStarted;
let credentialsSignal=Promise.resolve();
const context=vm.createContext({document,localStorage,location:{search:''},URLSearchParams,
    window:{location:{hostname:'example.test'},addEventListener(name,fn){windowListeners.set(name,fn);}},
    showStatusMessage(){},triggerTextDownload(){},setTimeout,
    fetch:async(url)=>{
        requests++;
        if(url.endsWith('/credentials')){
            if(deferCredentials){credentialsStarted();await new Promise(resolve=>releaseCredentials=resolve);}
            return Response.json({api_key:'snda_live_test_verified'});
        }
        return Response.json({status:'paid'});
    }
});
vm.runInContext(delivery,context);
const run=code=>vm.runInContext(code,context);
const ids=run('PAID_EXPORT_BUTTONS');
const allLocked=()=>ids.every(id=>document.getElementById(id).disabled);
localStorage.setItem('snda.delivery.order.v1',JSON.stringify({order_id:'older-paid-order',access_token:'test-only-token',downloaded:true}));
await windowListeners.get('DOMContentLoaded')();
windowListeners.get('pageshow')();
assert.equal(requests,0,'ordinary visits must not automatically restore saved orders');
assert.ok(allLocked());
context.location.search='?checkout=return';
await run('resumeDelivery()');
assert.equal(requests,0,'return URL alone cannot restore an older paid order');
assert.ok(allLocked());
await run('checkOrder(true)');
assert.ok(!allLocked(),'explicit restoration verifies and unlocks a paid purchase');
listeners.get('input')({target:{id:'userNameInput'}});
assert.ok(allLocked(),'identity edits relock immediately');
assert.equal(await run('requirePaidDocumentAccess()'),false,'stale saved payment does not unlock an edited draft');
localStorage.setItem('snda.delivery.order.v1',JSON.stringify({order_id:'new-checkout-order',access_token:'test-only-token',downloaded:true,awaitingCheckout:true}));
await run('resumeDelivery()');
assert.ok(!allLocked(),'a fresh checkout return unlocks only after server verification');
assert.equal(JSON.parse(localStorage.getItem('snda.delivery.order.v1')).awaitingCheckout,false,'checkout-return marker is consumed');
const before=requests;
run('setDocumentAccess(false)');
await run('resumeDelivery()');
assert.equal(requests,before,'reloading the same return URL cannot automatically unlock again');
assert.ok(allLocked());
deferCredentials=true;
credentialsSignal=new Promise(resolve=>credentialsStarted=resolve);
const pending=run('checkOrder(true)');
await credentialsSignal;
listeners.get('change')({target:{id:'intlPurpose'}});
releaseCredentials();
await pending;
assert.ok(allLocked(),'late verification cannot reopen an edited draft');
assert.equal(run('activePaidOrderId'),'');
deferCredentials=false;
await run('checkOrder(true)');
deferCredentials=true;
credentialsSignal=new Promise(resolve=>credentialsStarted=resolve);
const exporting=run('requirePaidDocumentAccess()');
await credentialsSignal;
listeners.get('input')({target:{id:'userEmailInput'}});
releaseCredentials();
assert.equal(await exporting,false,'in-flight export checks cannot restore access after an edit');
assert.ok(allLocked());
localStorage.setItem('snda.delivery.order.v1',JSON.stringify({order_id:'fresh-return-with-pageshow',access_token:'test-only-token',downloaded:true,awaitingCheckout:true}));
credentialsSignal=new Promise(resolve=>credentialsStarted=resolve);
const freshReturn=run('resumeDelivery()');
await credentialsSignal;
windowListeners.get('pageshow')({persisted:false});
releaseCredentials();
await freshReturn;
assert.ok(!allLocked(),'initial pageshow must not interrupt fresh checkout verification');
windowListeners.get('pageshow')({persisted:true});
assert.ok(allLocked(),'back/forward cache restoration starts locked');
console.log('PASS: saved paid orders stay locked on load, return URL alone cannot unlock, explicit restore and fresh checkout work, edits relock, and late verification responses cannot reopen controls');
