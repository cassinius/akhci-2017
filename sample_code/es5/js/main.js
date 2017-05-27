console.log("AnonymizationJS:");
console.dir($A);

console.log("GraphiniusJS:");
console.dir($G);


let TARGETS = [
  "target_marital-status",
  "target_education-num",
  "target_income"
];
let filename = "original_data_500_rows.csv";
let anonym_file = "adults_anonymized_k3_equal.csv";
// Host
let basename = "/akhci-sample-data/00_sample_data_UI_prototype";
let url = basename + "/" + TARGETS[1] + "/" + filename;

// Remote Machine Learning Service 
// let ML_URL = "http://localhost:5000/anonML";
// let ML_URL = "http://berndmalle.com:5000/anonML";
// console.log(`Remote ML Service: ${ML_URL}`);

let csvIn = new $A.IO.CSVIN($A.config.adults);
// console.log("CSV Reader: ");
// console.log(csvIn);


// Instantiate a SaNGreeA object
// NOTE: The config should be instantiated by the User Interface,
// the internal $A.config... was only for testing!
let config = $A.config.adults;
config['GEN_WEIGHT_VECTORS']['equal'] = {
    'categorical': {
        'workclass': 1.0/13.0,
        'native-country': 1.0/13.0,
        'sex': 1.0/13.0,
        'race': 1.0/13.0,
        'marital-status': 1.0/13.0,
        'relationship': 1.0/13.0,
        'occupation': 1.0/13.0,
        // 'income': 1.0/13.0
    },
    'range': {
        'age': 1.0/13.0,
        'education-num': 1.0/13.0,
        'hours-per-week': 1.0/13.0
    }
}
config['TARGET_COLUMN'] = 'income';
console.log("SaNGreeA config:");
console.log(config);


// of course we can overwrite the settings locally
config.NR_DRAWS = 500; // max for this file...
config.K_FACTOR = 7;

let san = new $A.algorithms.Sangreea("testus", config);
console.log("SaNGreeA Algorithm:");
console.log(san);


// Inspect the internal graph => should be empty
console.log("Graph Stats BEFORE Instantiation:");
console.log(san._graph.getStats());


// Specify Generalization hierarchy files
let gen_base = '/akhci-sample-data/genHierarchies/',
    workclass_file = gen_base + 'workclassGH.json',
    sex_file = gen_base + 'sexGH.json',
    race_file = gen_base + 'raceGH.json',
    marital_file = gen_base + 'marital-statusGH.json',
    nat_country_file = gen_base + 'native-countryGH.json',
    relationship_file = gen_base + 'relationshipGH.json',
    occupation_file = gen_base + 'occupationGH.json',
    income_file = gen_base + 'incomeGH.json';

// Uff, this feels like 2012 at the latest....
$.ajaxSetup({
    async: false
});

// Load Generalization hierarchies
[workclass_file, nat_country_file, sex_file, race_file, marital_file,
  relationship_file, occupation_file].forEach((file) => { // , income_file
  var json = $.getJSON(file).responseText;
  // console.log(json);
  strgh = new $A.genHierarchy.Category(json);
  san.setCatHierarchy(strgh._name, strgh);
});

$.ajaxSetup({
    async: true
});

// Remotely read the original data and anonymize
csvIn.readCSVFromURL(url, function(csv) {
  console.log("File URL ANON: " + url);
  console.log("File length ANON in total rows:");
  console.log(csv.length);
  console.log("Headers:")
  console.log(csv[0]);
  console.log(csv[1]);

  san.instantiateGraph(csv, false );
  // Inspect the internal graph again => should be populated now
  console.log("Graph Stats AFTER Instantiation:");
  console.log(san._graph.getStats());

  // let's run the whole anonymization inside the browser
  san.anonymizeGraph();

  // let's take a look at the clusters
  console.dir(san._clusters);

  sampleCostCalculation(san);

  // get the anonymized dataset as csv string
  let csv_result = san.constructAnonymizedCSV();

  // Build the request data
  // !!! DO NOT JSON STRINGIFY FOR SOCKET COMMUNICATION !!!
  // !!! THIS RESULTED IN A SPURIOUS SAME-ORIGIN-POLICY ERROR !!!
  let request_data = {
    "grouptoken": "string",
    "usertoken": "string",      
    "weights": {
      "bias": {
        "age": 0.37931034482758613,
        "education-num": 0.0689655172413793,
        "hours-per-week": 0.0689655172413793,
        "workclass": 0.0689655172413793,
        "native-country": 0.0689655172413793,
        "sex": 0.0689655172413793,
        "race": 0.0689655172413793,
        "relationship": 0.0689655172413793,
        "occupation": 0.0689655172413793,
        "marital-status": 0.0689655172413793
      },
      "iml": {
        "age": 0.13704865909390093,
        "education-num": 0.14385388791553647,
        "hours-per-week": 0.1279067106608888,
        "workclass": 0.11057201781371723,
        "native-country": 0.11958109916626228,
        "sex": 0.0958123676325629,
        "race": 0.12552706039834438,
        "relationship": 0.074162197318787,
        "occupation": 0.032768000000000005,
        "marital-status": 0.032768000000000005
      }
    },
    "csv": {
      "bias": csv_result,
      "iml": csv_result
    },
    "target": config['TARGET_COLUMN'],
    // ===== OPTIONAL =====
    "user": {
      "token": "NjY6W29iamVjdCBPYmplY3RdOjE0OTU0NDI1NTI4MDk6dW5kZWZpbmVk",
      "education": {
        "id": 1,
        "description": "secondary modern school"
      },
      "age": 66,
      "username": "Anonym"
    },
    "survey": {
      "sid": 2,
      "target_column": "income",
    }
  };
  

  /**
   * And invoke the remote Machine Learning Service via Sockets
   */
  sendToRestAPI(request_data);

  /**
   * Or via traditional jquery AJAX request
   */
  // var jqxhr = $.ajax({
  //   type: "POST",
  //   url: ML_URL,
  //   data: request_data,
  //   contentType: "application/json; charset=utf-8",
  //   // dataType: "application/json; charset=utf-8",
  //   beforeSend: function() {
  //     // In the meanwhile, set the spinner and waiting text...
  //     document.querySelector("#results_json").innerHTML = "<h3> Please be patient... running 4 different classifiers on both datasets, \n 5-fold CV each... this can take a few minutes to compute... </h3>";
  //     document.querySelector("#result-plot-img").src = "./img/spinner.gif";
  //   }
  // }).done((data, status, jqXHR) => {
  //   MLSuccess(data);
  // }).fail(() => {
  //     // In the meanwhile, set the spinner and waiting text...
  //     document.querySelector("#results_json").innerHTML = "<h3 style='color:red;'> Service call FAILED. Sorry. Please try again later. </h3>";
  //     document.querySelector("#result-plot-img").src = "./img/fail.png";
  // });
});


function MLSuccess(data) {
  console.log("SUCCESS result from server:");
  let result_obj = JSON.parse(data);
  console.log(result_obj);

  document.querySelector("#results_json").innerHTML = JSON.stringify(result_obj, undefined, 2);
  document.querySelector("#result-plot-img").src = result_obj.plotURL;
}


function sampleCostCalculation(san) {
  // Compute costs between some Cluster and some node
  let cluster = selectRandomCluster(san._clusters);
  let node = san._graph.getRandomNode();

  function selectRandomCluster(clusters) {
    return clusters[Math.floor(Math.random()*clusters.length)];
  }

  console.log("\n Computing cost of generalization between cluster and node:");
  console.log(cluster);
  console.log(node);
  console.log("Cost: " + san.calculateGIL(cluster, node));
}