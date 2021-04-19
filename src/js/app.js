const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const baseURL = `https://api.mapbox.com/geocoding/v5/`;
const apiKEY = `?access_token=pk.eyJ1IjoiYXJ5YW5iaGFsbGEiLCJhIjoiY2ttbWMxYjN0MG4zNzJ2b2RzenNtNHloeCJ9.D28HxdUCUpf7YpvsQZ26AQ`;
const originsDOM = document.querySelector('.origins');
const destinationDOM = document.querySelector('.destinations');

originForm.addEventListener('keydown', e => {
  const inputBar = document.querySelector('.origin-form input');
  if(e.which === 13){
    e.preventDefault();
    getLocation(inputBar.value, 'origin');
    inputBar.value = ``;
  }
});

destinationForm.addEventListener('keydown', e => {
  const inputBar = document.querySelector('.destination-form input');
  if(e.which === 13){
    e.preventDefault();
    getLocation(inputBar.value, 'destination');
    inputBar.value = ``;
  }
})


async function getLocation(query, location) {
  if(location === 'origin'){
    const response = await fetch(`${baseURL}mapbox.places/${query}.json${apiKEY}&limit=10&bbox=-97.325875,49.766204,-96.953987,49.99275`);
    const JSON = await response.json();
    drawLocationDOM(JSON.features, originsDOM);
  } else if(location === 'destination'){
    const response = await fetch(`${baseURL}mapbox.places/${query}.json${apiKEY}&limit=10&bbox=-97.325875,49.766204,-96.953987,49.99275`);
    const JSON = await response.json();
    drawLocationDOM(JSON.features, destinationDOM);
  }
}

function drawLocationDOM(locations, outputLocation) {
  outputLocation.textContent = ``;
  locations.forEach(singleLocation => {
    let name = singleLocation.place_name.split(',')[0];
    let location = singleLocation.place_name.split(',')[1];
    outputLocation.insertAdjacentHTML('beforeend', `
      <li data-long="-97.113936" data-lat="49.823059">
        <div class="name">${name}</div>
        <div>${location}</div>
      </li>
    `);
  })
}

