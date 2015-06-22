$(document).ready(function () {
  var Big = require("big.js");
  Big.DP = 30; // the digits of precision for divisions
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
    { name: "super oil tanker ship", id: 1, mass: Big("650000e3") },
    { name: "oil tanker ship", id: 2, mass: Big("300000e3") },
    { name: "container carrier ship", id: 3, mass: Big("180000e3") },
    { name: "cruise ship", id: 4, mass: Big("170000e3") },
    { name: "train", id: 5, mass: Big("600e3") },
    { name: "Airbus A380", id: 6, mass: Big("500e3") },
    { name: "metro train", id: 7, mass: Big("200e3") },
    { name: "truck", id: 8, mass: Big("20e3") },
    { name: "blue whale", id: 9, mass: Big("19e3") },
    { name: "elephant", id: 10, mass: Big("7e3") },
    { name: "rhinoceros", id: 11, mass: Big("3.5e3") },
    { name: "hippopotamus", id: 12, mass: Big("2.5e3") },
    { name: "crocodile", id: 13, mass: Big("1e3") },
    { name: "lion", id: 14, mass: Big("2.5e2") }
  ];

  var compute = new Array(stuff.length);
  for (var i = 0; i < compute.length; i++) {
    compute[i] = false;
  }

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

  function distanceAndForce() {
    var now = new Date().getTime() / 86400000 + 2440587.5; // Julian day
    var distanceKm = Big(kmToPlanet(now, selectedPlanet.id));
    var distance = distanceKm.times(thousand);
    var planetForce = forceBase.times(selectedPlanet.mass).div(distance).div(distance);
    var m2kg = forceBase.div(planetForce);

    $("#distance").html(string_thousands(distanceKm.toFixed(0)));
    // display 5 non zero digits
    var force = planetForce.toFixed(20);
    var i = 2;
    for (; i < force.length && force[i] == "0"; i++) {}
    $("#force").html(force.substr(0, i + 5));

/**/
    stuff.forEach(function (thing) {
      if (compute[thing.id]) {
        equivalentDistance = m2kg.times(thing.mass).sqrt();
        //console.log(printf("  %22s at %22.14f m", thing.name, equivalentDistance));
        // TODO update the distance of the thing
      }
    });
/**/
  }

  //for (var planet of planets.values()) {
  planets.forEach(function (planet) {
    planet.img.on("click", function () {

      selectedPlanet = planet;
      $("#question-1").hide();
      $(".planet-name").html(planet.name);
      $("html, body").animate({ scrollTop: $("#first-object").offset().top }, 500);
      $("#planets").fadeOut({duration: 1000, complete: function () {
        $(".planet-image").attr({src: planet.img.attr("src")});
        $("#selected-planet").fadeIn({duration: 1000, complete: function () {
          distanceAndForce();
          $(".question-2").fadeIn(250);
          $("#reset-planet").on("click", function () {
            clearInterval(updateDistanceAndForce);
            selectedPlanet = undefined;
            $(".planet-name").html("");
            $("#selected-planet").fadeOut(250);
            $(".question-2").fadeOut(250);
            $("#question-1").fadeIn(250);
            $("#planets").fadeIn(250);
          });
          var updateDistanceAndForce = setInterval(distanceAndForce, 1000);
        }});
      }});
    });
  });

  stuff.forEach(function (thing) {
    $("#stuff-" + thing.id).html(string_thousands(thing.mass.toFixed(0)));
  });

  $(".objects img").on("click", function () {
    var element = $(this);
    var transform1 = "rotateY(360deg)";
    var transition1Speed = "1.0s";
    var transform2 = "rotateY(0deg)";
    var transition2Speed = "0.0s";
    var delay = 1100;
    if (element.hasClass("rotate-x")) {
      transform1 = "rotateX(60deg)";
      transition1Speed = "0.25s";
      transform2 = "rotateX(0deg)";
      transition2Speed = "0.25s";
      delay = 260;
    }
    element.css({perspective: 1000, transform: transform1,
                 transition: transition1Speed, "transform-style": "preserve-3d" });
    // and reset the rotation to be able to rotate element again
    setTimeout(function() {
      element.css({perspective: 1000, transform: transform2,
                   transition: transition2Speed, "transform-style": "preserve-3d" });
    }, delay);

    var id = parseInt(element.data("stuff"), 10);
    // se è compute false, significa che era visibile ma non ancora cliccato e quindi niente distanza: si mostra la distanza
    // se è compute true, aveva la distanza calcolata: si nasconde
    compute[id] = !compute[id];
    if (compute[id]) {
      // TODO fadeIn the distance display for the thing
    } else {
      // TODO fadeOut the thing, hide the distance display for the thing, show the more things prompt
    }
  });

  // TODO click sui more things prompts
});
