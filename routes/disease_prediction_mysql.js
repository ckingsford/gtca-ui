
/*
 * GET model_prediction listing.
 */

var fake_disease_predictions = add_ids({
  "CauC_deliver_2220122_obesity_1": {
    "patient_id": "CauC_deLiver_2220122",
    "model_id": "obesity_1",
    "risk": 0.5
  }, 
  "CauC_deliver_2220107_obesity_1" : {
    "model_id": "obesity_1",
    "patient_id": "CauC_deLiver_2220107",
    "risk": 0.5
  }
})

exports.list = function(req, res){
  console.log("disease_prediction_mysql.list:" + req.query["patient_id"] + " & "+req.query["model_id"]);
  var patient_id = req.query["patient_id"];
  var model_id = req.query["model_id"];
  var version = 1;
  if (model_id != null) version = model_id.split("_")[1];
  if (patient_id == null) patient_id = "CauC_deliver_2220122";
  if (model_id == null) model_id = "obesity_1";
  console.log("requested patient_id:" + patient_id);
  console.log("requested model_id:" + model_id);
  console.log("requested version:" + version);


  var mysql = require('mysql');
  var connection = mysql.createConnection('mysql://web_readonly:r3adOn!yUs3r@expression.ml.cmu.edu/life');
  connection.query('SELECT cvPercent from AnalysisDetails where analysisId = ' + version + ' limit 1', function(err, rows, fields) { //selecting cvPercent just for testing
      if (err) throw err;
      mysql_results = rows[0];
      
      id = patient_id + "_" + model_id;

      var factorIds = [];
      var factors = [];
      var len = 2;
      for (var i = 0; i < len; i++) {
          var factorId = "factor"+i;
          var obj = {
              id: factorId,
              name: factorId,
              kind: "DNA",
              effect: 0.5,
              diseasePrediction: id
          };
          factorIds.push(factorId);
          factors.push(obj);
      } 
      
      var disease_predictions = {
        id:{ //
          "patient_id" : patient_id,
          "model_id" : model_id,
          "risk" : mysql_results.cvPercent, //limited to only one at the moment
        //  "id" : "CauC_deliver_2220122_obesity_1"
        //  "factors" : factorIds,
          }
        }
      
   // console.log("real");
   // console.log(disease_predictions);
    
    res.setHeader('Content-Type', 'application/json');
    // var tosend = { 'disease_predictions': to_a(fake_disease_predictions)}; //an array although theoretically it should be only one result
    /*var toSend = { 
        'disease_predictions': to_a(disease_predictions),
        'factors' : 
    };
    */
    var toSend = {'disease_predictions': to_a(disease_predictions)};
    console.log(toSend);
    res.send(toSend); 
  });
  connection.end();
};





exports.get = function(req, res) {      
  console.log("disease_prediction_mysql.get:" + req.query["patient_id"] + " & "+req.query["model_id"]);
  var patient_id = req.query["patient_id"];
  var model_id = req.query["model_id"];
  var version = 1;
  if (model_id != null) version = model_id.split("_")[1];
  if (patient_id == null) patient_id = "CauC_deliver_2220122";
  if (model_id == null) model_id = "obesity_1";
  console.log("requested patient_id:" + patient_id);
  console.log("requested model_id:" + model_id);
  console.log("requested version:" + version);


  var mysql = require('mysql');
  var connection = mysql.createConnection('mysql://web_readonly:r3adOn!yUs3r@expression.ml.cmu.edu/life');
  connection.query('SELECT cvPercent from AnalysisDetails where analysisId = ' + version + ' limit 1', function(err, rows, fields) { //selecting cvPercent just for testing
      if (err) throw err;
      mysql_results = rows[0];
      
      id = patient_id + "_" + model_id;

      var factorIds = [];
      var factors = [];
      var len = 2;
      for (var i = 0; i < len; i++) {
          var factorId = "factor"+i;
          var obj = {
              id: factorId,
              name: factorId,
              kind: "DNA",
              effect: 0.5,
              diseasePrediction: id
          };
          factorIds.push(factorId);
          factors.push(obj);
      } 
      
      var disease_prediction = {
        id:{ //
          "patient_id" : patient_id,
          "model_id" : model_id,
          "risk" : mysql_results.cvPercent, //limited to only one at the moment
        //  "id" : "CauC_deliver_2220122_obesity_1"
          "factors" : factorIds,
          }
        }
      
   // console.log("real");
   // console.log(disease_predictions);
    
    res.setHeader('Content-Type', 'application/json');
    // var tosend = { 'disease_predictions': to_a(fake_disease_predictions)}; //an array although theoretically it should be only one result
    /*var toSend = { 
        'disease_predictions': to_a(disease_predictions),
        'factors' : 
    };
    */
    var toSend = {'disease_prediction': disease_prediction};
    console.log(toSend);
    res.send(toSend); 
  });
  connection.end();
}
