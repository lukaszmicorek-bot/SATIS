const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const modulePromise=import('../mail-merge-pdf.mjs');
const anchorData={1:[['Imię:',31,581],['PESEL:',31,640],['Województwo:',31,738]],2:[['Miejscowość:',31,60],['Województwo:',31,296],['Imię:',31,525]],3:[['Numer orzeczenia:',31,418],['Grupa inwalidzka:',31,437]],4:[['Średni miesięczny dochód netto na osobę w gospodarstwie Wnioskodawcy:',28,646],['Liczba osób we wspólnym gospodarstwie domowym wynosi:',28,687]],5:[['Przedmiot wniosku:',31,227],['Numer zlecenia:',31,246],['Całkowity koszt zakupu:',31,266],['Nazwa banku:',31,621],['Nr rachunku bankowego:',31,641]]};
const pages=()=>Array.from({length:7},(_,i)=>({width:595.32,height:841.92,lines:(anchorData[i+1]||[]).map(([text,x,y])=>({text,x,y}))}));
test('template importer accepts only small PDF files and compatible blank A4 layouts',async()=>{
  const m=await modulePromise;m.checkFile({name:'blank.pdf',size:200000});m.checkLayout(pages());m.checkLayout(pages().slice(0,5));
  for(const file of [{name:'x.html',size:10},{name:'x.pdf',size:0},{name:'x.pdf',size:9*1024*1024}])assert.throws(()=>m.checkFile(file));
  const moved=pages();moved[0].lines[0].y+=30;assert.throws(()=>m.checkLayout(moved),/układ pól/);
  const wrong=pages();wrong[0].width=842;assert.throws(()=>m.checkLayout(wrong),/A4/);
  const filled=pages();filled[0].lines.push({text:'PESEL: 00000000000',x:31,y:640});assert.throws(()=>m.checkLayout(filled),/PESEL/);
});
test('template inspector refuses active actions and pre-filled fields',async()=>{
  const m=await modulePromise;
  const fake=(action=null,value='')=>({numPages:7,getJSActions:async()=>action,getPage:async index=>({rotate:0,getViewport:()=>({width:595.32,height:841.92}),getJSActions:async()=>null,getAnnotations:async()=>[{fieldValue:value}],getTextContent:async()=>({items:(anchorData[index]||[]).map(([str,x,y])=>({str,transform:[1,0,0,1,x,841.92-y-12],height:12}))})})});
  await m.inspectDocument(fake());await assert.rejects(m.inspectDocument(fake({OpenAction:['bad']})),/skryptów/);
  await assert.rejects(m.inspectDocument(fake(null,'customer value')),/wypełnionych pól/);
});
test('PDF parsing stays local with a pinned worker, evaluation and active annotations disabled',()=>{
  const source=fs.readFileSync(path.join(root,'mail-merge-pdf.mjs'),'utf8');
  assert.match(source,/isEvalSupported:false/);assert.match(source,/enableXfa:false/);assert.match(source,/annotationMode:pdfjs.AnnotationMode.DISABLE/);
  assert.match(source,/vendor\/pdfjs-6\.5\.438\/pdf\.worker.mjs/);
  assert.doesNotMatch(source,/fetch\(|https?:\/\/|localStorage|indexedDB|sessionStorage|innerHTML/);
});
