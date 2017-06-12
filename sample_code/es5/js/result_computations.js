let RESULTS_URL = "http://berndmalle.com:5050/getDBResults";

let TARGET = "marital-status"; // 'education-num', 'income'
let results;

let classifiers = {
    linear_svc: {
      income: {
        bias: 0,
        iml: 0
      },
      marital_status: {
        bias: 0,
        iml: 0
      },
      education_num: {
        bias: 0,
        iml: 0
      }
    },
    logistic_regression: {
      income: {
        bias: 0,
        iml: 0
      },
      marital_status: {
        bias: 0,
        iml: 0
      },
      education_num: {
        bias: 0,
        iml: 0
      }
    },
    random_forest: {
      income: {
        bias: 0,
        iml: 0
      },
      marital_status: {
        bias: 0,
        iml: 0
      },
      education_num: {
        bias: 0,
        iml: 0
      }
    },
    gradient_boosting: {
      income: {
        bias: 0,
        iml: 0
      },
      marital_status: {
        bias: 0,
        iml: 0
      },
      education_num: {
        bias: 0,
        iml: 0
      }
    }
  }

// And invoke the remote Machine Learning Service
var jqxhr = $.ajax({
  type: "GET",
  url: RESULTS_URL,
  contentType: "application/json; charset=utf-8",
  beforeSend: function() {
    // In the meanwhile, set the spinner and waiting text...

    // document.querySelector("#results_json").innerHTML = "<h3> Please be patient... running 4 different classifiers on both datasets, \n 5-fold CV each... this can take a few minutes to compute... </h3>";
    // document.querySelector("#result-plot-img").src = "./img/spinner.gif";
  }
}).done((data, status, jqXHR) => {
  ResultSuccess(data);
}).fail(() => {
    // In the meanwhile, set the spinner and waiting text...

    // document.querySelector("#results_json").innerHTML = "<h3 style='color:red;'> Service call FAILED. Sorry. Please try again later. </h3>";
    // document.querySelector("#result-plot-img").src = "./img/fail.png";
});


function ResultSuccess(data) {
  results = JSON.parse(data).results;
  showResults();
}


function showResults() {
  console.log(`Showing results for target: ${TARGET}`)
  let count = 0;  
  
  for ( let res in results ) {
    let result = results[res];

    if ( result.target === TARGET ) {
      count++;
      let bias = result['results_bias'];
      let iml = result['results_iml'];

      console.log(bias);
    }
  }

  console.log(`Computed ${count} results.`);
}


// Set button functionality
