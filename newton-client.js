$(document).ready(function () {
  var Big = require("big.js");
  Big.DP = 30; // the digits of precision for divisions
  //var Planet = require("./planet.js");
  var printf = require("printf");

  var kmToPlanet = Module().cwrap("km_to_planet", "number", ["number", "number"]);

  const planets = [
    { name: "Mercury", id: 1, mass: Big("3.3022e23"), img: $("#planet-mercury") },
    { name: "Venus", id: 2, mass: Big("4.8676e24"), img: $("#planet-venus") },
    { name: "Mars", id: 4, mass: Big("6.4185e23"), img: $("#planet-mars") },
    { name: "Jupiter", id: 5, mass: Big("1.8986e27"), img: $("#planet-jupiter") },
    { name: "Saturn", id: 6, mass: Big("5.6846e26"), img: $("#planet-saturn") },
    { name: "Neptune", id: 7, mass: Big("1.0243e26"), img: $("#planet-neptune") },
    { name: "Uranus", id: 8, mass: Big("8.681e25"), img: $("#planet-uranus") },
    { name: "Pluto", id: 9, mass: Big("1.305e22"), img: $("#planet-pluto") }
  ];

  const stuff = [
    { name: "super oil tanker ship", mass: Big("650000e3") },
    { name: "oil tanker ship", mass: Big("300000e3") },
    { name: "container carrier ship", mass: Big("180000e3") },
    { name: "cruise ship", mass: Big("170000e3") },
    { name: "train", mass: Big("600e3") },
    { name: "Airbus A380", mass: Big("500e3") },
    //  { name: "Boing 787", mass: Big("200e3") },
    { name: "metro train", mass: Big("200e3") },
    { name: "truck", mass: Big("20e3") },
    { name: "elephant", mass: Big("7e3") },
    { name: "rhinoceros", mass: Big("3.5e3") },
    { name: "hippopotamus", mass: Big("2.5e3") },
    { name: "lion", mass: Big("2.5e2") },
    { name: "gorilla", mass: Big("2e2") }
  ];


  const G = Big("6.67384e-11");
  const personMass = Big(70);
  const forceBase = G.times(personMass);
  const thousand = Big(1000);

  // http://yal.cc/string_thousands/
  function string_thousands(v) {
    var r, i;
    r = "" + v;
    for (i = r.length - 3; i > 0; i -= 3) {
      r = r.substr(0, i) + "," + r.substr(i);
    }
    return r;
  }

  var selectedPlanet;
  var equivalentDistance;

  //for (var planet of planets.values()) {
  planets.forEach(function (planet) {
    planet.img.on("click", function () {

      selectedPlanet = planet.id;
      $("#planets").fadeOut({duration: 1000, complete: function () {
        $(".planet-image").attr({src: planet.img.attr("src")});
        $("#selected-planet").fadeIn(1000);
      }});
      $("#question-1").hide();
      $(".planet-name").html(planet.name);
      $("#question-2").show();

      var now = new Date().getTime() / 86400000 + 2440587.5; // Julian day
      var distanceKm = Big(kmToPlanet(now, planet.id));
      var distance = distanceKm.times(thousand);
      var planetForce = forceBase.times(planet.mass).div(distance).div(distance);
      var m2kg = forceBase.div(planetForce);

      $("#distance").html(string_thousands(distanceKm.toFixed(0)));
    });
  });
/*
  for (var planet of planets.values()) {
    distanceKm = Big(kmToPlanet(now, planet.id));
    distance = distanceKm.times(thousand);
    planetForce = forceBase.times(planet.mass).div(distance).div(distance);

    console.log(printf("\n%7s: distance %13s km, force %14.14f N. Equivalent to:",
                       planet.name, string_thousands(distanceKm.toFixed(0)), planetForce));

    m2kg = forceBase.div(planetForce);

    for (var thing of stuff.values()) {
      equivalentDistance = m2kg.times(thing.mass).sqrt();
      console.log(printf("  %22s at %22.14f m", thing.name, equivalentDistance));
    }
  }
*/
});
