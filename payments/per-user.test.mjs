import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
new vm.Script(script);
const extract = name => {
    const start = script.indexOf('function ' + name + '(');
    assert.ok(start >= 0, name + ' exists');
    return script.slice(start, script.indexOf('\n        }', start) + 10);
};
const states = script.slice(script.indexOf('const US_STATES_LEGAL_DB ='), script.indexOf('const intelligenceEntities ='));
const elements = new Map();
const document = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, { textContent: '', value: '', classList: { add(){}, remove(){} } });
    return elements.get(id);
}};
const context = vm.createContext({
    document, userNameInput:{value:''}, userOrgInput:{value:''},
    userEmailInput:{value:''}, userDomicileSelect:{value:''},
    intelligenceEntities:[], executionTransactionId:'', executionTimestampUTC:'',
    latestSha256Hash:'test-hash', syncJurisdictionUI(){},
    showStatusMessage(){}, canvas:{getBoundingClientRect(){throw new Error('Blank Auto-Sign must not draw');}}
});
vm.runInContext(states + '\n' + [
    'syncDisclosingPartyInputs', 'generateOmnibusContractText',
    'generateSingleStateContractText', 'renderScriptSignatureOnCanvas'
].map(extract).join('\n'), context);
vm.runInContext(`
    syncDisclosingPartyInputs();
    renderScriptSignatureOnCanvas();
    if (document.getElementById('sigBlockUserName').textContent !== '[DISCLOSING PARTY]') throw new Error('Blank identity');
`, context);
for (const person of [
    {name:'User Alpha', org:'Alpha Brand', email:'alpha@example.test', domicile:'State of New York'},
    {name:'User Beta', org:'Beta Brand', email:'beta@example.test', domicile:'State of California'}
]) {
    Object.assign(context.userNameInput, {value:person.name});
    Object.assign(context.userOrgInput, {value:person.org});
    Object.assign(context.userEmailInput, {value:person.email});
    Object.assign(context.userDomicileSelect, {value:person.domicile});
    vm.runInContext('syncDisclosingPartyInputs()', context);
    assert.equal(elements.get('sigBlockUserName').textContent, person.name);
    const contracts = vm.runInContext('[generateOmnibusContractText(), ...US_STATES_LEGAL_DB.map(generateSingleStateContractText)]', context);
    assert.equal(contracts.length, 51);
    for (const contract of contracts) {
        for (const value of Object.values(person)) assert.ok(contract.includes(value), value);
        assert.ok(!contract.includes('Andrew Jourdan Nahmias'));
        if (person.name === 'User Beta') assert.ok(!contract.includes('User Alpha'));
    }
}
for (const input of ['userNameInput','userOrgInput','userEmailInput','userDomicileSelect']) context[input].value = '';
vm.runInContext('syncDisclosingPartyInputs()', context);
assert.equal(elements.get('sigBlockUserName').textContent, '[DISCLOSING PARTY]');
assert.ok(!html.includes('PRE-SIGNED:'));
assert.ok(html.includes('SECTION 03 • PER-USER NDA REQUIREMENTS'));
console.log('Passed: blank intake, explicit Auto-Sign, two independent users, all 51 contracts, cleared identity, JavaScript syntax.');

const checkoutElements = new Map();
let requestCount = 0, redirected = false, warning = '';
const checkoutContext = vm.createContext({
    userNameInput:{value:''},
    userEmailInput:{value:'', checkValidity(){return this.value === 'test@example.test';}},
    userDomicileSelect:{value:''},
    document:{getElementById(id){
        if (!checkoutElements.has(id)) checkoutElements.set(id,{disabled:false,addEventListener(event,handler){this[event]=handler;}});
        return checkoutElements.get(id);
    }},
    showStatusMessage(message){warning=message;},
    localStorage:{setItem(){},removeItem(){}},
    intelligenceEntities:[{checked:true}], US_STATES_LEGAL_DB:[],
    updateLiveCryptographicHash:async()=>{},
    generateOmnibusContractText:()=>'TEST NDA',
    setDocumentAccess(){},
    DELIVERY_API:'https://example.test', ORDER_STORAGE:'test-order',
    fetch:async()=>{requestCount++;return {ok:true,json:async()=>({order_id:'test',access_token:'test',checkout_url:'https://example.test/checkout'})};},
    window:{location:{assign(){redirected=true;}}}
});
vm.runInContext(extract('validateNdaRequirements'),checkoutContext);
const checkoutStart = script.indexOf("document.getElementById('executeNdaBtn').addEventListener('click'");
const checkoutEnd = script.indexOf("document.getElementById('paidBundleBtn').addEventListener",checkoutStart);
vm.runInContext(script.slice(checkoutStart,checkoutEnd),checkoutContext);
const clickCheckout = () => checkoutElements.get('executeNdaBtn').click();
await clickCheckout();
assert.match(warning,/legal name/);
assert.equal(requestCount,0);
checkoutContext.userNameInput.value='Test User';
checkoutContext.userEmailInput.value='example.test';
await clickCheckout();
assert.match(warning,/valid contact email/);
assert.equal(requestCount,0);
checkoutContext.userEmailInput.value='test@example.test';
await clickCheckout();
assert.match(warning,/domicile state/);
assert.equal(requestCount,0);
checkoutContext.userDomicileSelect.value='State of Florida';
await clickCheckout();
assert.equal(requestCount,1);
assert.equal(redirected,true);
for (const id of ['userNameInput','userEmailInput','userDomicileSelect']) {
    assert.match(html,new RegExp('<(?:input|select) id="'+id+'"[^>]*required'));
}
assert.match(html,/<input id="userEmailInput" type="email"/);
assert.ok(!/<input id="userOrgInput"[^>]*required/.test(html));
console.log('Passed: Section 03 blocks checkout for missing name, invalid email, and missing domicile; valid details proceed with optional brand blank.');
