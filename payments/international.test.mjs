import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
new vm.Script(source);
const extract=name=>{
 const start=source.indexOf('function '+name+'(');
 assert.ok(start>=0,name);
 return source.slice(start,source.indexOf('\n        }',start)+10);
};
const elements=new Map();
const element=()=>({value:'',textContent:'',innerHTML:'',children:[],hidden:false,disabled:false,required:false,classList:{add(){},remove(){}},setAttribute(k,v){this[k]=v;},appendChild(child){this.children.push(child);}});
const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element};
let warning='';
const context=vm.createContext({
 document,Intl,
 userNameInput:{value:'International Test User'},userOrgInput:{value:'Example Brand'},
 userEmailInput:{value:'user@example.test',checkValidity:()=>true},
 userCountrySelect:document.getElementById('userCountrySelect'),
 userDomicileSelect:document.getElementById('userDomicileSelect'),
 userRegionInput:document.getElementById('userRegionInput'),
 executionTransactionId:'',executionTimestampUTC:'',
 latestSha256Hash:'test-hash',contractMode:'omnibus',selectedStateCode:'FL',
 stateGridSearchInput:{value:''},exhibitBSearchInput:{value:''},
 renderFiftyStatePills(){},renderExhibitBTable(){},updateLiveCryptographicHash(){},
 showStatusMessage(message){warning=message;}
});
const states=source.slice(source.indexOf('const US_STATES_LEGAL_DB ='),source.indexOf('const intelligenceEntities ='));
const entityStart=source.indexOf('const intelligenceEntities =');
const entities=source.slice(entityStart,source.indexOf('\n        ];',entityStart)+11);
const codes=source.match(/const DOMICILE_COUNTRY_CODES = .*;/)[0];
vm.runInContext(states+'\n'+entities+'\n'+codes+'\n'+[
 'getCountryName','getDomicileText','escapeDomicileHtml','syncCountryControls',
 'initCountrySelector','getSelectedStateObj','syncJurisdictionUI',
 'syncDisclosingPartyInputs','validateNdaRequirements',
 'generateOmnibusContractText','generateSingleStateContractText'
].map(extract).join('\n'),context);
const run=code=>vm.runInContext(code,context);
run('initCountrySelector()');
assert.equal(context.userCountrySelect.value,'');
assert.equal(context.userDomicileSelect.disabled,true);
assert.equal(context.userDomicileSelect.required,false);
assert.equal(context.userRegionInput.disabled,true);
assert.equal(context.userCountrySelect.children.length,250);
assert.equal(run('new Set(DOMICILE_COUNTRY_CODES).size'),250);
assert.equal(run('validateNdaRequirements()'),false);
assert.match(warning,/country/);
context.userCountrySelect.value='US';
run('syncCountryControls()');
assert.equal(context.userDomicileSelect.required,true);
assert.equal(context.userDomicileSelect.disabled,false);
assert.equal(run('validateNdaRequirements()'),false);
context.userDomicileSelect.value=run("`State of ${US_STATES_LEGAL_DB[8].name} (${US_STATES_LEGAL_DB[8].code} — ${US_STATES_LEGAL_DB[8].statute})`");
assert.equal(run('validateNdaRequirements()'),true);
for(const [code,region] of [['CA','Ontario'],['GB','England'],['IN','Maharashtra'],['JP','Tokyo'],['AU','Victoria'],['SG','']]){
 context.userCountrySelect.value=code;context.userRegionInput.value=region;
 run('syncCountryControls();syncDisclosingPartyInputs()');
 assert.equal(context.userDomicileSelect.disabled,true);
 assert.equal(context.userDomicileSelect.required,false);
 assert.equal(run('validateNdaRequirements()'),true);
 const domicile=run('getDomicileText()');
 assert.ok(!domicile.includes('Florida'),'stale U.S. state excluded');
 assert.equal(elements.get('contractDomicileSpan').textContent,domicile);
 const contracts=run('[generateOmnibusContractText(),...US_STATES_LEGAL_DB.map(generateSingleStateContractText)]');
 assert.equal(contracts.length,51);
 for(const contract of contracts){assert.ok(contract.includes(domicile));assert.ok(contract.includes('International Test User'));}
 assert.ok(Buffer.byteLength(contracts.join('\n\n'),'utf8')<1500000,'all-selected international bundle fits existing API limit');
 context.contractMode='state';run('syncJurisdictionUI()');
 assert.equal(elements.get('contractDomicileSpan').textContent,domicile,'contract jurisdiction does not change domicile');
 context.contractMode='omnibus';
}
context.userCountrySelect.value='CA';context.userRegionInput.value='<img src=x onerror=alert(1)>';
run('syncDisclosingPartyInputs()');
assert.ok(!elements.get('dynamicGoverningLawBox').innerHTML.includes('<img'));
assert.ok(elements.get('dynamicGoverningLawBox').innerHTML.includes('&lt;img'));
context.userRegionInput.value='x'.repeat(121);
assert.equal(run('validateNdaRequirements()'),false);
context.userCountrySelect.value='';run('syncCountryControls();syncDisclosingPartyInputs()');
assert.equal(elements.get('contractDomicileSpan').textContent,'[PRIMARY DOMICILE NOT PROVIDED]');
assert.equal(run('validateNdaRequirements()'),false);
context.userCountrySelect.value='XX';
assert.equal(run('validateNdaRequirements()'),false);
assert.ok(html.includes('Checkout remains priced at $275.00 USD'));
assert.ok(html.includes('not country-specific international agreements'));
console.log('PASS: 250 countries/territories, conditional U.S. state requirement, six international domiciles across 51 contracts, unchanged API capacity, jurisdiction separation, clear/reset, invalid input rejection, escaped HTML, and syntax.');
