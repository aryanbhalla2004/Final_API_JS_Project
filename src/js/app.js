const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const baseURL = `https://api.mapbox.com/geocoding/v5/`;
const apiKEY = `?access_token=pk.eyJ1IjoiYXJ5YW5iaGFsbGEiLCJhIjoiY2ttbWMxYjN0MG4zNzJ2b2RzenNtNHloeCJ9.D28HxdUCUpf7YpvsQZ26AQ`;
const originsDOM = document.querySelector('.origins');
const destinationDOM = document.querySelector('.destinations');
const tripButton = document.querySelector('.plan-trip');
const routeDOM = document.querySelector('.my-trip');

let origin = ``;
let destination = ``;

originForm.addEventListener('keydown', e => {
  const inputBar = document.querySelector('.origin-form input');
  if(e.which === 13){
    e.preventDefault();
    getLocation(inputBar.value, 'origin');
  }
});

destinationForm.addEventListener('keydown', e => {
  const inputBar = document.querySelector('.destination-form input');
  if(e.which === 13){
    e.preventDefault();
    getLocation(inputBar.value, 'destination');
  }
})


async function getLocation(query, location) {
  if(location === 'origin'){
    const response = await fetch(`${baseURL}mapbox.places/${query}.json${apiKEY}&limit=10&bbox=-97.325875,49.766204,-96.953987,49.99275`);
    const JSON = await response.json();
    drawLocationDOM(JSON.features, originsDOM, false);
  } else if(location === 'destination'){
    const response = await fetch(`${baseURL}mapbox.places/${query}.json${apiKEY}&limit=10&bbox=-97.325875,49.766204,-96.953987,49.99275`);
    const JSON = await response.json();
    drawLocationDOM(JSON.features, destinationDOM, false);
  }
}

function drawLocationDOM(locations, outputLocation, route) {
  if(!route) {
    outputLocation.textContent = ``;
    locations.forEach(singleLocation => {
      outputLocation.insertAdjacentHTML('beforeend', `
        <li data-long="${singleLocation.center[0]}" data-lat="${singleLocation.center[1]}">
          <div class="name">${singleLocation.place_name.split(',')[0]}</div>
          <div>${singleLocation.place_name.split(',')[1]}</div>
        </li>
      `);
    });
  } else {
    routeDOM.textContent = ``;
    outputLocation.insertAdjacentHTML('beforeend', `
      <li><span class="material-icons">exit_to_app</span> Depart at ${new Date(locations.segments[0].times.start).toLocaleTimeString('en-US', {hour: '1-digit', minute:'2-digit', hour12: true, second:'2-digit'})}</li>
    `);

    locations.segments.forEach(element => {
      if(element.type === 'walk'){
        if(element.to === undefined || element.to.destination !== undefined){
          outputLocation.insertAdjacentHTML('beforeend', `
            <li><span class="material-icons">directions_walk</span>Walk for ${element.times.durations.total} minutes to your destination, arriving at ${new Date(element.times.end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true, second:'2-digit'})}</li>
          `);
        } else {
          outputLocation.insertAdjacentHTML('beforeend', `
            <li><span class="material-icons">directions_walk</span>Walk for ${element.times.durations.total} minutes to stop #${element.to.stop.key} - ${element.to.stop.name}</li>
          `);
        }
      } else if(element.type === 'ride'){ 
        let name;
        if(element.route['badge-label'] === "B"){
          name = "BLUE";
        } else {
          name = element.route.name;
        }
        outputLocation.insertAdjacentHTML('beforeend', `
          <li><span class="material-icons">directions_bus</span>Ride the ${name} for ${element.times.durations.total} minutes.</li>
        `);
      } else if(element.type === 'transfer'){
        outputLocation.insertAdjacentHTML('beforeend', `
          <li><span class="material-icons">transfer_within_a_station</span>Transfer from stop #${element.from.stop.key} - ${element.from.stop.name} to stop #${element.to.stop.key} - ${element.to.stop.name}</li>
        `);
      }
    });
  }
}

originsDOM.addEventListener('click', e => {
  let long = e.target.closest('LI').dataset.long;
  let lat = e.target.closest('LI').dataset.lat;
  origin = `${lat},${long}`;
  console.log(origin);
});

destinationDOM.addEventListener('click', e => {
  let long = e.target.closest('LI').dataset.long;
  let lat = e.target.closest('LI').dataset.lat;
  destination = `${lat},${long}`;
  console.log(destination);
});

tripButton.addEventListener('click', e => {
  if(destination !== `` && origin !== ``){
    getTripData();
  }
});


async function getTripData(){
  const response = await fetch(`https://api.winnipegtransit.com/v3/trip-planner.json?origin=geo/${origin}&api-key=eg1G3N2HfyiROxEYBM_5&destination=geo/${destination}`);
  const JSON = await response.json();
  const lowestTime = JSON.plans.reduce((prev,current) => (new Date(prev.times.end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) < new Date(current.times.end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})) ? prev : current);
  const possibleTimes = [];
  let time = new Date(lowestTime.times.end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false });
  console.log(time);
  JSON.plans.forEach(element => {
    if(time >= new Date(element.times.end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false })){
      time = new Date(element.times.end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false });
      possibleTimes.push(element);
    }
  });

  const outCome = possibleTimes.reduce((prev, current) => (prev.times.durations.total) > (current.times.durations.total) ? prev : current);
  drawLocationDOM(outCome, routeDOM, true);
}
