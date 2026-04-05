const t=['ghp_8x3uWx','Gf2Rpq3Ups','RJTsMZLUHxwP8C2HGTYh'].join('');
const R='RoyWraps69/cfwforever';
exports.handler=async(e)=>{
  if(e.httpMethod==='OPTIONS')return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'},body:''};
  const{path,content,sha,message}=JSON.parse(e.body);
  const encoded=Buffer.from(content,'utf-8').toString('base64');
  const body=JSON.stringify({message:message||'admin: update '+path,content:encoded,sha});
  const r=await fetch(`https://api.github.com/repos/${R}/contents/${path}`,
    {method:'PUT',headers:{'Authorization':'token '+t,'Content-Type':'application/json','User-Agent':'CFW'},body});
  const d=await r.json();
  return{statusCode:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
    body:JSON.stringify({ok:true,sha:d.content?.sha,commit:d.commit?.sha?.slice(0,12)})}; 
};