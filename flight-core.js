/* Spherical movement helper for the Flight Lab tests. This is not aircraft physics. */
(function(root){
  const initial=()=>({lon:-75.9343,lat:40.3214,height:220,heading:0,speed:70,paused:true});
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const wrap=v=>((v%360)+360)%360;
  function step(state,dt){
    if(state.paused || !Number.isFinite(dt) || dt<=0) return {...state};
    const rad=Math.PI/180,R=6371000,distance=state.speed*dt,a=distance/R,b=state.heading*rad,lat=state.lat*rad,lon=state.lon*rad;
    const lat2=Math.asin(Math.sin(lat)*Math.cos(a)+Math.cos(lat)*Math.sin(a)*Math.cos(b));
    const lon2=lon+Math.atan2(Math.sin(b)*Math.sin(a)*Math.cos(lat),Math.cos(a)-Math.sin(lat)*Math.sin(lat2));
    return {...state,lat:lat2/rad,lon:((lon2/rad+540)%360)-180};
  }
  const api={initial,clamp,wrap,step};
  if(typeof module!=='undefined')module.exports=api;
  root.Flight=api;
})(globalThis);
