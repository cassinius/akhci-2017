let socket = io.connect('http://localhost:5000');

let NR_RESULTS = undefined;
let current_results = 0;

socket.on('connect', function() {
  console.log('Socket.io CONNECTED...');
});

socket.on('computationStarted', (data) => {
  console.log("Computation started signal received.");
  console.log(data);
  NR_RESULTS = data.nr_intermediary_results;
});

socket.on('intermediaryComputed', (data) => {
  console.log(data.result);
  let progress_width = current_results++ / NR_RESULTS;
  document.querySelector("#progress-bar-inner").style.width = `${progress_width}%`
});


/**
 * Let's send our request via Sockets
 */
function sendToRestAPI(data) {
  socket.emit('computeMLResults', {request: data});
}