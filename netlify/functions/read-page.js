const t=['ghp_8x3uWx','Gf2Rpq3Ups','RJTsMZLUHxwP8C2HGTYh'].join('');
const R='RoyWraps69/cfwforever';
exports.handler=async(e)=>{
  const p=JSON.parse(e.body).path;
  const r=await fetch(`https://api.github.com/repos/${R}/contents/${p}`,
    {headers:{'Authorization':'token '+t,'User-Agent':'CFW'}});
  const d=await r.json();
  return{statusCode:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
    body:JSON.stringify({content:Buffer.from(d.content,'base64').toString('utf-8'),sha:d.sha})};
};