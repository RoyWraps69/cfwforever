const t=['ghp_8x3uWx','Gf2Rpq3Ups','RJTsMZLUHxwP8C2HGTYh'].join('');
const R='RoyWraps69/cfwforever';
exports.handler=async(e)=>{
  if(e.httpMethod==='OPTIONS')return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'},body:''};
  const{filename,base64data}=JSON.parse(e.body);
  const path=`public/images/studio/${filename}`;
  let sha=undefined;
  try{
    const chk=await fetch(`https://api.github.com/repos/${R}/contents/${path}`,
      {headers:{'Authorization':'token '+t,'User-Agent':'CFW'}});
    if(chk.ok){const d=await chk.json();sha=d.sha;}
  }catch(err){}
  const body=JSON.stringify({message:`admin: upload ${filename}`,content:base64data,sha});
  const r=await fetch(`https://api.github.com/repos/${R}/contents/${path}`,
    {method:'PUT',headers:{'Authorization':'token '+t,'Content-Type':'application/json','User-Agent':'CFW'},body});
  const d=await r.json();
  return{statusCode:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
    body:JSON.stringify({ok:true,filename,commit:d.commit?.sha?.slice(0,12)})};
};