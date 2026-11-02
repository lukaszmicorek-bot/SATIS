const anchors={
  1:[["Imię:",31,581],["PESEL:",31,640],["Województwo:",31,738]],
  2:[["Miejscowość:",31,60],["Województwo:",31,296],["Imię:",31,525]],
  3:[["Numer orzeczenia:",31,418],["Grupa inwalidzka:",31,437]],
  4:[["Średni miesięczny dochód netto na osobę w gospodarstwie Wnioskodawcy:",28,646],["Liczba osób we wspólnym gospodarstwie domowym wynosi:",28,687]],
  5:[["Przedmiot wniosku:",31,227],["Numer zlecenia:",31,246],["Całkowity koszt zakupu:",31,266]]
};
const key=value=>String(value||"").normalize("NFD").replace(/\p{M}/gu,"").replace(/ł/giu,"l").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
export function checkFile(file){
  if(!file || !/\.pdf$/iu.test(file.name||"") || file.size<=0 || file.size>8*1024*1024)throw new Error("Wybierz pusty wzór PDF o rozmiarze do 8 MB.");
}
export function checkLayout(pages){
  if(![5,7].includes(pages.length))throw new Error("Wzór musi mieć 5 albo 7 stron A4.");
  for(let index=0;index<pages.length;index++){
    const page=pages[index];
    if(Math.abs(page.width-595.32)>3 || Math.abs(page.height-841.92)>3)throw new Error("Wzór musi mieć pionowe strony A4, bez zmiany orientacji.");
    for(const [label,x,y]of anchors[index+1]||[]){
      if(!page.lines.some(line=>key(line.text).startsWith(key(label)) && Math.abs(line.x-x)<=7 && Math.abs(line.y-y)<=7))
        throw new Error(`Strona ${index+1}: układ pól różni się od obecnego wzoru. Ten PDF wymaga osobnego dopasowania pól; nie podmieniono druku.`);
    }
    if(page.lines.some(line=>/pesel\D{0,12}\d{11}/iu.test(line.text)))throw new Error("Wygląda na to, że PDF zawiera już wpisany PESEL. Wybierz pusty wzór bez danych osoby.");
  }
}
function linesFrom(items,height){
  const lines=[];
  for(const item of items){
    if(typeof item.str!=="string" || !item.transform)continue;
    const x=item.transform[4],y=height-item.transform[5]-item.height;
    let line=lines.find(line=>Math.abs(line.y-y)<2);
    if(!line){line={x,y,text:"",parts:[]};lines.push(line);}
    line.parts.push({x,text:item.str});line.x=Math.min(line.x,x);
  }
  return lines.map(line=>({...line,text:line.parts.sort((a,b)=>a.x-b.x).map(part=>part.text).join(" ")}));
}
export async function inspectDocument(pdf){
  if(![5,7].includes(pdf.numPages))throw new Error("Wzór musi mieć 5 albo 7 stron A4.");
  const actions=await pdf.getJSActions();if(actions && Object.keys(actions).length)throw new Error("Wybierz PDF bez skryptów i aktywnych akcji.");
  const pages=[];
  for(let index=1;index<=pdf.numPages;index++){
    const page=await pdf.getPage(index),viewport=page.getViewport({scale:1});
    if(page.rotate%360!==0)throw new Error("Wzór nie może mieć obróconych stron.");
    const actions=await page.getJSActions();if(actions && Object.keys(actions).length)throw new Error("Wybierz PDF bez skryptów i aktywnych akcji.");
    const annotations=await page.getAnnotations();
    if(annotations.some(item=>item.fieldValue!==undefined && !["",null,false,"Off"].includes(item.fieldValue)))throw new Error("Wybierz pusty wzór PDF bez wypełnionych pól.");
    const text=await page.getTextContent();pages.push({width:viewport.width,height:viewport.height,lines:linesFrom(text.items,viewport.height)});
  }
  checkLayout(pages);return pages;
}
export async function importBlankTemplate(file,{document=globalThis.document,progress=()=>{},signal}={}){
  checkFile(file);const bytes=new Uint8Array(await file.arrayBuffer());
  if(new TextDecoder("ascii").decode(bytes.slice(0,5))!=="%PDF-")throw new Error("Plik nie jest poprawnym PDF-em.");
  const pdfjs=await import("./vendor/pdfjs-6.5.438/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc=new URL("./vendor/pdfjs-6.5.438/pdf.worker.mjs",import.meta.url).href;
  const task=pdfjs.getDocument({data:bytes,isEvalSupported:false,useWasm:false,useSystemFonts:true,disableFontFace:false,enableXfa:false,maxImageSize:16000000,canvasMaxAreaInBytes:40000000,verbosity:0});
  let timedOut=false,passwordProtected=false;
  const abort=()=>{void task.destroy().catch(()=>{});};
  task.onPassword=()=>{passwordProtected=true;abort();};
  const timer=setTimeout(()=>{timedOut=true;abort();},45000);
  signal?.addEventListener("abort",abort,{once:true});
  const images=[];let canvas;
  try{
    if(signal?.aborted)throw new Error("Import przerwany.");
    const pdf=await task.promise;await inspectDocument(pdf);
    canvas=document.createElement("canvas");
    for(let index=1;index<=pdf.numPages;index++){
      if(signal?.aborted)throw new Error("Import przerwany.");
      progress(`Przygotowywanie wzoru: ${index} / ${pdf.numPages}`);
      const page=await pdf.getPage(index),viewport=page.getViewport({scale:300/72});
      canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
      const context=canvas.getContext("2d",{alpha:false});if(!context)throw new Error("Przeglądarka nie może przygotować podglądu PDF.");
      await page.render({canvasContext:context,canvas,viewport,annotationMode:pdfjs.AnnotationMode.DISABLE,background:"rgb(255,255,255)"}).promise;
      const image=canvas.toDataURL("image/png");if(!image.startsWith("data:image/png")||image.length<100)throw new Error("Brak pamięci do przygotowania podglądu PDF. Wybierz mniejszy plik.");
      images.push(image);page.cleanup();
    }
    return {name:file.name,images,count:images.length,dispose(){images.length=0;}};
  }catch(error){images.length=0;throw new Error(passwordProtected?"PDF chroniony hasłem nie jest obsługiwany.":timedOut?"Przekroczono czas odczytu PDF. Spróbuj mniejszego pliku.":signal?.aborted?"Przerwano import. Poprzedni wzór pozostaje bez zmian.":error.message||"Nie udało się odczytać wzoru PDF.");}
  finally{clearTimeout(timer);if(canvas){canvas.width=0;canvas.height=0;}signal?.removeEventListener("abort",abort);await task.destroy();}
}
