# TODO LIST Anonymization JS


### CSV class

* readFromCSVFile
	=> DONE

* readFromCSVURL
	- from within browser
	- from NodeJS


### Classes to use...

* SaNGreeA => Main, graph based algorithm
	- knows how to read csv input into graph structure
	- knows how to use perturber
	- knows it's Generalization & Structural cost functions

* CSVInput => Really just the input, puts out Array<string> with all the *required* lines read in
    - knows how to read from filesystem
    - knows how to read from remote URL
        + from within browser
        + from NodeJS environment


* CSVOutput => Really just the output, can
    - write out anonymized CSV
    - write out cleaned CSV
        + write to filesystem
        + just return CSV string


* Equivalence class => Holds attributes and generalization level for each
    - knows about Range / Category
    - can calculate distance from point to cluster
    - can calculate new generalization levels
    - can update internal generalization levels


WE NEED THE RANGE & CATEGORICAL HIERARCHIES EVERYWHERE... where to place them?

* A Hierarchies class? Nope... A hierarchies interface would be better...
    => let's do this the next refactoring round !!!