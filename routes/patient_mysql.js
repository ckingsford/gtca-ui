//npm install mysql@2.0.0-alpha7
//https://github.com/felixge/node-mysql


exports.get = function(req, res) {
	console.log("patient_mysql.get");
	console.log("requested id:" + req.params.id);
	var mysql = require('mysql');
	var connection = mysql.createConnection('mysql://web_readonly:r3adOn!yUs3r@expression.ml.cmu.edu/life');
	connection.query('SELECT * from PatientAccount where id = "' + req.params.id + '" limit 1', function(err, rows, fields) {
	  	if (err) throw err;
	  	var mysql_results = rows[0]; //interested only in one patient
	  	res.setHeader('Content-Type', 'application/json');
		console.log('Sending response: ', { 'patient': mysql_results });
		res.send({ 'patient': mysql_results});
	});
	connection.end();
}


exports.list = function(req, res){
	console.log("patient_mysql.list");
	var mysql = require('mysql');
	var connection = mysql.createConnection('mysql://web_readonly:r3adOn!yUs3r@expression.ml.cmu.edu/life');
	connection.query('SELECT * from PatientAccount', function(err, rows, fields) {
	  	if (err) throw err;
	  	mysql_results = rows;
		console.log('Sending response: ', { 'patients': to_a(mysql_results)});
		res.setHeader('Content-Type', 'application/json');
 		res.send({ 'patients': to_a(mysql_results)});
	});
	connection.end();

};