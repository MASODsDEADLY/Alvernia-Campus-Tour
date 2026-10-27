/* Alvernia Campus Tour — Cesium UI and campus landmark tour. */
(() => {
  const $ = id => document.getElementById(id);
  const landmarks = window.CAMPUS_LANDMARKS || [];
  if (typeof Cesium === 'undefined') { $('message').textContent='Cesium did not load. Check your connection or CDN access.'; return; }
  const token = window.APP_CONFIG && window.APP_CONFIG.CESIUM_ION_TOKEN;
  if (!token) { $('message').textContent='Cesium Ion token is missing. Check config.js.'; return; }
  Cesium.Ion.defaultAccessToken = token;

  let viewer, tileset, selected = 0, flying = false, tourMode = false;
  let speed = 70, height = 220, heading = 0, lon = -75.9343, lat = 40.3214;
  let lastTime = performance.now(), frameId, follow = true;
  const pins = [];
  const start = landmarks[0] || {lon:-75.9343,lat:40.3214};
  lon=start.lon; lat=start.lat;

  function setMessage(s){ $('message').textContent=s; }
  function updateReadout(){
    $('latitude').textContent=lat.toFixed(6);
    $('longitude').textContent=lon.toFixed(6);
    $('altitude').textContent=Math.round(height)+' m';
    $('headingValue').textContent=Math.round(heading)+'°';
    $('speedValue').textContent=Math.round(speed)+' m/s';
  }
  function cameraTo(item, range){
    // Fly around the landmark target, rather than placing the camera directly
    // above its coordinates. Bounding-sphere offsets keep the target centered
    // in the CURRENT Cesium viewport, even when the canvas has been resized.
    const target=Cesium.Cartesian3.fromDegrees(item.lon,item.lat,0);
    const focusRange=range || item.range || 320;
    viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 1), {
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(-28),
        focusRange
      ),
      duration: 1.4
    });
    viewer.scene.requestRender();
  }
  function selectLandmark(index, move=true){
    selected=(index+landmarks.length)%landmarks.length;
    const item=landmarks[selected];
    $('landmarkName').textContent=item.name;
    $('landmarkHistory').textContent=item.history;
    $('landmarkCount').textContent=String(selected+1).padStart(2,'0')+' / '+String(landmarks.length).padStart(2,'0');
    $('landmarkCoords').textContent=item.lat.toFixed(6)+', '+item.lon.toFixed(6);
    $('landmarkList').querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',i===selected));
    if(move){lat=item.lat;lon=item.lon;heading=0;updateReadout();cameraTo(item);}
    setMessage('Selected campus stop: '+item.name);
  }
  function move(dt){
    if(!flying)return;
    const R=6371000, rad=Math.PI/180, distance=speed*dt, a=distance/R, b=heading*rad, p=lat*rad, l=lon*rad;
    const p2=Math.asin(Math.sin(p)*Math.cos(a)+Math.cos(p)*Math.sin(a)*Math.cos(b));
    const l2=l+Math.atan2(Math.sin(b)*Math.sin(a)*Math.cos(p),Math.cos(a)-Math.sin(p)*Math.sin(p2));
    lat=p2/rad;lon=((l2/rad+540)%360)-180;
    if(follow) viewer.camera.lookAt(Cesium.Cartesian3.fromDegrees(lon,lat,height),new Cesium.HeadingPitchRange(heading*rad,Cesium.Math.toRadians(-35),900));
    updateReadout(); viewer.scene.requestRender();
  }
  async function init(){
    try{
      viewer=new Cesium.Viewer('globe',{globe:false,baseLayer:false,baseLayerPicker:false,geocoder:false,animation:false,timeline:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,fullscreenButton:false,infoBox:false,selectionIndicator:false,shouldAnimate:false,requestRenderMode:true,maximumRenderTimeChange:Infinity});
      // Reduce GPU and memory pressure on integrated and laptop GPUs.
      viewer.resolutionScale=0.65;
      viewer.scene.requestRenderMode=true;
      viewer.scene.maximumRenderTimeChange=Infinity;
      viewer.scene.msaaSamples=1;
      viewer.scene.fog.enabled=false;
      setMessage('Loading Google Photorealistic 3D Tiles…');
      tileset=await Cesium.createGooglePhotorealistic3DTileset({onlyUsingWithGoogleGeocoder:false});
      tileset.maximumScreenSpaceError=24;
      tileset.dynamicScreenSpaceError=true;
      tileset.skipLevelOfDetail=true;
      viewer.scene.primitives.add(tileset);
      landmarks.forEach((item,i)=>{
        const e=viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(item.lon,item.lat,12),
          point:{pixelSize:i===0?13:10,color:i===0?Cesium.Color.GOLD:Cesium.Color.fromCssColorString('#f5c451'),outlineColor:Cesium.Color.fromCssColorString('#32101f'),outlineWidth:2},
          label:{text:item.name,font:'bold 12px sans-serif',fillColor:Cesium.Color.WHITE,outlineColor:Cesium.Color.BLACK,outlineWidth:3,style:Cesium.LabelStyle.FILL_AND_OUTLINE,pixelOffset:new Cesium.Cartesian2(0,-18),showBackground:true,backgroundColor:Cesium.Color.fromCssColorString('#32101fe8'),distanceDisplayCondition:new Cesium.DistanceDisplayCondition(0,7000)}});
        pins.push(e);
      });
      viewer.screenSpaceEventHandler.setInputAction((click)=>{
        const picked=viewer.scene.pick(click.position);
        if(picked && picked.id){const idx=pins.indexOf(picked.id);if(idx>=0)selectLandmark(idx);}
      },Cesium.ScreenSpaceEventType.LEFT_CLICK);
      viewer.resize();
      cameraTo(start, 1400);
      setMessage('Campus tiles loaded. Choose a landmark to explore its story.');
      lastTime=performance.now();
    }catch(e){console.error(e);setMessage('3D tiles could not load. Check your Cesium Ion token, Google 3D Tiles access, and internet connection.');}
  }
  let tickScheduled=false;
  function scheduleTick(){if(!tickScheduled){tickScheduled=true;requestAnimationFrame(tick);}}
  function tick(now){
    tickScheduled=false;
    const dt=Math.min((now-lastTime)/1000,0.1);lastTime=now;
    move(dt);
    if(tourMode && !flying && now-(window._lastStop||0)>4800){selectLandmark(selected+1);window._lastStop=now;}
    if(flying || tourMode) scheduleTick();
  }
  function captureCenterCoordinates(){
    if(!viewer){$('capturedCoordinates').textContent='3D view is not ready yet.';return;}
    const canvas=viewer.scene.canvas;
    // Recalculate from the live canvas size each time; never cache dimensions
    // from before the responsive layout/resolution-scale changes.
    viewer.resize();
    const rect=canvas.getBoundingClientRect();
    const center=new Cesium.Cartesian2(
      Math.round(rect.width / 2),
      Math.round(rect.height / 2)
    );
    let point=null;
    try{
      // pickPosition returns the visible 3D tile surface directly beneath the screen center.
      if(viewer.scene.pickPositionSupported) point=viewer.scene.pickPosition(center);
      if(!point){
        const ray=viewer.camera.getPickRay(center);
        if(ray && viewer.scene.pickPositionSupported) point=viewer.scene.pickPosition(center);
      }
    }catch(err){console.warn('Center coordinate capture failed',err);}
    if(!point){$('capturedCoordinates').textContent='No 3D surface found at the center dot. Aim at a visible building or ground surface and try again.';return;}
    const c=Cesium.Cartographic.fromCartesian(point);
    const latitude=Cesium.Math.toDegrees(c.latitude), longitude=Cesium.Math.toDegrees(c.longitude), elevation=c.height;
    const text=latitude.toFixed(7)+', '+longitude.toFixed(7)+'  ·  elevation '+Math.round(elevation)+' m';
    $('capturedCoordinates').textContent=text;
    $('capturedCoordinates').title='Latitude: '+latitude.toFixed(7)+'; Longitude: '+longitude.toFixed(7)+'; Elevation: '+elevation.toFixed(2)+' m';
    $('message').textContent='Captured coordinates from the 3D surface under the center dot.';
  }
  function buildList(){
    const list=$('landmarkList');
    landmarks.forEach((item,i)=>{
      const b=document.createElement('button');b.type='button';b.className='landmark-item';
      b.innerHTML='<span class="stop-number">'+String(i+1).padStart(2,'0')+'</span><span class="stop-name"></span><span class="stop-arrow">↗</span>';
      b.querySelector('.stop-name').textContent=item.name;
      b.addEventListener('click',()=>selectLandmark(i));
      list.appendChild(b);
    });
  }
  $('captureCoordinates').addEventListener('click',captureCenterCoordinates);
  $('previewEdgeCase').addEventListener('click',()=>{
    const result='EXPECTED EDGE-CASE RESULT: No 3D surface found at the center dot. No coordinates were generated. Aim at a visible building or ground surface and try again. (Preview only; this button simulates the message and does not change the map.)';
    $('edgeCaseResult').textContent=result;
    $('capturedCoordinates').textContent='Edge-case preview: no coordinates generated.';
  });
  $('fly').addEventListener('click',()=>{lastTime=performance.now();flying=true;scheduleTick();tourMode=false;setMessage('Moving around campus. Pause to inspect a landmark.');});
  $('pause').addEventListener('click',()=>{flying=false;tourMode=false;setMessage('Paused. Explore a building or continue the tour.');});
  $('reset').addEventListener('click',()=>{flying=false;tourMode=false;speed=70;height=220;heading=0;$('speed').value=speed;$('height').value=height;selectLandmark(0);});
  $('left').addEventListener('click',()=>{heading=(heading-10+360)%360;updateReadout();});
  $('right').addEventListener('click',()=>{heading=(heading+10)%360;updateReadout();});
  $('previous').addEventListener('click',()=>selectLandmark(selected-1));
  $('next').addEventListener('click',()=>selectLandmark(selected+1));
  $('flyTo').addEventListener('click',()=>{flying=false;tourMode=false;selectLandmark(selected);});
  $('guidedTour').addEventListener('click',()=>{flying=false;tourMode=!tourMode;$('guidedTour').textContent=tourMode?'Stop guided tour':'Start guided tour';if(tourMode){selectLandmark(selected);window._lastStop=performance.now();scheduleTick();setMessage('Guided tour is on. Stops advance every few seconds.');}});
  $('speed').addEventListener('input',e=>{speed=Math.max(0,Math.min(250,Number(e.target.value)||0));updateReadout();});
  $('height').addEventListener('input',e=>{height=Math.max(50,Math.min(5000,Number(e.target.value)||50));updateReadout();});
  $('search').addEventListener('input',e=>{const q=e.target.value.toLowerCase();$('landmarkList').querySelectorAll('button').forEach((b,i)=>b.hidden=!landmarks[i].name.toLowerCase().includes(q));});
  $('follow').addEventListener('change',e=>{follow=e.target.checked;if(!follow)viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);});
  buildList();updateReadout();selectLandmark(0,false);init();
})();