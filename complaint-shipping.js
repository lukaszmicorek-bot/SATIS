(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.SatisComplaintShipping=api;})(typeof window==="undefined"?null:window,function(){
  "use strict";
  const routes=[
    {id:"sonova",label:"SONOVA · Warszawa",company:"SONOVA POLSKA Sp. z o.o.",address:"plac Bankowy 1, 00-139 Warszawa",nip:"113-00-54-012",carriers:["DHL","UPS"]},
    {id:"sivantos",label:"SIVANTOS · Komorniki",company:"SIVANTOS Sp. z o.o.",address:"ul. Przemysłowa 18, 62-052 Komorniki",nip:"783-14-47-931",carriers:["UPS"]},
    {id:"sivantos-poznan",label:"SIVANTOS · Poznań",company:"SIVANTOS Sp. z o.o.",address:"ul. Bałtycka 6, 61-013 Poznań",nip:"783-14-47-931",carriers:["UPS"],accountId:"sivantos"},
    {id:"audibel",label:"AUDIBEL · Warszawa",company:"AUDIBEL",address:"ul. Wirażowa 119, 02-145 Warszawa",nip:"522-10-46-291",carriers:["UPS"]},
    {id:"interton",label:"Interton / Beltone · Kraków",company:"Interton.pl Sp. z o.o.",address:"ul. Tetmajera 65E/2, 31-352 Kraków",phone:"+48 794 729 036",nip:"6793019255",carriers:["DHL"]},
    {id:"gnp",label:"GNP / ReSound · Olsztyn",company:"GNP Magnusson Aparatura Medyczna Sp. z o.o.",address:"al. Obrońców Tobruku 1/1, 10-092 Olsztyn",nip:"739-38-53-133",carriers:["TNT"]},
    {id:"gnp-kajetany",label:"GNP / ReSound · Kajetany",company:"GNP Magnusson Aparatura Medyczna Sp. z o.o.",address:"ul. Mokra 7, 05-830 Kajetany",nip:"739-38-53-133",carriers:["TNT"],accountId:"gnp"},
    {id:"dgs",label:"DGS · Mierzyn",company:"DGS Poland",address:"ul. Lubieszyńska 42, Mierzyn, 72-006 Szczecin",note:"Wkładki, aparaty ITE, naprawy",carriers:[]},
    {id:"acustica",label:"Acustica / Bernafon · Gdańsk",company:"Acustica Sp. z o.o.",address:"ul. Abrahama 1A, lok. 309, 80-307 Gdańsk",carriers:["UPS"]},
    {id:"oticon",label:"Oticon Polska · Warszawa",company:"Oticon Polska",address:"al. Jana Pawła II 22, 00-133 Warszawa",phone:"+48 22 164 65 00",nip:"522-10-46-291",carriers:["UPS"]}
  ];
  function key(value){return String(value||"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
  function recommend(manufacturer){
    const value=` ${key(manufacturer)} `;
    const groups=[
      ["sonova",["phonak","sonova"]],
      ["sivantos",["signia","sivantos","wsa","audio service","audioservice"]],
      ["audibel",["audibel"]], ["interton",["interton","beltone"]],
      ["gnp",["resound","re sound","gn resound","gnp"]],
      ["dgs",["oticon","philips","sonic","dgs"]], ["acustica",["bernafon","acustica"]]
    ];
    const matches=groups.filter(([,aliases])=>aliases.some(alias=>value.includes(` ${alias} `)));
    return matches.length===1?matches[0][0]:"";
  }
  function cleanAccounts(value){
    const result={};
    if(!value||typeof value!=="object"||Array.isArray(value))return result;
    for(const route of routes){
      const entries=value[route.id];if(!Array.isArray(entries))continue;
      result[route.id]=entries.slice(0,8).filter(row=>row&&["DHL","UPS","TNT"].includes(row.carrier)).map(row=>({
        carrier:row.carrier,code:String(row.code||"").trim().slice(0,60),detail:String(row.detail||"").trim().slice(0,100)
      })).filter(row=>row.code);
    }
    return result;
  }
  function create(a){
    const host=a.document.getElementById("complaintShippingInfo");
    let current=[],accounts={},choices=new Map(),session="",generation=0,loading=false,loaded=false,status="",signature="";
    const node=(tag,text,cls)=>{const e=a.document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
    function clear(){generation++;current=[];accounts={};choices.clear();session="";loading=false;loaded=false;status="";signature="";host?.replaceChildren();if(host)host.hidden=true;}
    async function load(){
      if(!session||loaded||loading||!a.read)return;
      loading=true;const token=generation,user=session;
      try{
        const data=await a.read();if(token!==generation||user!==a.user())return;
        accounts=cleanAccounts(data);status=Object.values(accounts).some(rows=>rows.length)?"":"Kody kurierskie nie zostały jeszcze skonfigurowane.";
      }catch{
        if(token!==generation||user!==a.user())return;
        status="Kody kurierskie niedostępne. Wymagana konfiguracja Supabase lub połączenie z siecią.";
      }finally{
        if(token===generation&&user===a.user()){loading=false;loaded=true;signature="";render(current);}
      }
    }
    function render(items=[]){
      if(!host)return;
      const user=a.user()||"";
      if(session!==user){clear();session=user;}
      current=items.filter(item=>String(item.productName||item.serial||"").trim());
      if(!current.length){host.replaceChildren();host.hidden=true;return;}
      const liveKeys=new Set(current.map((item,index)=>`${index}:${item.serial||""}:${item.productName||""}`));
      for(const id of choices.keys())if(!liveKeys.has(id))choices.delete(id);
      const next=JSON.stringify([current,[...choices],status,loaded]);if(next===signature)return;signature=next;
      host.hidden=false;host.replaceChildren(node("h3","Dane do wysyłki"));
      const controls=node("div",undefined,"complaint-shipping-controls"),groups=new Map();
      current.forEach((item,index)=>{
        const id=`${index}:${item.serial||""}:${item.productName||""}`,automatic=recommend(item.manufacturer);
        const chosen=choices.get(id)??automatic,label=node("label"),select=node("select");
        label.append(node("span",`${index+1}. ${item.productName||"Produkt"}${item.manufacturer?` · ${item.manufacturer}`:""}`));
        select.setAttribute("aria-label",`Adres wysyłki pozycji ${index+1}`);
        const blank=node("option","Wybierz odbiorcę");blank.value="";select.append(blank);
        for(const route of routes){const option=node("option",route.label);option.value=route.id;select.append(option);}
        select.value=chosen;
        select.addEventListener("change",()=>{choices.set(id,select.value);render(current);});
        label.append(select);controls.append(label);
        if(chosen){if(!groups.has(chosen))groups.set(chosen,[]);groups.get(chosen).push(index+1);}
      });
      host.append(controls);
      const list=node("div",undefined,"complaint-shipping-addresses");
      for(const [id,positions]of groups){
        const route=routes.find(row=>row.id===id);if(!route)continue;
        const block=node("section",undefined,"complaint-shipping-address");
        block.append(node("small",`Pozycje: ${positions.join(", ")}`),node("strong",route.company),node("p",route.address));
        if(route.nip||route.phone)block.append(node("p",[route.nip?`NIP: ${route.nip}`:"",route.phone?`tel. ${route.phone}`:""].filter(Boolean).join(" · "),"complaint-shipping-detail"));
        if(route.note)block.append(node("p",route.note,"complaint-shipping-detail"));
        const codes=accounts[route.accountId||route.id]||[];
        for(const courier of codes)block.append(node("p",`${courier.carrier}: ${courier.code}${courier.detail?` · ${courier.detail}`:""}`,"complaint-shipping-courier"));
        if(!codes.length&&route.carriers.length)block.append(node("p",`Kurier: ${route.carriers.join(" / ")}`,"complaint-shipping-detail"));
        const copy=node("button","Kopiuj adres","reset-filters-btn");copy.type="button";
        copy.addEventListener("click",async()=>{
          try{await a.copy([route.company,route.address].join("\n"));if(user===a.user()){copy.textContent="Skopiowano";}}
          catch{if(user===a.user())copy.textContent="Nie udało się skopiować";}
        });block.append(copy);list.append(block);
      }
      host.append(list);
      if(current.some((item,index)=>!(choices.get(`${index}:${item.serial||""}:${item.productName||""}`)??recommend(item.manufacturer))))host.append(node("p","Nie rozpoznano adresu dla części pozycji. Wybierz odbiorcę z listy.","complaint-shipping-detail"));
      if(status)host.append(node("p",status,"complaint-shipping-detail"));
      void load();
    }
    return {render,clear,reset(){choices.clear();signature="";}};
  }
  return {routes,recommend,cleanAccounts,create};
});
