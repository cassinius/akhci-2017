let RESULTS_URL = "http://berndmalle.com:5050/getDBResults";

let METRIC = "f1"; // "accuracy", "precision", "recall"
let results;

let TARGETS = ["income", "marital-status", "education-num"];
let CLASSIFIERS = ["linear_svc", "logistic_regression", "random_forest", "gradient_boosting"];

let classifier_results = {
    linear_svc: {
      income: {
        bias: 0,
        iml: 0
      },
      'marital-status': {
        bias: 0,
        iml: 0
      },
      'education-num': {
        bias: 0,
        iml: 0
      }
    },
    logistic_regression: {
      income: {
        bias: 0,
        iml: 0
      },
      'marital-status': {
        bias: 0,
        iml: 0
      },
      'education-num': {
        bias: 0,
        iml: 0
      }
    },
    random_forest: {
      income: {
        bias: 0,
        iml: 0
      },
      'marital-status': {
        bias: 0,
        iml: 0
      },
      'education-num': {
        bias: 0,
        iml: 0
      }
    },
    gradient_boosting: {
      income: {
        bias: 0,
        iml: 0
      },
      'marital-status': {
        bias: 0,
        iml: 0
      },
      'education-num': {
        bias: 0,
        iml: 0
      }
    }
  }

function retrieveResults() {
  // And invoke the remote Machine Learning Service

  // fetch(RESULTS_URL)
  //   .then( (response) => {
  //     return response.blob();
  //   })
  //   .then( (blob) => {
  //     let data = JSON.parse(blob);
  //     console.log(data);
  //   });

  var jqxhr = $.ajax({
    type: "GET",
    url: RESULTS_URL,
    contentType: "application/json; charset=utf-8",
    beforeSend: function() {
      CLASSIFIERS.forEach((c) => {
        Plotly.purge(`plot-${c}`);
        document.querySelector(`#plot-${c}`).style.background = "url(./img/spinner2.gif)";
        document.querySelector(`#plot-${c}`).style.backgroundSize = "100% 100%";
      });
    }
  }).done((data, status, jqXHR) => {
    CLASSIFIERS.forEach((c) => {
      document.querySelector(`#plot-${c}`).style.background = "";
    });
    resultSuccess(data);
  }).fail(() => {
      // In the meanwhile, set the spinner and waiting text...

      // document.querySelector("#results_json").innerHTML = "<h3 style='color:red;'> Service call FAILED. Sorry. Please try again later. </h3>";
      // document.querySelector("#result-plot-img").src = "./img/fail.png";
  });
}


function resultSuccess(data) {
  results = JSON.parse(data).results;
  computeResults();
}


function computeResults() {
  console.log(`Showing results for metric: ${METRIC}`)
  let count = 0;
  let class_counts = {
    "income": 0,
    "marital-status": 0,
    "education-num": 0
  }
  
  for ( let res in results ) {
    let result = results[res];
    
    count++;
    class_counts[result.target]++;

    let bias = result['results_bias'];
    let iml = result['results_iml'];

    CLASSIFIERS.forEach((classifier) => {
      classifier_results[classifier][result.target]['bias'] += bias[classifier][METRIC];
      classifier_results[classifier][result.target]['iml'] += iml[classifier][METRIC];
    });
  }

  CLASSIFIERS.forEach((classifier) => {
    TARGETS.forEach((target) => {
      classifier_results[classifier][target]['bias'] /= class_counts[target];
      classifier_results[classifier][target]['iml'] /= class_counts[target];
    });
  });

  // console.log(classifier_results);
  console.log(`Computed ${count} results.`);

  showPlots(class_counts);
}


function showPlots(class_counts) {

  document.querySelector("#income-count").innerHTML = `Income count: ${class_counts["income"]}`;
  document.querySelector("#marital-count").innerHTML = `Marital count: ${class_counts["marital-status"]}`;
  document.querySelector("#education-count").innerHTML = `Education count: ${class_counts["education-num"]}`;

  CLASSIFIERS.forEach(classifier => {
    let bias = {
      x: TARGETS,
      y: [],
      name: 'Bias',
      type: 'bar'
    };
    let iml = {
      x: TARGETS,
      y: [],
      name: 'iML',
      type: 'bar'
    };
    TARGETS.forEach((target) => {
      bias.y.push(classifier_results[classifier][target].bias);
      iml.y.push(classifier_results[classifier][target].iml);
    });

    let data = [bias, iml];
    let layout = {
      barmode: 'group',
      title: `${classifier}`,
      opacity: 0.3
  };
    Plotly.newPlot(`plot-${classifier}`, data, layout);
    Plotly.animate
  });
}


// Set button functionality
document.querySelector("#show-acc").addEventListener('click', (ev) => {
  METRIC = "accuracy";
  retrieveResults();
} );
document.querySelector("#show-precision").addEventListener('click', (ev) => {
  METRIC = "precision";
  retrieveResults();
} );
document.querySelector("#show-recall").addEventListener('click', (ev) => {
  METRIC = "recall";
  retrieveResults();
} );
document.querySelector("#show-f1").addEventListener('click', (ev) => {
  METRIC = "f1";
  retrieveResults();
} );