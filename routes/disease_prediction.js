
/*
 * GET model_prediction listing.
 */

var disease_predictions = add_ids({
  "CauC_deliver_2220122_obesity": {
    "patient_id": "CauC_deLiver_2220122",
    "model_id": "obesity_1",
    "risk": 0.5
  }, 
  "CauC_deliver_2220107_obesity" : {
    "model_id": "obesity_1",
    "patient_id": "CauC_deLiver_2220107",
    "risk": 0.5
  }
})

exports.list = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.send({ 'disease_predictions': to_a(disease_predictions) });
};

exports.get = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send({ 'disease_prediction': disease_predictions[0] })
}
