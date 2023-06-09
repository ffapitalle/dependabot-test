### **Project to run performance tests with K6**

#### **Execution**
This project allows running a k6 script, showing the results on the K6 dashboard in Datadog at [performance-test-k6](https://p.datadoghq.com/sb/7e51cb5de-ba19f7f884f4cf9afe55dfb1d98df8d5), filtering by test_run_id with the name of the script.

The scripts and data sets (in .csv format) must be made available in the **script** folder of the repo.

#### **K6 demo script**
Script directory where the defined script and the data set must be added. It currently contains a defined K6 demo script that includes common functionalities examples to use such as:

  + Consumption of csv data sets with use of the papaparse library.      
  + Format to define Ramp-up in stages.   
  + Multi-scenario usage format.  
  + Time to think.
  + Post and get request generation format.
  + Format to define custom metrics through the examples of error rate, waiting time.      
  + Definition of thresholds to evaluate the success of the test.
  + Request metric checks to evaluate its success.  
  + Performance optimization from only reading the responses that need to be parsed.

##### **Integration with Datadog.**
This project identifies in which environment you are working and sends the results to the Datadog agent of the corresponding environment.