import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const delivery=html.slice(html.indexOf('        const DELIVERY_API'),html.indexOf('        // Copy Universal API Key'));
const handlers=html.slice(html.indexOf('        async function handleDownloadOmnibus'),html.indexOf("        document.getElementById('exportMasterOmnibusBtn').addEventListener"));
const printer=html.slice(html.indexOf('        async function triggerPrintPdf'),html.indexOf("        document.getElementById('navPrintBtn').addEventListener"));
const mocks=`
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const elements=new Map(),attributes=new Map(),values=new Map();
const document={documentElement:{setAttribute:(k,v)=>attributes.set(k,v)},getElementById(id){
 if(!elements.has(id))elements.set(id,{disabled:false,textContent:'',setAttribute(){},classList:{remove(){}},addEventListener(name,fn){this[name]=fn;}});
 return elements.get(id);
}};
const localStorage={getItem:key=>values.get(key)||null,setItem:(k,v)=>values.set(k,v),removeItem:key=>values.delete(key)};
const location={search:''};
let currentStatus='pending',downloads=0,prints=0;
const window={location:{assign(){}},addEventListener(){},print(){prints++;}};
const userNameInput={value:'Test'},userEmailInput={value:'test@example.com',checkValidity:()=>true};
const intelligenceEntities=[{checked:true}],US_STATES_LEGAL_DB=[{name:'Florida',code:'FL'}];
const generateOmnibusContractText=()=>'OMNIBUS TEST',generateSingleStateContractText=()=>'STATE TEST';
const getSelectedStateObj=()=>US_STATES_LEGAL_DB[0];
const updateLiveCryptographicHash=async()=>{},showStatusMessage=()=>{};
const triggerTextDownload=()=>{downloads++;};
const fetch=async(url,opts={})=>{
 if(url.endsWith('/credentials')){
  if(currentStatus!=='paid')return Response.json({error:'payment_not_verified'},{status:402});
  return Response.json({api_key:'snda_live_verified'});
 }
 if(url.endsWith('/bundle'))return currentStatus==='paid'?new Response('VERIFIED BUNDLE'):Response.json({error:'payment_not_verified'},{status:402});
 return Response.json({status:currentStatus});
};
`;
const checks=`
assert(PAID_EXPORT_BUTTONS.every(id=>document.getElementById(id).disabled),'all exports locked initially');
await triggerPrintPdf();await handleDownloadOmnibus();await handleDownloadSingleState();await handleDownloadAll50StatesBundle();
assert(prints===0 && downloads===0,'no saved order cannot export');
localStorage.setItem(ORDER_STORAGE,JSON.stringify({order_id:'test',access_token:'token',downloaded:true}));
await triggerPrintPdf();await handleDownloadOmnibus();
assert(prints===0 && downloads===0,'pending order cannot export');
currentStatus='paid';await checkOrder();
assert(PAID_EXPORT_BUTTONS.every(id=>!document.getElementById(id).disabled),'paid exports unlocked');
assert(attributes.get('data-paid-document-access')==='true','native print enabled after verification');
await triggerPrintPdf();await handleDownloadOmnibus();await handleDownloadSingleState();await handleDownloadAll50StatesBundle();
assert(prints===1 && downloads===3,'paid exports work');
currentStatus='revoked';
await triggerPrintPdf();await handleDownloadOmnibus();
assert(prints===1 && downloads===3,'fresh server check blocks revoked order');
assert(PAID_EXPORT_BUTTONS.every(id=>document.getElementById(id).disabled),'revocation relocks controls');
assert(attributes.get('data-paid-document-access')==='false','revocation relocks native print');
export const passed=true;
`;
const temp=await mkdtemp(join(tmpdir(),'snda-export-lock-'));
try {
 const modulePath=join(temp,'checks.mjs');
 await writeFile(modulePath,mocks+delivery+handlers+printer+checks);
 const result=await import(pathToFileURL(modulePath).href);
 if(!result.passed)throw new Error('Export-lock tests did not finish');
 if(!html.includes('html:not([data-paid-document-access="true"]) body > *'))throw new Error('Unpaid print CSS missing');
 console.log('PASS: default locks, unpaid denial, verified exports, fresh revocation checks, native print CSS');
} finally {await rm(temp,{recursive:true,force:true});}
