let lesgoButton = document.getElementById("btn");
lesgoButton?.addEventListener("click", buttonAlert);

let holeButton = document.getElementById("btn1");
holeButton?.addEventListener("click", holeCoordButton);

// --- bang operator '!' added to signify confidence to typescript that a given variable will definitely have its assigned value
const latValue = document.getElementById("lat")!;
const longValue = document.getElementById("long")!;

const ipAddress = document.getElementById("ipAddress")!;

const distanceFromHole = document.getElementById("distanceFromHole")!;

// --- temporary list of coordinates and distance per hole
let coordinatePair: number[];
let coordinateArray: number[][] = [];
let totalDistance: number = 0;

// --- overall permenant list of distances and stroke number for each hole
const holeCoordArray: number[][] = [];

// --- overall list of all the lat long coordinates of each hole, to check which hole to measure distance by, can reference length of holeCoordArray: number[][], manually determined by user
const locationOfHoleArray: number[][] = [[1.361889,103.820791],[1.360568,103.820025],[1.361878,103.824167],[1.361934,103.821043],[1.365464,103.826690]];

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
        }, (errorLog: GeolocationPositionError) => {
            console.log(errorLog);
            console.log("Geolocation temporarily unavailable");
            alert("Geolocation temporarily unavailable");
        }, 
        { 
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 60000,
        }
    );
    }
}

// --- scuffed ass way to add last added coordinate pair to table dynamically, NOTE that this does not redraw the table every single time
function updateTable(coordinateArray:number[][]) {
    console.log(coordinateArray);

    const coordinateTable = document.getElementById("coordTable") as HTMLTableElement;
    let row = coordinateTable.insertRow();
    let cell = row.insertCell();
    cell.innerText=`${coordinateArray.length}`;
    cell = row.insertCell();
    cell.innerText=`${coordinateArray[coordinateArray.length -1][0]}`;
    cell = row.insertCell();
    cell.innerText=`${coordinateArray[coordinateArray.length -1][1]}`;
    cell = row.insertCell();
    if (coordinateArray.length >= 2) {
        cell.innerText=`${calculateDistanceLatLongCoordinates(coordinateArray[coordinateArray.length -2][0], coordinateArray[coordinateArray.length -2][1], coordinateArray[coordinateArray.length -1][0], coordinateArray[coordinateArray.length -1][1])} m`;
        totalDistance += calculateDistanceLatLongCoordinates(coordinateArray[coordinateArray.length -2][0], coordinateArray[coordinateArray.length -2][1], coordinateArray[coordinateArray.length -1][0], coordinateArray[coordinateArray.length -1][1]);
    } else {
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
function updateHoleCoordTable(holeCoordArray:number[][]) { 
    const holeCoordTable = document.getElementById("holeCoordTable") as HTMLTableElement;
    let row = holeCoordTable.insertRow();
    let cell = row.insertCell();
    cell.innerText=`${holeCoordArray.length}`;
    cell = row.insertCell();
    cell.innerText=`${holeCoordArray[holeCoordArray.length - 1][0]}`;
    cell = row.insertCell();
    cell.innerText=`${holeCoordArray[holeCoordArray.length -1][1]}`;
}

// --- function that updates the value of the current location from the next hole
function updateDistanceFromHole(currentLocationLat:number, currentLocationLong:number) {
    const targetHoleLat:number = locationOfHoleArray[holeCoordArray.length][0];
    const targetHoleLong:number = locationOfHoleArray[holeCoordArray.length][1];
    const finalDistance:number = calculateDistanceLatLongCoordinates(currentLocationLat, currentLocationLong, targetHoleLat, targetHoleLong);
    distanceFromHole.innerText = `Distance from Hole #${holeCoordArray.length+1}: ${finalDistance} m`;
}


// --- function to call different web APIS
async function getData (targetUrl:string) {
    const response = await fetch(targetUrl);
    const data = await response.json();
    ipAddress.innerHTML = `We have your <span style="color:blueviolet">IP address</span>: ${data["ip"]}`;
}

// --- function to determine the distance between 2 pairs of lat long coordinates
function calculateDistanceLatLongCoordinates(lat1:number, long1:number, lat2:number, long2:number):number {
    const radiusEarth: number = 6371; // km
    let diffLat: number = degreesToRadian(lat2 - lat1);
    let diffLong: number = degreesToRadian(long2 - long1);
    let a = Math.sin(diffLat/2) * Math.sin(diffLat/2) + Math.cos(degreesToRadian(lat1)) * Math.cos(degreesToRadian(lat2)) * Math.sin(diffLong/2) * Math.sin(diffLong/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return radiusEarth * c * 1000; // m
}

function degreesToRadian(deg:number) {
    return deg * (Math.PI/180);
}
