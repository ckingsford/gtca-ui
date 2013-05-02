
/*
 * GET drugs listing.
 */
var drugs = [ { id: 1, name: "Warfarin" }, { id: 2, name: "Heparin" } ];

exports.list = function(req, res){
  var q = req.query.q ? req.query.q.toLowerCase() : ""

  var results = []
  drugs.forEach(function(drug, i, array) {
    var name = drug.name.toLowerCase();
    if (name.slice(0, q.length) == q) {
      results.push(drug);
    }
  });
  res.send(results);
};
