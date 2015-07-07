$(document).ready(function () {
  $("html, body").animate({ scrollTop: 0 }, 500);
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

  // display the object if it's gravitational pull >= the one of the planet at X meters
  const distanceThreshold = { "large-objects": 100, "medium-objects": 100, "large-animals": 10 };

  const stuff = [
    { name: "A super oil tanker ship", id: 1, mass: Big("650e6"), objClass: "large-objects" },
    { name: "An oil tanker ship", id: 2, mass: Big("300e6"), objClass: "large-objects" },
    { name: "A container carrier ship", id: 3, mass: Big("180e6"), objClass: "large-objects" },
    { name: "A cruise ship", id: 4, mass: Big("170e6"), objClass: "large-objects" },

    { name: "A train", id: 5, mass: Big("600e3"), objClass: "medium-objects" },
    { name: "An Airbus A380", id: 6, mass: Big("500e3"), objClass: "medium-objects" },
    { name: "A metro train", id: 7, mass: Big("200e3"), objClass: "medium-objects" },
    { name: "A truck", id: 8, mass: Big("20e3"), objClass: "medium-objects" },

    { name: "A blue whale", id: 9, mass: Big("19e3"), objClass: "large-animals" },
    { name: "An elephant", id: 10, mass: Big("7e3"), objClass: "large-animals" },
    { name: "A rhinoceros", id: 11, mass: Big("3.5e3"), objClass: "large-animals" },
    { name: "A hippopotamus", id: 12, mass: Big("2.5e3"), objClass: "large-animals" },
    { name: "A crocodile", id: 13, mass: Big("1e3"), objClass: "large-animals" },
    { name: "A lion", id: 14, mass: Big("2.5e2"), objClass: "large-animals" }
  ];

  function resetStuffStatus(stuff) {
    var stuffStatus = new Array(stuff.length + 1);
    for (var i = 1; i <= stuff.length; i++) { // btw, use stuffStatus.length here to make an infinite loop :-)
      stuffStatus[i] = { visible: false, compute: false };
    }
    stuffStatus[1].visible = true;
    stuffStatus[5].visible = true;
    stuffStatus[9].visible = true;
    return stuffStatus;
  }

  var stuffStatus = resetStuffStatus(stuff);

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

  // distance is in meters
  function showDistance(id, distance) {
    var units;
    var distanceInUnits;

    if (distance < 10) {
      // meters with millimeters
      var distanceInMillimeters = distance.times(1000).toFixed(0); // string_thousands doesn't work well with decimal digits
      var thousandifiedDistance = string_thousands(distanceInMillimeters);
      var decimalPointIndex = thousandifiedDistance.lastIndexOf(",");
      units = "m";
      distanceInUnits = thousandifiedDistance.substr(0, decimalPointIndex) + "." + thousandifiedDistance.substr(decimalPointIndex + 1, thousandifiedDistance.length);
    } else if (distance < 1000) {
      // meters
      units = "m";
      distanceInUnits = string_thousands(distance.toFixed(0));
    } else if (distance < 10000) {
      // km with meters
      var thousandifiedDistance = string_thousands(distance.toFixed(0));
      var decimalPointIndex = thousandifiedDistance.lastIndexOf(",");
      units = "km";
      distanceInUnits = thousandifiedDistance.substr(0, decimalPointIndex) + "." + thousandifiedDistance.substr(decimalPointIndex + 1, thousandifiedDistance.length);
    } else {
      // km
      units = "km";
      distanceInUnits = string_thousands(distance.div(1000).toFixed(0));
    }
    $("#stuff-" + id + " .distance").html("at " + distanceInUnits + " " + units).css({fontSize: "150%"});
  }

  function hideDistance(id) {
    $("#stuff-" + id + " .distance").css({fontSize: "0px"}).html("");
  }

  function tagFirstDistance() {
    var computedObjects = 0;
    stuff.forEach(function (thing) {
      if (stuffStatus[thing.id].compute) {
        computedObjects++;
      }
    });
    $(".first-distance").css({ visibility: "hidden" });
    setTimeout(function () {
      $(".distance:not(:empty)").first().parent().find(".first-distance").css({ visibility: "visible" });
    }, 1000);
  }

  // print "number" with "digits" decimal digits
  function printDecimal(number, digits) {
    return number.toFixed(digits);
  }

  function distanceAndForce() {
    var now = new Date().getTime() / 86400000 + 2440587.5; // Julian day
    var distanceKm = Big(kmToPlanet(now, selectedPlanet.id));
    var distance = distanceKm.times(thousand); // meters
    var planetForce = forceBase.times(selectedPlanet.mass).div(distance).div(distance);
    var m2kg = forceBase.div(planetForce);

    $("#distance").html(string_thousands(distanceKm.toFixed(0)));

    // display the force with 5 non zero decimal digits
    var force = planetForce.toFixed(20);
    var i = 2;
    for (; i < force.length && force[i] == "0"; i++) {}
    $(".force-value").html(force.substr(0, i + 5));

    stuff.forEach(function (thing) {
      if (stuffStatus[thing.id].compute) {
        equivalentDistance = m2kg.times(thing.mass).sqrt();
        showDistance(thing.id, equivalentDistance);
      }
    });

  }

  var updateDistanceAndForce;

  function eToPowerOf10(bigNumber) {
    return bigNumber.toString().replace("e+", "\\times 10^{") + "}";
  }

  //for (var planet of planets.values()) {
  planets.forEach(function (planet) {
    planet.img.on("click", function () {

      selectedPlanet = planet;
      $("#question-1").hide();
      $(".planet-name").html(planet.name);
      var planetMass = MathJax.Hub.getAllJax("planet-mass")[0];
      MathJax.Hub.Queue(["Text", planetMass , eToPowerOf10(planet.mass)]);
      //$("#planet-mass").html("= \{" + planet.mass + " kg");
      $("html, body").animate({ scrollTop: $("#first-object").offset().top }, 500);
      $("#planets").fadeOut({duration: 1000, complete: function () {
        $(".planet-image").attr({src: planet.img.attr("src")});
        $("#selected-planet").fadeIn({duration: 1000, complete: function () {
          distanceAndForce();
          $(".question-2").fadeIn(250);
          $("#reset-planet").css({visibility: "visible"});
          $("#large-objects").fadeIn(250);
          $("#medium-objects").fadeIn(250);
          $("#large-animals").fadeIn(250);
          $(".show").show();
          $(".more a").show();
          updateDistanceAndForce = setInterval(distanceAndForce, 1000);
        }});
      }});
    });
  });

  $("#reset-planet").on("click", function () {
    clearInterval(updateDistanceAndForce);
    selectedPlanet = undefined;
    $(".planet-name").html("");
    $("#first-distance").remove();
    $("#selected-planet").fadeOut(250);
    $("#reset-planet").css({visibility: "hidden"});
    $(".question-2").fadeOut(250);
    $("#question-1").fadeIn(250);
    $("#planets").fadeIn(250);
    $("#large-objects").fadeOut(250);
    $("#medium-objects").fadeOut(250);
    $("#large-animals").fadeOut(250);
    stuffStatus = resetStuffStatus(stuff);
    $(".show").removeClass("show").addClass("hide");
    $(".hide").hide();
    $("#stuff-1").removeClass("hide").addClass("show");
    $("#stuff-5").removeClass("hide").addClass("show");
    $("#stuff-9").removeClass("hide").addClass("show");
    $(".distance").html("");
    $(".more").show();
  });

  stuff.forEach(function (thing) {
    $("#stuff-" + thing.id + " span.kg").html(string_thousands(thing.mass.toFixed(0)) + " kg");
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
    var compute = stuffStatus[id].compute;
    var container = element.parent();
    if (container.siblings(".show").length == 0 && compute) {
      // if there are no other shown elements in this class of objects, don't allow to hide it
      return;
    }
    stuffStatus[id].compute = !compute; // when turned to true it allows the computation loop to display the distance
    if (compute) {
      hideDistance(id);
      container.removeClass("show").addClass("hide").fadeOut({ duration: 250, complete: function () {
        $("html, body").animate({ scrollTop: container.parent().children(".show").first().offset().top }, 500);
      }});
      container.siblings(".more").find("a").show();
    }
    tagFirstDistance();
  });

  $(".more a").on("click", function () {
    var more = $(this);
    var nextStuff = more.parents("div.objects").children("p.hide:first");
    var nextStuffImage = nextStuff.find("img");
    var id = parseInt(nextStuffImage.data("stuff"), 10);
    stuffStatus[id].visible = true;
    nextStuff.fadeIn(250);
    nextStuff.removeClass("hide").addClass("show");
    $("html, body").animate({ scrollTop: nextStuff.offset().top }, 500);
    if (more.parents("div.objects").children("p.hide:first").length == 0) {
      more.fadeOut(250);
    }
    return false;
  });

  $("#btw-1 a").on("click", function () {
    $("#btw-1").fadeOut({duration: 250, complete: function () {
      var colors = {color: "#ffffff", fontSize: "18px", lineHeight: "22px"};
      $("#btw").css(colors);
      $("#btw a").css(colors);
      $("#btw-2").fadeIn(250);
    }});
    return false;
  });
  $("#btw-2 a").on("click", function () {
    $("#btw-2 a").fadeOut({duration: 250, complete: function () {
      $("#btw-3").fadeIn(250);
    }});
    return false;
  });
  $("#btw-3 a").on("click", function () {
    $("#btw-3 a").fadeOut({duration: 250, complete: function () {
      $("#btw-4").fadeIn(250);
    }});
    return false;
  });
  $("#btw-4 a").on("click", function () {
    $("#btw-4 a").replaceWith("Do you remember that other Newton's law");
    $("#btw-5").fadeIn(250);
    return false;
  });
});
