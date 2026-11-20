import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const start=html.indexOf('        async function downloadPaidBundle(');
const end=html.indexOf('        async function checkOrder(',start);
if(start<0 || end<0)throw new Error('Bundle download handler missing');
const handler=html.slice(start,end).replace("await import('./payments/document-pdf.mjs')",'await mockPdfModule');
const mocks=`
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const document={getElementById(){return {disabled:false};}};
let authorized=false,pdfCalls=0,txtCalls=0,lastText='',rechecks=0,order={order_id:'test',downloaded:false};
const localStorage={setItem(key,value){order=JSON.parse(value);}};
const ORDER_STORAGE='test-order';
const savedOrder=()=>order;
const deliveryStatus=()=>{};
const requirePaidDocumentAccess=async()=>{rechecks++;return authorized;};
const orderRequest=async()=>{if(!authorized)throw new Error('Payment not verified');return new Response('VERIFIED DOCUMENT BUNDLE');};
const triggerTextDownload=(name,text)=>{assert(name.endsWith('.txt'),'TXT filename');txtCalls++;lastText=text;};
const mockPdfModule={downloadBundlePdf:async(text)=>{pdfCalls++;lastText=text;}};
`;
const checks=`
await downloadPaidBundle(false,'pdf');await downloadPaidBundle(false,'txt');
assert(pdfCalls===0 && txtCalls===0,'unpaid access blocked for both formats');
authorized=true;
await downloadPaidBundle(false,'txt');
assert(txtCalls===1 && lastText==='VERIFIED DOCUMENT BUNDLE','TXT uses verified server bundle');
await downloadPaidBundle(false,'pdf');
assert(pdfCalls===1 && lastText==='VERIFIED DOCUMENT BUNDLE','PDF uses verified server bundle');
assert(order.downloaded===true,'download tracked');
authorized=false;
await downloadPaidBundle(false,'pdf');
assert(pdfCalls===1,'revoked PDF access blocked');
assert(rechecks===5,'access rechecked after every attempt');
export const passed=true;
`;
const temp=await mkdtemp(join(tmpdir(),'snda-format-test-'));
try {
 const path=join(temp,'checks.mjs');await writeFile(path,mocks+handler+checks);
 if(!(await import(pathToFileURL(path).href)).passed)throw new Error('Format tests did not finish');
 if(!html.includes('id="paidPdfBundleBtn" disabled') || !html.includes("downloadPaidBundle(true, 'pdf')"))throw new Error('PDF default/lock missing');
 if(!/<button id="paidBundleBtn"[^>]*>[\s\S]*?Download TXT[\s\S]*?<\/button>/.test(html))throw new Error('TXT option missing');
 console.log('PASS: PDF and TXT require verified access; both use the saved bundle; PDF auto-download configured');
} finally {await rm(temp,{recursive:true,force:true});}
