let socketUrl = 'http://localhost:5000';
// let socketUrl = 'http://berndmalle.com:5000';
var options = {
               "forceNew": true,
              //  "reconnect": false,
               "connectTimeout": Number.POSITIVE_INFINITY,
              //  "flash policy port": 843,
               "auto connect": true,
              //  "path":"/sample/socket.io",
              "transports":["websocket"], // ["websocket", "polling"]
              "reconnectionDelayMax": 60000,
               // And most importantly:
               "timeout": Number.POSITIVE_INFINITY,
               "requestTimeout": Number.POSITIVE_INFINITY,
              //  "forceJSONP": true,
              "upgrade": true,
              "pingInterval": 60000,
              "pingTimeout": Number.POSITIVE_INFINITY
              };
let socket = io(socketUrl);

let NR_RESULTS = undefined;
let current_results = 0;


socket.on('connect', function() {
  console.log('Socket.io CONNECTED...');

  socket.on('computationStarted', (data) => {
    console.log("Computation started signal received.");
    
    NR_RESULTS = data.nr_intermediary_results;
    console.log(`Expecting ${NR_RESULTS} intermediary results.`);

    document.querySelector("#results_json").innerHTML = "<h3> Please be patient... running 4 different classifiers on both datasets, \n 5-fold CV each... this can take a few minutes to compute... </h3>";
    document.querySelector("#result-plot-img").src = "./img/spinner.gif";
  });


  socket.on('intermediaryComputed', (data) => {
    console.log(data.result);

    let progress_percentage = `${Math.round(++current_results / NR_RESULTS *100)}%`;
    // console.log(`New progress bar width: ${progress_width}`);
    document.querySelector("#progress-bar-inner").style.width = progress_percentage;
    document.querySelector("#progress-percentage").innerHTML = progress_percentage;

    let report_string = `<h3> Intermediate result from ${data.result.algorithm} (F1 Score): ${data.result.f1} </h3>`;
    document.querySelector("#progress-update").innerHTML = report_string;
  });


  socket.on('computationCompleted', (data) => {
    console.log("SUCCESS result from server:");
    let result_obj = data.overall_results;
    console.log(result_obj);

    document.querySelector("#results_json").innerHTML = JSON.stringify(result_obj, undefined, 2);
    document.querySelector("#result-plot-img").src = result_obj.plotURL;
    document.querySelector("#progress-bar-outer").style = "display: none;";
    document.querySelector("#progress-update").style = "display: none;";

    // Close the connection
    socket.close();
  });


  socket.on('error', function (err) {
    document.querySelector("#results_json").innerHTML = "<h3 style='color:red;'> Service call FAILED. Sorry. Please try again later. </h3>";
    document.querySelector("#result-plot-img").src = "./img/fail.png";
    
    if (err.description) 
      throw err.description;
    else 
      throw err; // Or whatever you want to do
  });

});






/**
 * Let's send our request via Sockets
 */
function sendToRestAPI(data) {
  socket.emit('computeMLResults', {request: data});
}
