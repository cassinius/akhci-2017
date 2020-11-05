# Workflow: interactive Machine Learning (iML) - Anonymization Experiments


## Overall goals

1. Get a feeling for how user input (common sense heuristics) improve a ML algorithm's (classifier) performance on anonymized datasets.
2. Get a feeling for how strongly user choices should influence the ML algorithm during operation.
3. Compare user bias with iML user behavior
    a. before iML: query the user's bias ("which columns are important in what order...?") => gives you weight vector 1
    b. perform the example-based iML loop => gives you weight vector 2
    c. compare the 2 resulting weight vectors


## Inputs

* One CSV
    - Adult dataset (US census data of 1994)
    - I will provide a modified version
* One target column / study goal
    - income (binary: <=50k | >50k)
    - education (grouped into 4 levels)
    - marital-status (original categorization)
* A target anonymization level
    - which you can choose yourself, realistic values are between 3 and 7 (this will affect your workflow choice later)
* The AnonymizationJS library
    - installable as NPM module


## Workflow

### Phase 1

1. present the user with a choice of input weighs
    - best with sliders (recompute all values on change)
2. user sets sliders manually => directly yielding a weight vector
    - start anonymizing the sample DS with this weight vector (in the background)

### Phase 2

1. Start modified anonymization algorithm
    - e.g. take xy%(e.g. =50%/80%) of all data points and create clusters of size i(e.g. =2)
    - leave the rest of the data points as pool for user presentation
2. choose 2 clusters and 1 data point randomly
3. present decision to user and gather their feedback
    - best implement it with drag'n'drop
    - on hovering the data-row over one of the clusters:
        + highlight the generalized columns (provided by the library API)
        + display the adapted weight vector
        + (optional) display generalization cost (just for us at the moment)
4. adapt weight vectors accordingly
    - we will come up with a right formula together, just start with some arbitrary re-computation
    - this adaptation formula is Goal Nr. 2
5. either
    a. present a few more examples on this level - or -
    b. let the algorithm use the adapted weight vector to continue clustering to size i+1
    - repeat from step 2. 
        + do this for 20 or 30 examples 
        + choose 5a. or 5b. so that you arrive at your target k-factor(e.g. =7)

### Phase 3

1. Call a Web service which I will provide
    - send the anonymized datasets (bias / iML)
    - Web service calls ML classifier on datasets
2. Receive 3 ML results
    - aML vs. bias vs. iML
    - precision, recall, F1 score
3. Visualize Results for comparison


## Outputs

* Two weight vectors (Goal Nr. 3)
    - bias
    - iML
* Anonymized datasets (Intermediary result)
    - bias
    - iML
* ML result visualization (Goal Nr. 1) => with a library of your choice
    - aML
    - bias
    - iML


## For UI prototype, April 3rd

* Come up with a few (half-)anonymized clusters and candidate data-rows on your own
    - based on the adult dataset I provide
* Already implement the drag-drop behavior
    - for Angula, the dragula library is nice and has a lot of lifecycle events.. but your choice
* Implement the highlighting / ( weight vector | cost computation ) visualization on hover
    - just use the library API, which I will prepare ASAP now
    - optionally, just highlight / display some values randomly ;)
