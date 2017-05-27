let socket = io.connect('http://berndmalle.com:5000');
let NR_RESULTS = undefined;
let current_results = 0;


socket.on('connect', function() {
  console.log('Socket.io CONNECTED...');
});


socket.on('computationStarted', (data) => {
  console.log("Computation started signal received.");
  
  NR_RESULTS = data.nr_intermediary_results;
  console.log(`Expecting ${NR_RESULTS} intermediary results.`);

  document.querySelector("#results_json").innerHTML = "<h3> Please be patient... running 4 different classifiers on both datasets, \n 5-fold CV each... this can take a few minutes to compute... </h3>";
  document.querySelector("#result-plot-img").src = "./img/spinner.gif";
});


socket.on('intermediaryComputed', (data) => {
  // console.log(data.result);
  let progress_width = ++current_results / NR_RESULTS;
  // console.log(`New progress bar width: ${progress_width}`);
  document.querySelector("#progress-bar-inner").style.width = `${progress_width*100}%`;

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
});


/**
 * Let's send our request via Sockets
 */
function sendToRestAPI(data) {
  socket.emit('computeMLResults', {request: data});
}
