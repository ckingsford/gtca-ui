
/*
 * GET patients listing.
 */

var patients = add_ids({
  "CauC_deLiver_2220122": {"name":"John Doe","age":25,"gender":"M","weight":170,"height":180},
  "CauC_deLiver_2220107": {"name":"Rebecca Black","age":15,"gender":"F","weight":115,"height":155},
  "CauC_deLiver_1110043": {"name":"Kevin Bacon","age":54,"gender":"M","weight":170,"height":179},
  "CauC_deLiver_3330131": {"name":"Jeremy Lin","age":24,"gender":"M","weight":200,"height":191},
  "CauC_deLiver_2220019": {"name":"Lucy Smith","age":35,"gender":"F","weight":150,"height":163},
  "CauC_deLiver_1110455": {"name":"Billy Bob","age":25,"gender":"M","weight":250,"height":165},
})

exports.list = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.send({ "patients": to_a(patients) }) 
};

exports.get = function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  var patient = patients[req.params.id]
  res.send({ "patient": patient });
}
