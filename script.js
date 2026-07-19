function updateClock(){
  const now = new Date();
  clock.innerHTML = now.toLocaleTimeString();
  date.innerHTML = now.toDateString();
}

setInterval(updateClock, 1000);
updateClock();

function getLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(pos){
      document.getElementById("userLocation").innerHTML =
        "Latitude : " + pos.coords.latitude.toFixed(5)
        + "<br>Longitude : " + pos.coords.longitude.toFixed(5);
    });
  }
}

async function scanSky(){
  iss.innerHTML = "Scanning...";

  try{
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
    const data = await res.json();

    iss.innerHTML =
      "🛰 ISS Found<br><br>" +
      "Latitude : " + data.latitude.toFixed(2) + "°<br>" +
      "Longitude : " + data.longitude.toFixed(2) + "°<br>" +
      "Altitude : " + Math.round(data.altitude) + " km<br>" +
      "Speed : " + Math.round(data.velocity) + " km/h";
  }catch{
    iss.innerHTML = "No Internet";
  }
}

async function satellites(){
  iss.innerHTML = "Getting your location...";

  navigator.geolocation.getCurrentPosition(async function(pos){
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    iss.innerHTML = "Finding next passes...";

    try{
      const res = await fetch(`https://iss-api.polluxlabs.io/iss-pass?lat=${lat}&lon=${lon}&visible_only=true`);
      const data = await res.json();

      if(!data.passes || data.passes.length === 0){
        iss.innerHTML = "No visible passes found soon.";
        return;
      }

      let html = "<b>Next Visible ISS Passes</b><br><br>";

      data.passes.slice(0,3).forEach(p => {
        const riseTime = new Date(p.rise.time).toLocaleString();
        const duration = Math.round(p.duration_sec/60);
        html += `🛰 ${riseTime}<br>Direction: ${p.rise.compass} → ${p.set.compass}<br>Max height: ${Math.round(p.culmination.elevation_deg)}°<br>Duration: ~${duration} min<br><br>`;
      });

      iss.innerHTML = html;

    }catch{
      iss.innerHTML = "No Internet";
    }
  }, function(){
    iss.innerHTML = "Location permission needed.";
  });
}

function dirFromAz(az){
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(az / 22.5) % 16];
}

function planets(){
  planetsOut.innerHTML = "Getting your location...";

  navigator.geolocation.getCurrentPosition(function(pos){
    try{
      const observer = new Astronomy.Observer(pos.coords.latitude, pos.coords.longitude, 0);
      const now = new Date();
      const bodies = ["Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Moon"];

      let html = "<b>Sky Positions Right Now</b><br><br>";

      bodies.forEach(body => {
        const equ = Astronomy.Equator(body, now, observer, true, true);
        const hor = Astronomy.Horizon(now, observer, equ.ra, equ.dec, 'normal');
        const status = hor.altitude > 0 ? "☝️ Above horizon" : "⬇️ Below horizon";

        html += `<b>${body}</b>: ${status}<br>Altitude ${hor.altitude.toFixed(1)}° · Direction ${dirFromAz(hor.azimuth)}<br><br>`;
      });

      planetsOut.innerHTML = html;

    }catch(e){
      planetsOut.innerHTML = "Error loading planet data.";
    }
  }, function(){
    planetsOut.innerHTML = "Location permission needed.";
  });
}

const STAR_CATALOG = [
["Sirius",6.7525,-16.7161,-1.46],["Canopus",6.3992,-52.6956,-0.74],
["Alpha Centauri",14.6600,-60.8339,-0.27],["Arcturus",14.2610,19.1825,-0.05],
["Vega",18.6156,38.7837,0.03],["Capella",5.2782,45.9980,0.08],
["Rigel",5.2423,-8.2016,0.13],["Procyon",7.6550,5.2250,0.34],
["Betelgeuse",5.9195,7.4071,0.42],["Achernar",1.6286,-57.2367,0.46],
["Hadar",14.0637,-60.3730,0.61],["Altair",19.8464,8.8683,0.77],
["Acrux",12.4433,-63.0991,0.77],["Aldebaran",4.5987,16.5093,0.85],
["Antares",16.4901,-26.4320,0.96],["Spica",13.4199,-11.1613,0.97],
["Pollux",7.7553,28.0262,1.14],["Fomalhaut",22.9608,-29.6222,1.16],
["Deneb",20.6905,45.2803,1.25],["Regulus",10.1395,11.9672,1.35],
["Adhara",6.9770,-28.9721,1.5],["Castor",7.5766,31.8883,1.58],
["Shaula",17.5601,-37.1038,1.62],["Bellatrix",5.4188,6.3497,1.64],
["Elnath",5.4382,28.6075,1.65],["Miaplacidus",9.2199,-69.7172,1.68],
["Alnilam",5.6036,-1.2019,1.69],["Alnair",22.1372,-46.9611,1.73],
["Alioth",12.9005,55.9598,1.76],["Mirfak",3.4054,49.8612,1.79],
["Dubhe",11.0621,61.7511,1.79],["Wezen",7.1400,-26.3932,1.83],
["Kaus Australis",18.4029,-34.3846,1.85],["Alkaid",13.7923,49.3133,1.86],
["Sargas",17.6222,-42.9978,1.86],["Avior",8.3752,-59.5097,1.86],
["Menkalinan",5.9921,44.9474,1.9],["Atria",16.8110,-69.0277,1.91],
["Alhena",6.6285,16.3993,1.93],["Peacock",20.4275,-56.7350,1.94],
["Polaris",2.5303,89.2641,1.98],["Mirzam",6.3783,-17.9558,1.98],
["Alphard",9.4599,-8.6586,1.99],["Hamal",2.1196,23.4624,2.01],
["Diphda",0.7264,-17.9866,2.04],["Nunki",18.9210,-26.2967,2.05],
["Menkent",14.1114,-36.3700,2.06],["Mirach",1.1622,35.6206,2.07],
["Alpheratz",0.1398,29.0904,2.07],["Rasalhague",17.5822,12.5601,2.08]
];

const PLANET_COLORS = {
  Mercury:"#b5b5b5", Venus:"#ffe9b3", Mars:"#ff6a4d",
  Jupiter:"#f0c987", Saturn:"#e8dcb0", Uranus:"#8fdcff",
  Neptune:"#5c8dff", Moon:"#ffffff"
};

function getLST(date, lonDeg){
  const JD = date.getTime()/86400000 + 2440587.5;
  const T = (JD - 2451545.0)/36525;
  let GMST = 280.46061837 + 360.98564736629*(JD-2451545.0) + 0.000387933*T*T - (T*T*T)/38710000.0;
  GMST = ((GMST % 360)+360)%360;
  return (GMST + lonDeg + 360)%360;
}

function equatorialToHorizontal(raHours, decDeg, latDeg, lstDeg){
  const raDeg = raHours*15;
  const H = ((lstDeg - raDeg + 540)%360)-180;
  const Hrad = H*Math.PI/180;
  const decRad = decDeg*Math.PI/180;
  const latRad = latDeg*Math.PI/180;

  const sinAlt = Math.sin(decRad)*Math.sin(latRad) + Math.cos(decRad)*Math.cos(latRad)*Math.cos(Hrad);
  const alt = Math.asin(sinAlt)*180/Math.PI;

  const y = Math.sin(Hrad);
  const x = Math.cos(Hrad)*Math.sin(latRad) - Math.tan(decRad)*Math.cos(latRad);
  let az = (Math.atan2(y,x)*180/Math.PI + 180)%360;
  if(az<0) az+=360;

  return {altitude:alt, azimuth:az};
}

function altAzToXY(altitude, azimuth, cx, cy, R){
  const r = (90 - altitude)/90 * R;
  const azRad = azimuth*Math.PI/180;
  return {
    x: cx + r*Math.sin(azRad),
    y: cy - r*Math.cos(azRad)
  };
}

let skyInterval = null;

function drawSkyMap(lat, lon){
  const canvas = document.getElementById("skyCanvas");
  const ctx = canvas.getContext("2d");
  const cx = canvas.width/2, cy = canvas.height/2;
  const R = Math.min(cx,cy) - 15;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = "#00e5ff88";
  ctx.beginPath();
  ctx.arc(cx,cy,R,0,2*Math.PI);
  ctx.stroke();

  ctx.fillStyle = "#00e5ff";
  ctx.font = "12px Arial";
  ctx.fillText("N", cx-4, cy-R-4);
  ctx.fillText("S", cx-4, cy+R+14);
  ctx.fillText("E", cx+R+4, cy+4);
  ctx.fillText("W", cx-R-14, cy+4);

  ctx.beginPath();
  ctx.fillStyle = "#00ff88";
  ctx.arc(cx, cy, 5, 0, 2*Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 10px Arial";
  ctx.fillText("You", cx + 8, cy + 4);

  const now = new Date();
  const lst = getLST(now, lon);
  let visibleStars = 0;

  STAR_CATALOG.forEach(([name, ra, dec, mag]) => {
    const {altitude, azimuth} = equatorialToHorizontal(ra, dec, lat, lst);
    if(altitude <= 0) return;
    visibleStars++;

    const {x,y} = altAzToXY(altitude, azimuth, cx, cy, R);
    const size = Math.max(0.6, 2.6 - mag*0.6);

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(x,y,size,0,2*Math.PI);
    ctx.fill();

    if(mag < 1.5){
      ctx.fillStyle = "#cdefff";
      ctx.font = "8px Arial";
      ctx.fillText(name, x+4, y-3);
    }
  });

  let visiblePlanets = 0;
  if(window.Astronomy){
    try{
      const observer = new Astronomy.Observer(lat, lon, 0);
      const bodies = ["Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Moon"];

      bodies.forEach(body => {
        const equ = Astronomy.Equator(body, now, observer, true, true);
        const hor = Astronomy.Horizon(now, observer, equ.ra, equ.dec, 'normal');
        if(hor.altitude <= 0) return;
        visiblePlanets++;

        const {x,y} = altAzToXY(hor.altitude, hor.azimuth, cx, cy, R);

        ctx.beginPath();
        ctx.fillStyle = PLANET_COLORS[body] || "#ffcc00";
        ctx.arc(x,y,4,0,2*Math.PI);
        ctx.fill();

        ctx.fillStyle = "#ffe9a8";
        ctx.font = "bold 9px Arial";
        ctx.fillText(body, x+5, y-4);
      });
    }catch(e){}
  }

  document.getElementById("starsInfo").innerHTML =
    `Showing ${visibleStars} bright stars + ${visiblePlanets} planets/Moon above your horizon right now. This is a simulated live view — accurate even if it's cloudy, daytime, or too bright to see them yourself. Map updates every 30s.`;
}

function stars(){
  starsInfo.innerHTML = "Getting your location...";

  navigator.geolocation.getCurrentPosition(function(pos){
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    drawSkyMap(lat, lon);

    if(skyInterval) clearInterval(skyInterval);
    skyInterval = setInterval(() => drawSkyMap(lat, lon), 30000);

  }, function(){
    starsInfo.innerHTML = "Location permission needed.";
  });
}

let arStream = null;
let arRunning = false;
let arLat = null, arLon = null;
let arHeading = 0, arPitch = 0;
let arRawAlpha = null, arRawBeta = null, arRawGamma = null;
let arEventCount = 0;
let arCalibrationOffset = 0;
let arSensorWarningShown = false;

async function startAR(){
  const arView = document.getElementById("arView");
  const arInfo = document.getElementById("arInfo");

  arInfo.innerHTML = "Requesting permissions...";
  arView.classList.remove("ar-hidden");
  arEventCount = 0;
  arSensorWarningShown = false;

  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    try{
      const res = await DeviceOrientationEvent.requestPermission();
      if(res !== "granted"){
        arInfo.innerHTML = "Motion permission denied. Enable it in your browser's site settings.";
        return;
      }
    }catch(e){
      arInfo.innerHTML = "Motion permission error.";
      return;
    }
  }

  try{
    arStream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:"environment" },
      audio:false
    });
    document.getElementById("arVideo").srcObject = arStream;
  }catch(e){
    arInfo.innerHTML = "Camera unavailable. Open this site in Chrome or Safari directly (not an in-app browser), over HTTPS.";
    return;
  }

  navigator.geolocation.getCurrentPosition(function(pos){
    arLat = pos.coords.latitude;
    arLon = pos.coords.longitude;
  }, function(){
    arInfo.innerHTML = "Location permission needed for AR.";
  });

  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);

  setTimeout(() => {
    if(arEventCount === 0 && arRunning){
      arSensorWarningShown = true;
    }
  }, 2500);

  arRunning = true;
  requestAnimationFrame(renderAR);
}

function stopAR(){
  arRunning = false;
  document.getElementById("arView").classList.add("ar-hidden");
  window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
  window.removeEventListener("deviceorientation", handleOrientation, true);
  if(arStream){
    arStream.getTracks().forEach(t => t.stop());
    arStream = null;
  }
}

function calibrateNorth(){
  arCalibrationOffset = arRawAlpha !== null ? arRawAlpha : 0;
}

function handleOrientation(event){
  arEventCount++;
  arRawAlpha = event.alpha;
  arRawBeta = event.beta;
  arRawGamma = event.gamma;

  let heading = null;

  if (typeof event.webkitCompassHeading !== "undefined" && event.webkitCompassHeading !== null){
    heading = event.webkitCompassHeading;
  } else if (event.alpha !== null){
    heading = (360 - event.alpha) % 360;
  }

  if(heading !== null){
    arHeading = (heading - arCalibrationOffset + 360) % 360;
  }
  if(event.beta !== null) arPitch = event.beta - 90;
}

function renderAR(){
  if(!arRunning) return;

  const canvas = document.getElementById("arCanvas");
  const video = document.getElementById("arVideo");
  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const arInfo = document.getElementById("arInfo");

  if(arLat === null || arLon === null){
    arInfo.innerHTML = "Waiting for location...";
    requestAnimationFrame(renderAR);
    return;
  }

  if(arSensorWarningShown){
    arInfo.innerHTML = "⚠ No compass data detected. Open this site directly in Chrome/Safari (not Acode or an in-app browser), and make sure motion sensors are allowed.";
    requestAnimationFrame(renderAR);
    return;
  }

  const FOV_H = 70;
  const FOV_V = 90;
  const now = new Date();
  const lst = getLST(now, arLon);
  let shown = 0;

  STAR_CATALOG.forEach(([name, ra, dec, mag]) => {
    const {altitude, azimuth} = equatorialToHorizontal(ra, dec, arLat, lst);
    if(altitude <= 0) return;

    let dAz = ((azimuth - arHeading + 540) % 360) - 180;
    let dAlt = altitude - arPitch;
    if(Math.abs(dAz) > FOV_H/2 || Math.abs(dAlt) > FOV_V/2) return;

    const x = canvas.width/2 + (dAz/(FOV_H/2)) * (canvas.width/2);
    const y = canvas.height/2 - (dAlt/(FOV_V/2)) * (canvas.height/2);

    const size = Math.max(2, 5 - mag*0.8);
    ctx.shadowColor = "white";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(x,y,size,0,2*Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    if(mag < 2){
      ctx.fillStyle = "#cdefff";
      ctx.font = "13px Arial";
      ctx.fillText(name, x+8, y-5);
    }
    shown++;
  });

  if(window.Astronomy){
    try{
      const observer = new Astronomy.Observer(arLat, arLon, 0);
      const bodies = ["Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Moon"];

      bodies.forEach(body => {
        const equ = Astronomy.Equator(body, now, observer, true, true);
        const hor = Astronomy.Horizon(now, observer, equ.ra, equ.dec, 'normal');
        if(hor.altitude <= 0) return;

        let dAz = ((hor.azimuth - arHeading + 540) % 360) - 180;
        let dAlt = hor.altitude - arPitch;
        if(Math.abs(dAz) > FOV_H/2 || Math.abs(dAlt) > FOV_V/2) return;

        const x = canvas.width/2 + (dAz/(FOV_H/2)) * (canvas.width/2);
        const y = canvas.height/2 - (dAlt/(FOV_V/2)) * (canvas.height/2);

        ctx.shadowColor = PLANET_COLORS[body] || "#ffcc00";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.fillStyle = PLANET_COLORS[body] || "#ffcc00";
        ctx.arc(x,y,9,0,2*Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#ffe9a8";
        ctx.font = "bold 13px Arial";
        ctx.fillText(body, x+11, y-7);
        shown++;
      });
    }catch(e){}
  }

  arInfo.innerHTML = `Heading ${Math.round(arHeading)}° · Pitch ${Math.round(arPitch)}° · ${shown} objects in view · sensor events: ${arEventCount}`;

  requestAnimationFrame(renderAR);
        }
