"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let lesgoButton = document.getElementById("btn");
lesgoButton === null || lesgoButton === void 0 ? void 0 : lesgoButton.addEventListener("click", buttonAlert);
let holeButton = document.getElementById("btn1");
holeButton === null || holeButton === void 0 ? void 0 : holeButton.addEventListener("click", holeCoordButton);
// --- bang operator '!' added to signify confidence to typescript that a given variable will definitely have its assigned value
const latValue = document.getElementById("lat");
const longValue = document.getElementById("long");
const ipAddress = document.getElementById("ipAddress");
const distanceFromHole = document.getElementById("distanceFromHole");
// --- temporary list of coordinates and distance per hole
let coordinatePair;
let coordinateArray = [];
let totalDistance = 0;
// --- overall permenant list of distances and stroke number for each hole
const holeCoordArray = [];
// --- overall list of all the lat long coordinates of each hole, to check which hole to measure distance by, can reference length of holeCoordArray: number[][], manually determined by user
const locationOfHoleArray = [[1.361889, 103.820791], [1.360568, 103.820025], [1.361878, 103.824167], [1.361934, 103.821043], [1.365464, 103.826690]];
function buttonAlert() {
    getData("https://api.ipify.org?format=json");
    console.log("-----shit divider-----");
    // --- geolocation API to determine current lat long
    if ("geolocation" in navigator) { // can also be if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition((position) => {
            let latReturned = position.coords.latitude;
            let longReturned = position.coords.longitude;
            console.log(latReturned, longReturned);
            // --- setting the current lat long values on the screen
            latValue.innerHTML = `Current <span style="color:darksalmon">Latitude</span>: ${latReturned}`;
            longValue.innerHTML = `Current <span style="color:darkorange">Longtidude</span>: ${longReturned}`;
            // --- adding each lat long coordinate pair to a new array
            coordinatePair = [latReturned, longReturned];
            coordinateArray.push(coordinatePair);
            updateTable(coordinateArray);
            updateDistanceFromHole(latReturned, longReturned);
        }, (errorLog) => {
            console.log(errorLog);
            console.log("Geolocation temporarily unavailable");
            alert("Geolocation temporarily unavailable");
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 60000,
        });
    }
}
// --- scuffed ass way to add last added coordinate pair to table dynamically, NOTE that this does not redraw the table every single time
function updateTable(coordinateArray) {
    console.log(coordinateArray);
    const coordinateTable = document.getElementById("coordTable");
    let row = coordinateTable.insertRow();
    let cell = row.insertCell();
    cell.innerText = `${coordinateArray.length}`;
    cell = row.insertCell();
    cell.innerText = `${coordinateArray[coordinateArray.length - 1][0]}`;
    cell = row.insertCell();
    cell.innerText = `${coordinateArray[coordinateArray.length - 1][1]}`;
    cell = row.insertCell();
    if (coordinateArray.length >= 2) {
        cell.innerText = `${calculateDistanceLatLongCoordinates(coordinateArray[coordinateArray.length - 2][0], coordinateArray[coordinateArray.length - 2][1], coordinateArray[coordinateArray.length - 1][0], coordinateArray[coordinateArray.length - 1][1])} m`;
        totalDistance += calculateDistanceLatLongCoordinates(coordinateArray[coordinateArray.length - 2][0], coordinateArray[coordinateArray.length - 2][1], coordinateArray[coordinateArray.length - 1][0], coordinateArray[coordinateArray.length - 1][1]);
    }
    else {
        cell.innerText = "nil";
    }
}
// --- creates and updates the overall hole coordinate array
function holeCoordButton() {
    holeCoordArray.push([coordinateArray.length, totalDistance]);
    updateHoleCoordTable(holeCoordArray);
    coordinateArray = [];
    totalDistance = 0;
}
// --- scuffed ass way to update overall distance table dynamically
function updateHoleCoordTable(holeCoordArray) {
    const holeCoordTable = document.getElementById("holeCoordTable");
    let row = holeCoordTable.insertRow();
    let cell = row.insertCell();
    cell.innerText = `${holeCoordArray.length}`;
    cell = row.insertCell();
    cell.innerText = `${holeCoordArray[holeCoordArray.length - 1][0]}`;
    cell = row.insertCell();
    cell.innerText = `${holeCoordArray[holeCoordArray.length - 1][1]}`;
}
// --- function that updates the value of the current location from the next hole
function updateDistanceFromHole(currentLocationLat, currentLocationLong) {
    const targetHoleLat = locationOfHoleArray[holeCoordArray.length][0];
    const targetHoleLong = locationOfHoleArray[holeCoordArray.length][1];
    const finalDistance = calculateDistanceLatLongCoordinates(currentLocationLat, currentLocationLong, targetHoleLat, targetHoleLong);
    distanceFromHole.innerText = `Distance from Hole #${holeCoordArray.length + 1}: ${finalDistance} m`;
}
// --- function to call different web APIS
function getData(targetUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(targetUrl);
        const data = yield response.json();
        ipAddress.innerHTML = `We have your <span style="color:blueviolet">IP address</span>: ${data["ip"]}`;
    });
}
// --- function to determine the distance between 2 pairs of lat long coordinates
function calculateDistanceLatLongCoordinates(lat1, long1, lat2, long2) {
    const radiusEarth = 6371; // km
    let diffLat = degreesToRadian(lat2 - lat1);
    let diffLong = degreesToRadian(long2 - long1);
    let a = Math.sin(diffLat / 2) * Math.sin(diffLat / 2) + Math.cos(degreesToRadian(lat1)) * Math.cos(degreesToRadian(lat2)) * Math.sin(diffLong / 2) * Math.sin(diffLong / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radiusEarth * c * 1000; // m
}
function degreesToRadian(deg) {
    return deg * (Math.PI / 180);
}
