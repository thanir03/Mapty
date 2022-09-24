class Workout {
  click = 0;
  date = new Date();
  id = String(Date.now());
  constructor(distance, duration, position) {
    this.distance = distance;
    this.duration = duration;
    this.position = position;
  }
  setDescription() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let [day, month] = [this.date.getDay(), months[this.date.getMonth()]];
    this.description = `${
      this.type[0].toUpperCase() + this.type.slice(1)
    } on ${day} ${month} `;
  }
  calcClick(){
    this.click++
  }
}

class Running extends Workout {
  type = "running";
  constructor(distance, duration, position, cadence) {
    super(distance, duration, position);
    this.cadence = cadence;
    this.calcPace();
    this.setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(distance, duration, position, elevGain) {
    super(distance, duration, position);
    this.elevGain = elevGain;
    this.calcSpeed();
    this.setDescription();
    this.setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

//  it is better to use external library to create id
