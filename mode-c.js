/* Standalone international instrument. No U.S. contract text or service credentials. */
(() => {
    'use strict';
    const title = 'International Worldwide Superintelligence Non-Disclosure & Cross-Border Intellectual Property Protection Agreement';
    const regimes = [
        ['TRIPS-PARIS', 'WTO TRIPS / Paris Convention', 'TRIPS Article 39 and Paris Article 10bis: undisclosed information and unfair competition.', 'Member obligations and domestic implementation; secrecy, commercial value and reasonable protective steps matter.', 'https://www.wto.org/english/docs_e/legal_e/31bis_trips_04d_e.htm'],
        ['BERNE-WCT', 'Berne Convention / WIPO Copyright Treaty', 'International copyright framework for qualifying works and digital uses.', 'Does not create copyright in every AI output or transfer another person’s rights.', 'https://www.wipo.int/en/web/treaties/ip/wct/index'],
        ['UNCITRAL', 'UNCITRAL electronic contracting framework', 'Electronic Commerce Model Law (1996), Electronic Signatures Model Law (2001), Electronic Communications Convention (2005).', 'Model laws require enactment; the Convention applies only within its territorial and substantive scope.', 'https://uncitral.un.org/en/texts/ecommerce'],
        ['NYC-1958', '1958 New York Convention', 'Recognition of arbitration agreements and foreign or non-domestic arbitral awards.', 'Subject to treaty status, reservations, local procedure and refusal grounds; this is a multilateral treaty, not U.S. domestic law.', 'https://uncitral.un.org/en/texts/arbitration/conventions/foreign_arbitral_awards'],
        ['EU-EEA', 'European Union / EEA', 'Trade Secrets Directive (EU) 2016/943; eIDAS framework; relevant national copyright and contract law.', 'Specify a national governing law. EEA incorporation and national implementation must be checked; protected public-interest disclosures remain available.', 'https://eur-lex.europa.eu/eli/dir/2016/943/oj/eng'],
        ['UK', 'United Kingdom', 'Trade Secrets Regulations 2018, confidence and contract principles; Electronic Communications Act 2000.', 'England and Wales, Scotland and Northern Ireland are distinct legal jurisdictions; specify the intended law.', 'https://www.legislation.gov.uk/uksi/2018/597/contents'],
        ['CH', 'Switzerland', 'Unfair competition and confidentiality protections; Swiss Code of Obligations and electronic-signature framework.', 'Assess the applicable cantonal/federal procedure and any required signature form.', 'https://www.fedlex.admin.ch/en/cc'],
        ['CA', 'Canada', 'Provincial contract/confidence law, Québec civil law, federal copyright and applicable electronic-commerce legislation.', 'Choose a province; electronic-commerce model legislation is not itself a single nationwide enactment.', 'https://laws-lois.justice.gc.ca/eng/'],
        ['JP', 'Japan', 'Unfair Competition Prevention Act, Copyright Act and electronic-signature legislation.', 'Trade-secret management requirements and nonwaivable rights require local assessment.', 'https://www.japaneselawtranslation.go.jp/en/'],
        ['SG', 'Singapore', 'Contract and confidence principles, Copyright Act 2021 and Electronic Transactions Act 2010.', 'Use an agreed forum; choosing an AI provider does not confer jurisdiction or bind it.', 'https://sso.agc.gov.sg/Act/ETA2010'],
        ['AU', 'Australia', 'Confidence and contract principles, Copyright Act 1968 and federal/state electronic-transactions legislation.', 'Specify a state or territory and assess applicable federal law and signature exceptions.', 'https://www.legislation.gov.au/'],
        ['NZ', 'New Zealand', 'Confidence and contract principles, Copyright Act 1994 and Contract and Commercial Law Act 2017 Part 4.', 'Electronic records and execution must meet applicable statutory conditions.', 'https://www.legislation.govt.nz/'],
        ['UAE', 'United Arab Emirates', 'Relevant mainland industrial-property/confidentiality law or the distinct DIFC/ADGM contract, IP and electronic-transactions frameworks.', 'Mainland UAE, DIFC and ADGM are not interchangeable; identify the legal system and competent forum.', 'https://uaelegislation.gov.ae/en'],
        ['KR', 'Republic of Korea', 'Unfair Competition Prevention and Trade Secret Protection Act; electronic-document and signature frameworks.', 'Special technology-transfer restrictions and mandatory local requirements may apply.', 'https://elaw.klri.re.kr/eng_service/main.do'],
        ['IN', 'India', 'Applicable contract and confidence principles, Copyright Act and Information Technology Act electronic-signature provisions.', 'Do not treat Contract Act section 27 as a general confidentiality grant; restraint-of-trade restrictions and execution exceptions require review.', 'https://www.indiacode.nic.in/'],
        ['BR', 'Brazil', 'Industrial Property Law 9.279/1996, including Article 195 XI–XII; Civil Code and applicable electronic-signature rules.', 'Brazilian law does not automatically govern Mercosur or other Latin American countries.', 'https://www.planalto.gov.br/ccivil_03/leis/l9279.htm'],
        ['MX', 'Mexico', 'Federal Law for Protection of Industrial Property industrial-secret provisions; Commercial Code electronic-commerce rules.', 'Assess secrecy measures, authorized access, applicable formalities and local enforcement.', 'https://www.diputados.gob.mx/LeyesBiblio/'],
        ['CN', 'China', 'Applicable Anti-Unfair Competition Law trade-secret provisions, Copyright Law and Electronic Signature Law.', 'Review current legislation, protected-information criteria and cross-border data/technology restrictions for the specific transaction.', 'https://www.wipo.int/en/web/wipolex']
    ].map(([code,region,authority,limits,source]) => Object.freeze({code,region,authority,limits,source}));
    const laws = ['England and Wales', 'Switzerland', 'Singapore', 'France', 'Germany', 'Ontario, Canada', 'Québec, Canada', 'Japan', 'New South Wales, Australia', 'New Zealand', 'DIFC, United Arab Emirates', 'ADGM, United Arab Emirates', 'Republic of Korea', 'India', 'Brazil', 'Mexico', 'China'];
    const seats = ['Geneva, Switzerland', 'Singapore', 'London, England', 'Paris, France', 'Stockholm, Sweden', 'Toronto, Ontario, Canada', 'Tokyo, Japan', 'Sydney, Australia', 'Auckland, New Zealand', 'DIFC, Dubai, United Arab Emirates'];
    const fields = [
        ['intlCountry', 'Disclosing party country / territory', 'text'],
        ['intlDisclosingAddress', 'Disclosing party address', 'text'],
        ['intlRegion', 'Province / region (optional)', 'text'],
        ['intlReceivingParty', 'Receiving party legal name', 'text'],
        ['intlReceivingAddress', 'Receiving party address and country', 'text'],
        ['intlReceivingEmail', 'Receiving party notice email', 'email'],
        ['intlPurpose', 'Permitted confidential project / purpose', 'text'],
        ['intlGoverningLaw', 'Agreed non-U.S. governing law', laws],
        ['intlSeat', 'Agreed non-U.S. arbitration seat', seats],
        ['intlLanguage', 'Arbitration language', 'text'],
        ['intlEffectiveDate', 'Proposed effective date', 'date']
    ];
    let adapter, revision = 0;
    const read = id => document.getElementById(id)?.value.trim() || '';
    function data() {
        return {...adapter.identity(), address:read('intlDisclosingAddress'), country:read('intlCountry'), region:read('intlRegion'), receiver:read('intlReceivingParty'), receiverAddress:read('intlReceivingAddress'), receiverEmail:read('intlReceivingEmail'), purpose:read('intlPurpose'), law:read('intlGoverningLaw'), seat:read('intlSeat'), language:read('intlLanguage'), effective:read('intlEffectiveDate'), training:document.getElementById('intlTrainingConsent').checked, providers:adapter.providers()};
    }
    const blank = (value, label) => value || '[' + label + ']';
    function articles(d) {
        return [
            ['I. Parties, purpose and affirmative assent', `This proposed business-to-business agreement is between ${blank(d.name,'DISCLOSING PARTY')} (Disclosing Party) and ${blank(d.receiver,'RECEIVING PARTY')} (Receiving Party), for ${blank(d.purpose,'AGREED CONFIDENTIAL PURPOSE')}. Only identified parties that validly accept this instrument are bound. Selecting a provider, paying a platform fee, uploading a signature image or generating a hash does not establish the Receiving Party’s acceptance. Authorized representatives must separately execute the final version.`],
            ['II. Standalone international scope', 'Mode C is an independent instrument for the agreed cross-border relationship. It does not incorporate the U.S. master omnibus, any individual U.S. state contract, Exhibit B, or U.S. domestic statutes. It neither amends nor combines those separate instruments. The parties choose a non-U.S. governing law and arbitration seat. Nothing purports to exclude overriding mandatory law or the procedural requirements of a competent enforcement court.'],
            ['III. Confidential information and exclusions', 'Confidential Information means nonpublic information disclosed for the Purpose, including inputs, source code, research, designs, commercial plans, personal data and outputs that reveal that information, which is identified as confidential or reasonably understood to be confidential. Receiving Party may establish an exclusion by reliable records showing lawful prior possession, independent development without use, lawful receipt without a duty of confidence, or public availability without breach. A public item does not alone make a confidential combination public. Statutory trade-secret status requires the applicable legal criteria.'],
            ['IV. Restricted use and AI training', `Receiving Party shall use Confidential Information solely for the Purpose and shall not sell, license, publish, reverse-engineer protected materials where lawfully restricted, or use them for unrelated products or customers. ${d.training ? 'The parties propose limited internal training, alignment and safety work exclusively for this Purpose in an isolated environment. Before training begins, both parties must approve a written schedule identifying the model, dataset, authorized operators, retention, deletion limitations and resulting artifacts. This proposal alone authorizes no training.' : 'No model training, fine-tuning, evaluation dataset incorporation or alignment use is authorized without a later written schedule accepted by both parties.'} Public or shared-model training, release of affected weights and cross-customer reuse are prohibited unless expressly authorized in that schedule.`],
            ['V. Non-disclosure and authorized personnel', 'Receiving Party shall not disclose Confidential Information to third parties without Disclosing Party’s prior written approval, except as required or protected by law under Article IX. Its own personnel may access only what they need for the Purpose and must owe enforceable duties at least as protective as this agreement. Affiliates, external model hosts and subprocessors require written approval and equivalent safeguards. Receiving Party remains responsible for its authorized recipients to the extent permitted by law. Exhibit A is a reference list, not approval to disclose to every listed provider.'],
            ['VI. Security and incident response', 'Receiving Party shall apply reasonable organizational and technical safeguards proportionate to sensitivity, including least-privilege access, appropriate encryption, environment isolation and access records. It shall promptly contain suspected unauthorized use and notify Disclosing Party without undue delay after becoming aware of a confidentiality or security breach, giving available material facts and updates. Required regulatory deadlines remain applicable. On reasonable request it shall provide proportionate compliance evidence without exposing other customers’ data, system secrets or legally privileged material.'],
            ['VII. Background rights, inputs and outputs', 'Each party retains its pre-existing intellectual property. Disclosing Party retains rights it holds in disclosed inputs; Receiving Party receives only the limited permission needed for the Purpose. As between the parties, Receiving Party assigns to Disclosing Party its legally transferable economic rights, if any, in outputs specifically created for the Purpose, excluding identified background materials and third-party components; it shall execute further documents reasonably needed to perfect that transfer. Any embedded background material requires a separately agreed license sufficient for the intended use. No clause creates copyright in unprotectable material, transfers third-party rights, overrides nonwaivable moral rights, establishes inventorship or guarantees patent novelty, priority or registration.'],
            ['VIII. Personal data and cross-border transfers', 'Each party shall comply with applicable privacy, cybersecurity, export-control and technology-transfer requirements. Before processing personal data or making a restricted cross-border transfer, the parties shall agree the required controller/processor terms, instructions, locations, approved recipients, security measures and lawful transfer mechanism. This NDA is not a data-processing agreement, adequacy decision, standard contractual clause instrument or export authorization. Processing that lacks the required legal basis shall not begin.'],
            ['IX. Required and protected disclosures', 'A party may make disclosures legally required by a competent authority, limiting them to what is required and, where lawful, giving advance notice and reasonable cooperation to seek protection. Nothing prevents protected whistleblowing, reporting suspected wrongdoing to competent authorities, exercising nonwaivable worker rights or other disclosures protected by mandatory law. No prior approval is required where law forbids it or protects the disclosure.'],
            ['X. Return, deletion and retained copies', 'On written request or termination, Receiving Party shall stop unauthorized use and within 30 days return or securely delete Confidential Information and confirm completion in writing. Retention required by law, legal hold or inaccessible routine backups must be identified, restricted to the applicable necessity and kept confidential until lawful deletion. Before authorized training, the schedule must specify handling of datasets, logs, embeddings, checkpoints and weights, including technically feasible deletion and residual risks. No claim of guaranteed machine unlearning is made.'],
            ['XI. Effective date, duration and prior disclosures', `The proposed effective date is ${blank(d.effective,'AGREED EFFECTIVE DATE')}, subject to valid acceptance by both parties. This agreement covers disclosures during a five-year disclosure period unless ended earlier on written notice. Non-trade-secret confidentiality and use obligations continue for five years after each disclosure; qualifying trade secrets remain protected while they retain that status, subject to applicable law. Earlier disclosures are covered only if both parties identify and accept them in a signed schedule. Unilateral selection of past, present or future models does not impose retroactive duties on a nonparty.`],
            ['XII. Platform payment and service credentials', 'Platform payment purchases the service or document access described at checkout. Payment verification and legal execution are separate events. A receipt, document hash, API credential or electronic seal does not prove provider assent, establish ownership or bind a nonparty. Private service credentials must remain outside this agreement and its exhibits. No new payment or subscription obligation between the contractual parties is created by this article.'],
            ['XIII. Remedies and responsibility', 'A party may seek remedies available under the governing law for proven breach, including appropriate interim relief, damages or specific performance where permitted. The tribunal or competent court decides the legal requirements and any security or evidence needed. This agreement does not guarantee an injunction, punitive award, immediate asset seizure or enforcement in every country. No contractual penalty or waiver of a nonwaivable right is implied.'],
            ['XIV. Agreed substantive law and Exhibit C', `The agreement is governed by the substantive law of ${blank(d.law,'AGREED NON-U.S. JURISDICTION')}, excluding its conflict-of-laws rules to the extent permitted. Exhibit C is a reference schedule of 18 multilateral and sovereign regimes, not 18 simultaneously chosen governing laws. Treaty applicability, territorial scope, reservations, implementation and mandatory local rules must be assessed for the transaction. No “most protective country” election allows either party to replace the agreed governing law unilaterally.`],
            ['XV. WIPO arbitration and cross-border enforcement', `Disputes arising from this agreement, including formation, validity, interpretation, breach or termination, shall be resolved by arbitration administered by the WIPO Arbitration and Mediation Center under the WIPO Arbitration Rules. There shall be one arbitrator. The legal seat shall be ${blank(d.seat,'AGREED NON-U.S. SEAT')}; the language shall be ${blank(d.language,'AGREED LANGUAGE')}. The award is binding subject to applicable law. Either party may seek lawful interim measures from a competent court without waiving arbitration. Recognition or enforcement under the 1958 New York Convention remains subject to its conditions, reservations, refusal grounds and local procedures. Non-arbitrable matters remain with the competent authority.`],
            ['XVI. Electronic records and signatures', 'The parties may sign counterparts electronically where permitted. The execution process must identify each authorized signatory, record affirmative acceptance of the same final version and retain an accessible audit trail. Any mandatory written, qualified-signature, witnessing, registration or assignment formalities remain applicable. SHA-256 identifies the exported text’s integrity; it does not authenticate identity, intent, authority or legal enforceability. Typed names displayed in this preview are proposed particulars, not completed signatures.'],
            ['XVII. Notices, amendments and severability', 'Notices shall be sent to the notice contacts recorded in the particulars, with evidence of receipt; a party shall promptly update its contact. Amendments, additional recipients, training permissions and country riders require both parties’ written acceptance. No unilateral portal update amends a signed version. Mandatory law prevails; an expressly agreed country rider controls a conflicting clause only within its stated scope. Otherwise this instrument and its accepted schedules govern the Purpose. If a clause is invalid, the remainder continues where legally possible. Existing provider terms are altered only by an authorized bilateral agreement. Neither party may assign duties or permit delegation without the other’s written consent except where mandatory law provides otherwise.'],
            ['XVIII. Completion and execution', 'Before execution, complete the parties’ legal identities, addresses and notice contacts, the Purpose, effective date, governing law, seat and language; agree any required data, training, background-IP or prior-disclosure schedules. Each signatory confirms authority to bind the identified party. Disclosing Party signature: __________________; representative/title: __________________; date: __________. Receiving Party signature: __________________; representative/title: __________________; date: __________. This preview remains an unsigned draft until both parties validly accept the same completed version.']
        ];
    }
    function text(d = data()) {
        return [title, 'MODE C • STANDALONE INTERNATIONAL INSTRUMENT • UNSIGNED DRAFT', 'Instrument: SNDA-2026-INTL-WORLDWIDE-OMNIBUS',
            'Disclosing Party: ' + blank(d.name,'LEGAL NAME'), 'Brand / portfolio: ' + (d.org || 'Not specified'), 'Notice email: ' + blank(d.email,'EMAIL'), 'Country / region: ' + blank([d.country,d.region].filter(Boolean).join(' / '),'COUNTRY'),
            'Disclosing Party address: ' + blank(d.address,'ADDRESS'), 'Receiving Party: ' + blank(d.receiver,'LEGAL NAME'), 'Receiving Party address: ' + blank(d.receiverAddress,'ADDRESS AND COUNTRY'), 'Receiving Party email: ' + blank(d.receiverEmail,'EMAIL'),
            ...articles(d).flatMap(([heading,body])=>['',heading,body]), '', 'EXHIBIT A — SELECTED PROVIDER REFERENCES', 'Listing is informational. Only a separately identified accepting party is bound; this list grants no disclosure or training permission.',
            ...d.providers.map((p,i)=>(i+1)+'. '+p.parent+' — '+p.models), '', 'EXHIBIT C — 18 MULTILATERAL AND SOVEREIGN REGIMES', 'Reference schedule only. No incorporation of U.S. domestic law or Exhibit B. No guarantee of worldwide enforceability.',
            ...regimes.map((r,i)=>(i+1)+'. ['+r.code+'] '+r.region+'\nAuthority: '+r.authority+'\nApplication: '+r.limits+'\nOfficial reference: '+r.source)
        ].join('\n');
    }
    async function digest(value) {
        return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
    }
    function validation() {
        if(!laws.includes(read('intlGoverningLaw')) || !seats.includes(read('intlSeat'))) return 'Choose the agreed non-U.S. governing law and arbitration seat.';
        for(const [id,label] of fields.filter(([id])=>id!=='intlRegion')) {
            const el = document.getElementById(id);
            if(!el.value.trim() || !el.checkValidity()) return 'Complete '+label.toLowerCase()+'.';
        }
        return '';
    }
    async function render() {
        if(!adapter) return;
        const sequence = ++revision, d = data(), value = text(d);
        document.getElementById('intlContractText').textContent = value;
        const query = read('exhibitCSearch').toLowerCase();
        const tbody = document.getElementById('exhibitCRows');
        tbody.replaceChildren();
        for(const r of regimes.filter(r=>Object.values(r).join(' ').toLowerCase().includes(query))) {
            const row = document.createElement('tr');
            for(const content of [r.region,r.authority,r.limits]) {const cell=document.createElement('td');cell.textContent=content;row.appendChild(cell);}
            tbody.appendChild(row);
        }
        document.getElementById('intlDraftStatus').textContent = validation() ? 'Draft • complete the international particulars below' : 'Particulars complete • both parties’ execution is still required';
        try {const hash=await digest(value);if(sequence===revision){document.getElementById('intlDigest').textContent=hash;if(adapter.active())adapter.setDigest(hash);}}
        catch {if(sequence===revision)document.getElementById('intlDigest').textContent='SHA-256 unavailable in this browser';}
    }
    function activate() {
        document.getElementById('domesticContract').hidden = true;
        document.getElementById('internationalContract').hidden = false;
        document.getElementById('intlParticulars').hidden = false;
        document.getElementById('userDomicileSelect').required = false;
        document.getElementById('userDomicileSelect').setAttribute('aria-required','false');
        for(const id of ['modeCardOmnibus','modeCardState']) document.getElementById(id).className='p-4 sm:p-5 rounded-2xl border-2 border-slate-800 bg-slate-950/80 cursor-pointer';
        document.getElementById('modeCardInternational').setAttribute('data-active','true');
        document.getElementById('modeAIndicator').textContent='SELECT U.S. MASTER';
        document.getElementById('modeBIndicator').textContent='SELECT U.S. STATE';
        document.getElementById('domesticStateSelector').hidden=true;
        document.getElementById('domesticSignatureCard').hidden=true;
        document.getElementById('heroActiveModeLabel').textContent='International Worldwide • Mode C';
        render();
    }
    function deactivate() {
        document.getElementById('domesticContract').hidden=false;
        document.getElementById('internationalContract').hidden=true;
        document.getElementById('intlParticulars').hidden=true;
        document.getElementById('userDomicileSelect').required=true;
        document.getElementById('userDomicileSelect').setAttribute('aria-required','true');
        document.getElementById('modeCardInternational').setAttribute('data-active','false');
        document.getElementById('domesticStateSelector').hidden=false;
        document.getElementById('domesticSignatureCard').hidden=false;
    }
    function init(config) {
        adapter=config;
        const host=document.getElementById('intlFields');
        for(const [id,label,type] of fields) {
            const wrap=document.createElement('div'), lab=document.createElement('label');lab.htmlFor=id;lab.textContent=label;
            const input=document.createElement(Array.isArray(type)?'select':'input');input.id=id;
            input.required=id!=='intlRegion';input.setAttribute('aria-required',String(input.required));
            if(Array.isArray(type)){const empty=document.createElement('option');empty.value='';empty.textContent='Select by agreement';input.appendChild(empty);for(const v of type){const o=document.createElement('option');o.value=v;o.textContent=v;input.appendChild(o);}}
            else {input.type=type;input.placeholder=label;}
            input.addEventListener('input',render);input.addEventListener('change',render);wrap.append(lab,input);host.appendChild(wrap);
        }
        document.getElementById('intlTrainingConsent').addEventListener('change',render);
        document.getElementById('exhibitCSearch').addEventListener('input',render);
        document.getElementById('modeCardInternational').addEventListener('click',config.select);
        document.getElementById('intlDownloadBtn').addEventListener('click',async()=>{
            if(!await config.paid())return;
            config.download('SuperintelligenceNDA-International-Worldwide-Mode-C.txt',text());
        });
        render();
    }
    window.SNDAModeC=Object.freeze({title,regimes,laws,seats,articles,text,digest,validation,render,activate,deactivate,init});
})();
