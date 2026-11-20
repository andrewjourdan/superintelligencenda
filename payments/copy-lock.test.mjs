import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const helper=html.slice(html.indexOf('        const PAID_EXPORT_BUTTONS'),html.indexOf('        function savedOrder()'));
const apiHandlers=html.slice(html.indexOf("        document.getElementById('copyApiKeyBtn').addEventListener"),html.indexOf('        // --- 11.'));
const shaHandler=html.slice(html.indexOf("        document.getElementById('navCopyHashBtn').addEventListener"),html.indexOf('        async function triggerPrintPdf'));
const setup=`
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const elements=new Map();let copies=0,verifiedServiceKey='',currentStatus='pending',hasOrder=false;
const latestSha256Hash='a'.repeat(64);
const document={
 documentElement:{setAttribute(){}},body:{appendChild(){},removeChild(){}},
 createElement(){return {value:'',select(){}};},execCommand(){copies++;},
 getElementById(id){if(!elements.has(id))elements.set(id,{disabled:false,setAttribute(){},addEventListener(name,fn){this[name]=fn;}});return elements.get(id);}
};
const savedOrder=()=>hasOrder?{order_id:'test'}:null;
const showStatusMessage=()=>{};
const copyToClipboardHelper=()=>{copies++;};
const serviceConfig=()=>({api_key:verifiedServiceKey});
const orderRequest=async()=>{
 if(currentStatus!=='paid')throw new Error('Payment not verified');
 return Response.json({api_key:'snda_live_server_verified'});
};
`;
const checks=`
const ids=['copyApiKeyBtn','copyPluginJsonBtn','navCopyHashBtn'];
assert(ids.every(id=>document.getElementById(id).disabled),'copies locked on load');
for(const id of ids)await document.getElementById(id).click();
assert(copies===0,'no order cannot copy');
hasOrder=true;for(const id of ids)await document.getElementById(id).click();
assert(copies===0,'pending order cannot copy');
currentStatus='paid';activePaidOrderId='test';
for(const id of ids)await document.getElementById(id).click();
assert(copies===3,'verified payment unlocks all three copy actions');
assert(verifiedServiceKey==='snda_live_server_verified','fresh server key is used');
assert(ids.every(id=>!document.getElementById(id).disabled),'paid buttons enabled');
assert(ids.every(id=>document.getElementById(id+'LockIcon').className==='fa-solid fa-unlock'),'paid icons unlocked');
currentStatus='revoked';for(const id of ids)await document.getElementById(id).click();
assert(copies===3,'revoked order cannot copy cached values');
assert(ids.every(id=>document.getElementById(id).disabled),'revoked buttons relocked');
assert(ids.every(id=>document.getElementById(id+'LockIcon').className==='fa-solid fa-lock'),'revoked icons locked');
export const passed=true;
`;
const temp=await mkdtemp(join(tmpdir(),'snda-copy-lock-'));
try{
 const path=join(temp,'checks.mjs');await writeFile(path,setup+helper+apiHandlers+shaHandler+checks);
 if(!(await import(pathToFileURL(path).href)).passed)throw new Error('Copy tests unfinished');
 console.log('PASS: copy actions blocked for unpaid orders, enabled after verification, and relocked after revocation');
}finally{await rm(temp,{recursive:true,force:true});}
