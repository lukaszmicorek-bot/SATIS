(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.SatisWSARepairGroups=api;})(typeof window==="undefined"?null:window,function(){
  "use strict";
  const reference=[];
  const add=(brand,label,group)=>reference.push({id:`wsa-rule-${reference.length+1}`,brand,label,group});
  const tiers=(label,groups)=>groups.forEach(([levels,group])=>add("Signia / Siemens",`${label} · poziom ${levels}`,group));
  tiers("Ace px",[["1/2",1],["3/5",2],["7",3]]);
  add("Signia / Siemens","Active / Active Pro / Active IX / Active Pro IX",5);
  tiers("Carat px",[["3/5",2],["7",3]]);
  tiers("Insio px/Nx/IX",[["1/2/3/5",2],["7",3]]);
  add("Signia / Siemens","Insio Charge&Go AX",5);
  add("Signia / Siemens","Intuis 3",1);
  add("Signia / Siemens","Intuis 4.0/4.1/4.2",1);
  add("Signia / Siemens","Intuis 4.3/4.5",2);
  add("Signia / Siemens","Intuis 4.7",3);
  for(const family of ["Motion px","Motion 13/13P Nx"])tiers(family,[["1/2",1],["3/5",2],["7",3]]);
  add("Signia / Siemens","Motion Charge&Go Nx/X",5);
  add("Signia / Siemens","Orion Charge&Go",5);
  add("Signia / Siemens","Prompt",1);
  for(const family of ["Pure px","Pure 10 Nx","Pure 13 Nx","Pure 312 Nx/X/AX"])tiers(family,[["1/2",1],["3/5",2],["7",3]]);
  add("Signia / Siemens","Pure Charge&Go Nx/X/AX/IX",5);
  add("Signia / Siemens","Silk px/Nx/X",3);
  add("Signia / Siemens","Silk Charge&Go IX",5);
  add("Signia / Siemens","Styletto / Styletto Connect / Styletto X/AX/IX",7);
  add("Audio Service","Volta",1);
  add("Audio Service","Bateryjne G4/G5/G6/G7/G8 · poziom 3/4/6",1);
  add("Audio Service","Bateryjne G4/G5/G6/G7/G8 · poziom 8/12",2);
  add("Audio Service","Bateryjne G4/G5/G6/G7/G8 · poziom 16",3);
  add("Audio Service","Ładowalne Li-Ion/Li · G5/G6/G7/G8",5);
  for(const [label,group]of [
    ["Nadajniki CROS / Connexx CROS",8],
    ["Ładowarka indukcyjna Signia",6],
    ["Ładowarka indukcyjna II Signia · biała z pokrywką",6],
    ["Ładowarka standardowa Motion Charge&Go P/SP X, Pure Charge&Go AX/IX · biała",6],
    ["Dry&Clean · Styletto AX/IX, Pure Charge&Go AX/IX, Motion Charge&Go P/SP X · biała",4],
    ["Ładowarka przenośna Pure Charge&Go AX/IX",4],
    ["Ładowarka Styletto / Connect / X / AX / IX",4],
    ["Ładowarka Active / Active Pro / Active IX / Active Pro IX",4],
    ["Ładowarka Insio Charge&Go AX",4],
    ["Ładowarka Silk Charge&Go IX",6],
    ["Ładowarka Smart Power",6],
    ["Ładowarka indukcyjna Smart Li-Ion Power",6],
    ["Ładowarka indukcyjna Charging Station · czarna z pokrywką",6],
    ["Ładowarka standardowa Charging Station B-P / B-HP / B-R · czarna",6],
    ["Charging+ Station · suszenie i czyszczenie · B-P / B-HP / B-R · czarna",4],
    ["Ładowarka przenośna R Li 7/8",4],
    ["Smart Transmiter",3],["Smart Transmiter 2,4",7],["Streamline TV",7],
    ["Pilot miniPocket",2],["Pilot Smart Key",2],["Pilot Smart Remote",6],
    ["Smart Mic",8],["Streamline Mic",8],["Streamer Smart Connect",5],["Słuchawka HP ERU",3]
  ])add("Akcesoria WSA",label,group);

  function text(value){return String(value??"").normalize("NFD").replace(/\p{M}/gu,"").replace(/ł/giu,"l").toUpperCase()
    .replace(/\b(?:CHARGE\s*(?:&|AND)?\s*GO|C\s*&\s*G)\b/gu," CG ")
    .replace(/LI[\s-]*ION/gu,"LIION").replace(/TRANSMITTER/gu,"TRANSMITER")
    .replace(/[^A-Z0-9.,+]+/gu," ").replace(/\s+/gu," ").trim();}
  const isWSA=value=>/\b(?:WSA|WSAUD|SIGNIA|SIEMENS|SIVANTOS|CONNEXX)\b|AUDIO[ -]?SERVICE/u.test(text(value));
  const isAS=value=>/AUDIO[ -]?SERVICE/u.test(text(value));
  function rule(prefix,group,brand){return reference.find(row=>row.label.startsWith(prefix)&&row.group===group&&(!brand||row.brand===brand))||null;}
  function direct(model,manufacturer=""){
    const s=text(model),brand=text(manufacturer);
    if(brand&&!isWSA(brand))return null;
    if(/\b(?:PHONAK|OTICON|PHILIPS|SONIC|BELTONE|RESOUND|BERNAFON|STARKEY|AUDIBEL)\b/u.test(s))return null;
    if(/\b(?:BCT|VX|CX)\b/u.test(s))return null;
    const families=s.match(/\b(?:ACE|ACTIVE|CARAT|INSIO|INTUIS|MOTION|ORION|PROMPT|PURE|SILK|STYLETTO|VOLTA)\b/gu)||[];
    if(families.length>1)return null;
    if((s.match(/\bG\d+\b/gu)||[]).length>1)return null;
    if((s.match(/\b[12357]\s*(?:PX|NX|AX|IX|X)\b/gu)||[]).length>1)return null;
    const accessory=/\b(?:CHARGER|LADOWARKA|CHARGING|DRY|PILOT|STREAMER|NADAJNIK|SLUCHAWKA|CROS|MINIPOCKET|SMART|STREAMLINE|HP ERU)\b/u.test(s);
    if(accessory){
      // Charger variants can have different groups even for the same hearing aid.
      if(/\b(?:CHARGER|LADOWARKA|CHARGING|DRY)\b/u.test(s)){
        if(/\bDRY\s*(?:AND\s*)?CLEAN\b/u.test(s)&&(/\b(?:STYLETTO|PURE)\b/u.test(s)&&/\b(?:AX|IX)\b/u.test(s)||/\bMOTION\b/u.test(s)&&/\bX\b/u.test(s)))return rule("Dry&Clean",4);
        if(/\bSTYLETTO\b/u.test(s))return rule("Ładowarka Styletto",4);
        if(/\bACTIVE\b/u.test(s))return rule("Ładowarka Active",4);
        if(/\bINSIO\b/u.test(s)&&/\bAX\b/u.test(s))return rule("Ładowarka Insio",4);
        if(/\bSILK\b/u.test(s)&&/\bIX\b/u.test(s))return rule("Ładowarka Silk",6);
        if(/\bPURE\b/u.test(s)&&/\b(?:AX|IX)\b/u.test(s)){
          if(/\b(?:PORTABLE|PRZENOSNA)\b/u.test(s))return rule("Ładowarka przenośna Pure",4);
          if(/\b(?:STANDARD|STANDARDOWA)\b/u.test(s))return rule("Ładowarka standardowa Motion",6);
          return null;
        }
        if(/\bMOTION\b/u.test(s)&&/\bX\b/u.test(s)&&/\b(?:STANDARD|STANDARDOWA)\b/u.test(s))return rule("Ładowarka standardowa Motion",6);
        if(/\bSMART (?:POWER|LIION POWER)\b/u.test(s))return rule(s.includes("LIION")?"Ładowarka indukcyjna Smart":"Ładowarka Smart Power",6);
        if(/\bCHARGING\+\s*STATION\b/u.test(s))return rule("Charging+ Station",4);
        if(/\bCHARGING STATION\b/u.test(s)&&/\bB (?:P|HP|R)\b/u.test(s)&&/\b(?:STANDARD|STANDARDOWA)\b/u.test(s))return rule("Ładowarka standardowa Charging",6);
        if(/\bCHARGING STATION\b/u.test(s)&&/\b(?:INDUCTIVE|INDUKCYJNA)\b/u.test(s))return rule("Ładowarka indukcyjna Charging",6);
        if(/\bR LI [78]\b/u.test(s)&&/\b(?:PORTABLE|PRZENOSNA)\b/u.test(s))return rule("Ładowarka przenośna R",4);
        if(/\bSIGNIA\b/u.test(s)&&/\b(?:INDUCTIVE|INDUKCYJNA)\b/u.test(s))return rule(s.includes(" II ")?"Ładowarka indukcyjna II":"Ładowarka indukcyjna Signia",6);
        return null;
      }
      if(/\bCROS\b/u.test(s))return isWSA(`${brand} ${s}`)?rule("Nadajniki CROS",8):null;
      if(/\bSMART TRANSMITER\b/u.test(s)){
        if(/\bSMART TRANSMITER 2[., ]4\b/u.test(s))return rule("Smart Transmiter 2,4",7);
        return /SMART TRANSMITER\s*$/u.test(s)?rule("Smart Transmiter",3):null;
      }
      for(const [pattern,label,group]of [[/\bSTREAMLINE TV\b/u,"Streamline TV",7],[/\bMINIPOCKET\b/u,"Pilot miniPocket",2],
        [/\bSMART KEY\b/u,"Pilot Smart Key",2],[/\bSMART REMOTE\b/u,"Pilot Smart Remote",6],[/\bSMART MIC\b/u,"Smart Mic",8],
        [/\bSTREAMLINE MIC\b/u,"Streamline Mic",8],[/\bSMART CONNECT\b/u,"Streamer Smart Connect",5],[/\bHP ERU\b/u,"Słuchawka HP ERU",3]])if(pattern.test(s))return rule(label,group);
      return null;
    }
    if(isAS(`${brand} ${s}`)||/\bVOLTA\b/u.test(s)){
      if(/\bVOLTA\b/u.test(s))return rule("Volta",1);
      const gen=s.match(/\bG([4-8])\b/u)?.[1];if(!gen||/\bG(?:[0-3]|9|\d{2,})\b/u.test(s))return null;
      if(/\b(?:LIION|LI)\b/u.test(s))return Number(gen)>=5?rule("Ładowalne",5):null;
      const level=s.replace(/\bG[4-8]\b/gu,"").match(/\b(16|12|8|6|4|3)\b/u)?.[1];
      const group=["3","4","6"].includes(level)?1:["8","12"].includes(level)?2:level==="16"?3:0;
      return group?rule("Bateryjne",group):null;
    }
    const family=families[0];if(!family)return null;
    // Reject generations absent from this archived card rather than reusing old rules.
    const generation=s.match(/(?:\b|\d)(PX|NX|AX|IX|X)\b/u)?.[1]||"";
    if(/\b(?:BCT|V|VX|CX)\b/u.test(s))return null;
    if(family==="ACTIVE")return /\b(?:ACTIVE|ACTIVE PRO)(?: IX)?(?: DEMO| TRIAL)?$/u.test(s)?rule("Active /",5):null;
    if(family==="STYLETTO")return /\bSTYLETTO(?: CONNECT| X| AX| IX)?(?: DEMO| TRIAL)?$/u.test(s)||["X","AX","IX"].includes(generation)?rule("Styletto /",7):null;
    if(family==="PROMPT")return rule("Prompt",1);
    if(family==="INTUIS"){
      if(/\bINTUIS(?: [A-Z]+)? 3\b/u.test(s))return rule("Intuis 3",1);
      const level=s.match(/\b4[.,]([012357])\b/u)?.[1];
      return level?rule("Intuis 4.",["0","1","2"].includes(level)?1:["3","5"].includes(level)?2:3):null;
    }
    if(s.includes(" CG ")||s.endsWith(" CG")){
      const prefix={INSIO:"Insio Charge",MOTION:"Motion Charge",ORION:"Orion Charge",PURE:"Pure Charge",SILK:"Silk Charge"}[family];
      const valid={INSIO:["AX"],MOTION:["NX","X"],ORION:[""],PURE:["NX","X","AX","IX"],SILK:["IX"]}[family];
      return prefix&&valid.includes(generation)?rule(prefix,5):null;
    }
    if(family==="SILK")return ["PX","NX","X"].includes(generation)?rule("Silk px",3):null;
    const level=s.match(/\b([12357])\s*(?:PX|NX|AX|IX|X)\b/u)?.[1]||s.match(/\b(?:PX|NX|AX|IX|X)\s*([12357])\b/u)?.[1];
    if(!level)return null;
    let prefix="";
    if(family==="INSIO"&&["PX","NX","IX"].includes(generation))return rule("Insio px",level==="7"?3:2);
    if(["ACE","CARAT","MOTION","PURE"].includes(family)&&generation==="PX")prefix=`${family[0]}${family.slice(1).toLowerCase()} px`;
    if(family==="MOTION"&&generation==="NX"&&/\b13\s*P?\b/u.test(s))prefix="Motion 13/13P";
    if(family==="PURE"){
      if(generation==="NX"&&/\b10\b/u.test(s))prefix="Pure 10";
      else if(generation==="NX"&&/\b13\b/u.test(s))prefix="Pure 13";
      else if(["NX","X","AX"].includes(generation)&&/\b312\b/u.test(s))prefix="Pure 312";
    }
    const group=["1","2"].includes(level)?1:level==="7"?3:2;
    return prefix?rule(prefix,group):null;
  }

  function modelKey(value){return text(value).replace(/\b(?:APARAT|SLUCHOWY|ZAUSZNY|WEWNATRZUSZNY|PHONAK|SIGNIA|SIEMENS|WSA|WSAUD|AUDIO SERVICE|DEMO|TRIAL)\b/gu,"").replace(/[^A-Z0-9]/gu,"");}
  const indexes=new WeakMap();
  function catalogIndex(rows){
    if(indexes.has(rows))return indexes.get(rows);
    const index=new Map(),put=(key,row)=>{if(!key)return;const set=index.get(key)||new Set();set.add(row);index.set(key,set);};
    for(const row of rows){
      for(const name of [row.model,row.tradeName,`${row.tradeName||""} ${row.model||""}`]){
        if(!name)continue;const key=modelKey(name);put(key,row);
        put(modelKey(text(name).replace(/\b(?:ITC|ITE|CIC|IIC|DIC)\b/gu,"")),row);
        if(isWSA(row.manufacturer))put(key.replace(/CG/gu,""),row);
      }
    }
    indexes.set(rows,index);return index;
  }
  function groupPrice(group,rows){
    const matches=rows.filter(row=>row.brand==="WSA"&&new RegExp(`\\bgrupa\\s+${group}\\s*$`,"iu").test(row.name));
    return matches.length===1&&Number.isFinite(matches[0].gross)&&matches[0].gross>0?matches[0]:null;
  }
  function quote(model,pricingRows=[],repairRows=[]){
    const key=modelKey(model);if(!key)return {status:"unknown"};
    const candidates=[...(catalogIndex(pricingRows).get(key)||[])];
    if(candidates.length&&candidates.every(row=>row.manufacturer&&!isWSA(row.manufacturer)))return {status:"unknown"};
    const decisions=candidates.map(row=>({row,rule:direct(row.model,row.manufacturer)||direct(row.tradeName,row.manufacturer)}));
    let match,matchedModel="",source="Karta WSA · 2024/11";
    if(decisions.length){
      if(decisions.some(item=>!item.rule)||new Set(decisions.map(item=>item.rule.group)).size!==1)return {status:"ambiguous"};
      match=decisions[0].rule;matchedModel=decisions[0].row.model||decisions[0].row.tradeName;source="Cennik aparatów → karta WSA";
    }else match=direct(model);
    if(!match)return {status:"unknown"};
    const price=groupPrice(match.group,repairRows);
    return {status:price?"matched":"missing-price",group:match.group,rule:match,matchedModel,source,gross:price?.gross,price};
  }
  function create({host,document:doc,repairRows=[]}){
    if(!host)return null;
    const details=doc.createElement("details");details.className="wsa-group-reference";
    details.innerHTML=`<summary>WSA · modele i grupy napraw</summary><p class="accessory-catalog-hint">Podział modeli: karta 2024/11 (v.2). Ceny brutto: bieżący Cennik napraw. Starsze ceny netto z PDF nie służą do wyceny.</p>
      <div class="wsa-group-toolbar"><label class="search-box"><span>Szukaj w grupach WSA</span><input type="search" autocomplete="off" placeholder="Model, rodzina, grupa..."></label><a href="repair-pricing/wsa-groups-2024-11.pdf" target="_blank" rel="noopener">Karta źródłowa PDF · archiwalna</a></div>
      <div class="accessory-catalog-scroll" tabindex="0" aria-label="Grupy napraw WSA"><table class="wsa-group-table"><thead><tr><th>Rodzina / akcesorium</th><th>Grupa</th><th>Naprawa brutto</th></tr></thead><tbody></tbody></table></div><p class="accessory-catalog-hint">Wymiana słuchawki RIC: cena nowej słuchawki według cennika akcesoriów. Koszt kilku urządzeń wymaga potwierdzenia.</p>`;
    const search=details.querySelector("input"),body=details.querySelector("tbody");
    function render(){
      const terms=text(search.value).split(" ").filter(Boolean);body.replaceChildren();
      for(const item of reference.filter(row=>terms.every(term=>text(`${row.brand} ${row.label} ${row.group}`).includes(term)))){
        const tr=doc.createElement("tr"),price=groupPrice(item.group,repairRows);
        for(const value of [`${item.brand} · ${item.label}`,String(item.group),price?new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(price.gross):"Brak ceny"]){const td=doc.createElement("td");td.textContent=value;tr.append(td);}body.append(tr);
      }
      if(!body.children.length){const row=doc.createElement("tr"),cell=doc.createElement("td");cell.colSpan=3;cell.textContent="Brak pasujących modeli.";row.append(cell);body.append(row);}
    }
    search.addEventListener("input",render);render();host.append(details);return {render};
  }
  return {reference,direct,quote,groupPrice,create};
});
