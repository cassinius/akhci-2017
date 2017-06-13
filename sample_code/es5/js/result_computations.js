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
  // Unset plots & show spinners
  setPlotRectBGImage('spinner2.gif');

  // And invoke the remote Machine Learning Service
  fetch(RESULTS_URL)  
    .then(  
      function(response) {  
        if (response.status !== 200) {  
          console.log('Looks like there was a problem. Status Code: ' + response.status);
          setCountSectionText("n/a", "n/a", "n/a", "n/a");
          setPlotRectBGImage('fail.png');
          return;
        }
        // Examine the text in the response  
        response.json().then(function(data) {
          // console.log(data);
          results = data.results;
          setPlotRectBGImage('');
          computeResults();
        });
      }  
    )  
    .catch(function(err) {  
      console.log('Fetch Error :-S', err);
      setCountSectionText("n/a", "n/a", "n/a", "n/a");
      setPlotRectBGImage('fail.png');
    });
}


function setPlotRectBGImage(img) {
  let image = img ? `url(./img/${img})` : '';
  CLASSIFIERS.forEach((c) => {
    Plotly.purge(`plot-${c}`);
    document.querySelector(`#plot-${c}`).style.background = image;
    document.querySelector(`#plot-${c}`).style.backgroundSize = "100% 100%";
  });
}


function resultSuccess(data) {
  results = JSON.parse(data).results;
  computeResults();
}


function computeResults() {
  console.log(`Showing results for metric: ${METRIC}`)
  let result_count = 0;
  let class_counts = {
    "income": 0,
    "marital-status": 0,
    "education-num": 0
  }
  
  for ( let res in results ) {
    let result = results[res];
    
    result_count++;
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
  console.log(`Computed ${result_count} results.`);

  showPlots(result_count, class_counts);
}


function setCountSectionText(all, income, marital, education) {
  document.querySelector("#experiment-count").innerHTML = `Experiment count: ${all}`;
  document.querySelector("#income-count").innerHTML = `Income: ${income}`;
  document.querySelector("#marital-count").innerHTML = `Marital Status: ${marital}`;
  document.querySelector("#education-count").innerHTML = `Education Num: ${education}`;
}


function showPlots(result_count, class_counts) {

  setCountSectionText(result_count, class_counts["income"], class_counts["marital-status"], class_counts["education-num"]);

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
  unsetAllActiveButtons();
  document.querySelector("#show-acc").classList.add('active');
  retrieveResults();
} );
document.querySelector("#show-precision").addEventListener('click', (ev) => {
  METRIC = "precision";
  unsetAllActiveButtons();
  document.querySelector("#show-precision").classList.add('active');
  retrieveResults();
} );
document.querySelector("#show-recall").addEventListener('click', (ev) => {
  METRIC = "recall";
  unsetAllActiveButtons();
  document.querySelector("#show-recall").classList.add('active');
  retrieveResults();
} );
document.querySelector("#show-f1").addEventListener('click', (ev) => {
  METRIC = "f1";
  unsetAllActiveButtons();
  document.querySelector("#show-f1").classList.add('active');
  retrieveResults();
} );


function unsetAllActiveButtons() {
  document.querySelectorAll(".button").forEach( (el) => el.classList.remove('active') );
}