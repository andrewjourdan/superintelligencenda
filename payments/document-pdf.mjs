const SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js';
const SCRIPT_INTEGRITY = 'sha384-qovJwSBbRDPP5cEjCp8S0UP66wrvnjaa60XMOGzTNanrThcrGfXfnZkvgY8N1KT3';
const FONT_URL = 'https://fonts.gstatic.com/s/notoserif/v33/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZqFCjwA.ttf';
let dependencyPromise;
async function loadDependencies() {
    if (!dependencyPromise) dependencyPromise = (async () => {
        if (!window.jspdf?.jsPDF) {
            await new Promise((resolve,reject) => {
                const script=document.createElement('script');
                script.src=SCRIPT_URL;script.integrity=SCRIPT_INTEGRITY;script.crossOrigin='anonymous';
                script.onload=resolve;
                script.onerror=()=>{script.remove();reject(new Error('PDF library could not load.'));};
                document.head.appendChild(script);
            });
        }
        const response=await fetch(FONT_URL,{cache:'force-cache'});
        if(!response.ok)throw new Error('PDF font could not load.');
        const bytes=new Uint8Array(await response.arrayBuffer());
        let binary='';
        for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
        return {jsPDF:window.jspdf.jsPDF,fontBase64:btoa(binary)};
    })().catch(error=>{dependencyPromise=undefined;throw error;});
    return dependencyPromise;
}
export function buildBundlePdf(text,{jsPDF,fontBase64}) {
    if(typeof text!=='string' || !text.trim())throw new Error('Document bundle is empty.');
    const pdf=new jsPDF({orientation:'portrait',unit:'pt',format:'letter',compress:true,putOnlyUsedFonts:true});
    pdf.addFileToVFS('NotoSerif-Regular.ttf',fontBase64);
    pdf.addFont('NotoSerif-Regular.ttf','NotoSerif','normal');
    pdf.setFont('NotoSerif','normal');
    pdf.setProperties({title:'SuperintelligenceNDA — Saved Document Bundle',subject:'Master NDA, 50 state documents and payment receipt',creator:'SuperintelligenceNDA.com'});
    const width=612,height=792,margin=46,contentWidth=width-margin*2,lineHeight=13;
    let y=64;
    for(const original of text.replace(/\r\n?/g,'\n').split('\n')){
        const line=original.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
        if(/^[=\-#_]{8,}\s*$/.test(line.trim())){y+=5;continue;}
        if(!line.trim()){y+=6;continue;}
        const heading=line.trim().length>8 && /^[A-Z0-9\s.,:;()&/—–’'§+\-]+$/.test(line.trim());
        pdf.setFontSize(heading?10.5:9.5);
        const lines=pdf.splitTextToSize(line,contentWidth);
        for(const part of lines){
            if(y>height-52){pdf.addPage();y=64;}
            pdf.setTextColor(heading?22:35,heading?50:35,heading?75:35);
            pdf.text(part,margin,y);
            y+=lineHeight;
        }
        if(heading)y+=3;
    }
    const pages=pdf.getNumberOfPages();
    for(let page=1;page<=pages;page++){
        pdf.setPage(page);pdf.setFontSize(8);pdf.setTextColor(90,90,90);
        pdf.text('SUPERINTELLIGENCENDA.COM | SAVED DOCUMENT BUNDLE',margin,33);
        pdf.text('Page '+page+' of '+pages,width-margin,height-26,{align:'right'});
    }
    return pdf;
}
export async function downloadBundlePdf(text) {
    const dependencies=await loadDependencies();
    const pdf=buildBundlePdf(text,dependencies);
    await pdf.save('SuperintelligenceNDA-Paid-Document-Bundle.pdf',{returnPromise:true});
}
