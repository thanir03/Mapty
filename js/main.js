"use strict";

let icons = {
  running: ["🦶🏼", "spm"],
  cycling: ["⛰", "m"],
};

const formEl = document.querySelector(`.form`);
const workoutListEl = document.querySelector(`.workout-list`);
const inputType = document.querySelector(`.form-input--type`);
const inputDistance = document.querySelector(`.form-input--distance`);
const inputDuration = document.querySelector(`.form-input--duration`);
const inputCadence = document.querySelector(`.form-input--cadence`);
const inputElevation = document.querySelector(`.form-input--elevation`);
const listEl = document.querySelector(`.list`);
const mapEl = document.querySelector(`#map`);
const deleteBtn = document.getElementsByClassName("delete");

class App {
  #workoutList = JSON.parse(localStorage.getItem("workout")) ?? [];
  #map;
  #selectedPosition = [];
  #zoomLevel = 16;
  #markerList = [];
  constructor() {
    this.#getCurrentPosition();
    this.#eventListener();
  }

  #getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      this.#loadMap.bind(this),
      this.#errorGeolocation
    );
  }

  //   regular  fn has this keyword of undefined in strict mode
  #loadMap(posititon) {
    let { latitude, longitude } = posititon.coords;
    let currentUserPos = [latitude, longitude];
    this.#map = L.map("map").setView(currentUserPos, 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(this.#map);
    this.#map.on("click", this.#showForm.bind(this.#map, this));
    this.#renderWorkoutData();
  }

  #errorGeolocation() {
    mapEl.textContent = "Couldnt get the location";
  }

  #showForm(self, mapEvent) {
    let { lat, lng } = mapEvent.latlng;
    self.#selectedPosition = [lat, lng];
    formEl.classList.remove("hidden");
    inputDistance.focus();
  }

  #toggleField() {
    inputElevation.closest(".form-row").classList.toggle("form-row--hidden");
    inputCadence.closest(".form-row").classList.toggle("form-row--hidden");
  }

  #addWorkoutData(event) {
    function isDataValid(...array) {
      return array.every((data) => data > 0 && Number.isFinite(data));
    }
    event.preventDefault();
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const position = this.#selectedPosition;
    const cadence = +inputCadence.value;
    const elevGain = +inputElevation.value;
    let currentWorkout;
    if (type === "running") {
      if (!isDataValid(distance, duration, cadence)) {
        alert("Data is not valid");
        return;
      }
      currentWorkout = new Running(distance, duration, position, cadence);
    }
    if (type === "cycling") {
      if (!isDataValid(distance, duration, elevGain)) {
        alert("Data is not valid");
        return;
      }
      currentWorkout = new Cycling(distance, duration, position, elevGain);
    }

    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";
    this.#workoutList.push(currentWorkout);
    localStorage.setItem("workout", JSON.stringify(this.#workoutList));
    formEl.style.display = "none";
    formEl.classList.add("hidden");
    setTimeout(() => (formEl.style.display = "grid"), 1000);
    // this.#workoutList.sort((a,b) => b.click - a.click)
    this.#map.setView(position, 16);
    this.#renderWorkoutData();
  }

  #renderWorkoutData() {
    let htmlStr = "";
    this.#workoutList.forEach((list) => {
      let {
        type,
        id,
        distance,
        duration,
        cadence,
        pace,
        elevGain,
        speed,
        description,
      } = list;
      let isRunningState = type === "running";

      htmlStr += `
    <li class="workout workout-${type}" data-id = ${id}>
      <h2 class="workout-title">${description}</h2>
      <i class="fa fa-trash-o delete"></i>
    <div class="workout-details">
            <span class="workout-icon">${
              type === "running" ? "🏃" : "🚲"
            }</span>
            <span class="workout-value">${distance}</span>
            <span class="workout-unit">KM</span>
        </div>
        <div class="workout-details">
            <span class="workout-icon">⏱</span>
            <span class="workout-value">${duration}</span>
            <span class="workout-unit">min</span>
        </div>
        <div class="workout-details">
            <span class="workout-icon">⚡️</span>
            <span class="workout-value">${+(
              isRunningState ? pace : speed
            ).toFixed(2)}</span>
            <span class="workout-unit">${
              isRunningState ? "min/km" : "km/h"
            }</span>
        </div>
        <div class="workout-details">
            <span class="workout-icon">${icons[type][0]}</span>
            <span class="workout-value">${
              isRunningState ? cadence : elevGain
            }</span>
            <span class="workout-unit">${icons[type][1]}</span>
        </div>
    </li> 
    `;
    });
    listEl.innerHTML = htmlStr;
    [...deleteBtn].forEach((btn) =>
      btn.addEventListener("click", this.#deleteWorkout.bind(this))
    );
    this.#renderMarkerMap();
  }

  #renderMarkerMap() {
    this.#workoutList.forEach((el) => {
      let { type, position, description } = el;
      this.#markerList.push(
        L.marker(position)
          .addTo(this.#map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${type}-popup `,
            })
          )
          .setPopupContent(` ${description}`)
          .openPopup()
      );
    });
  }

  #moveWorkoutMap(event) {
    let selectedElement = event.target.closest(".workout");
    if (!selectedElement || event.target.classList.contains("delete")) return;
    let workout = this.#workoutList.find(
      (workout) => workout.id === selectedElement.dataset.id
    );
    Workout.prototype.calcClick.call(workout);
    let option = {
      animate: true,
      pan: {
        duration: 1,
      },
    };
    this.#map.setView(workout.position, this.#zoomLevel, option);
  }

  #eventListener() {
    formEl.addEventListener(
      "submit",
      function (event) {
        this.#addWorkoutData(event);
        this.#renderWorkoutData();
      }.bind(this)
    );
    inputType.addEventListener("change", this.#toggleField.bind(this));
    workoutListEl.addEventListener("click", this.#moveWorkoutMap.bind(this));
  }

  clearLocalStorage() {
    localStorage.removeItem("workout");
    location.reload();
    // this.#renderWorkoutData();
  }

  #deleteWorkout(event) {
    let workoutId = event.target.closest(".workout").dataset.id;
    let deletedWorkout;
    this.#workoutList.forEach((el) => {
      if (el.id === workoutId) {
        deletedWorkout = el;
      }
    });
    let selectedCoor = deletedWorkout.position;
    this.#workoutList = this.#workoutList.filter(
      (workout) => workout.id !== workoutId
    );
    this.#markerList.forEach((i) => {
      let { lat, lng } = i._latlng;
      if (lat === selectedCoor[0] && lng === selectedCoor[1]) {
        this.#map.removeLayer(i);
      }
    });
    this.#renderWorkoutData();
    localStorage.setItem("workout", JSON.stringify(this.#workoutList));
  }
}

let app = new App();
