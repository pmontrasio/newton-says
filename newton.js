var Big = require("big.js");
Big.DP = 40; // 30 digits of precision
var Planet = require("./planet.js");
var printf = require("printf");

var kmToPlanet = Planet.cwrap("km_to_planet", "number", ["number", "number"]);

var planets = [
  {name: "Mercury", id: 1, mass: Big("3.3022e23")},
  {name: "Venus", id: 2, mass: Big("4.8676e24")},
  {name: "Mars", id: 4, mass: Big("6.4185e23")},
  {name: "Jupiter", id: 5, mass: Big("1.8986e27")},
  {name: "Saturn", id: 6, mass: Big("5.6846e26")},
  {name: "Neptune", id: 7, mass: Big("1.0243e26")},
  {name: "Uranus", id: 8, mass: Big("8.681e25")},
  {name: "Pluto", id: 9, mass: Big("1.305e22")}
];

var julianDay = new Date().getTime() / 86400000 + 2440587.5;

const G = Big("6.67384e-11");
const personMass = Big(70);
const forceBase = G.times(personMass);

const cargoShipMass = Big("180000000");

var distance;
var planetForce;
var equivalentDistance;

for (var planet of planets.values()) {
  distance = Big(kmToPlanet(julianDay, planet.id) * 1000);
  planetForce = forceBase.times(planet.mass).div(distance).div(distance);
  equivalentDistance = forceBase.times(cargoShipMass).div(planetForce).sqrt();
  console.log(printf("%7s: distance %14.0f m, force %14.14f N, equivalent: %14.2f m",
                     planet.name, distance, planetForce, equivalentDistance));
}
