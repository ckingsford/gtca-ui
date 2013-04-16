GTCA = Ember.Application.create();
GTCA.ApplicationController = Ember.Controller.extend({
});

GTCA.Router.map(function() {
  this.resource('patient', { path: '/patient/:patient_id' }, function() {
    this.route("dosing");
  });
});

GTCA.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('patient', { id: 'huAC827A' });
  }
});

GTCA.PatientDosingRoute = Ember.Route.extend({
  model: function() {
    return [];
  }
});

GTCA.PatientRoute = Ember.Route.extend({
  renderTemplate: function() {
    this.render();
    this.render('patient-sidebar', {
                  into: 'patient',
                  outlet: 'patient_view'
                });
  },
  model: function(params) {
    return {
      id: 'huAC827A',
      first_name: 'John',
      last_name: 'Dou',
      birth_date: '3/10/1960',
      gender: 'Male',
      mr_id: 123213,
      acct_id: 13123
    }
  }
});

GTCA.DrugTextField = Ember.TextField.extend({
  insertNewline: function() {
    this.get('controller').send('add_drug');
  }
});

GTCA.PatientDosingController = Ember.ArrayController.extend({
  init: function() {
    this.set('condition', "");
  },

  condition_specified: function() {
    return this.get('condition') != "";
  }.property('condition'),

  add_drug: function() { 
    switch(this.get('drug').toLowerCase()) {
      case 'warfarin':
        this.addObject({ 
          title: 'Warfarin',
          dosage: '2mg',
          typical_dosage: '1mg',
          factors: [
            { name: 'CYP2C9*2', type: 'Variant', effect: 0.5 },
            { name: 'CYP2C9*3', type: 'Variant', effect: 0.5 },
            { name: 'Asian', type: 'Ethnicity', effect: -0.2 },
            { name: 'Heart Surgery', type: 'Condition', effect: 0.3 },
          ]
        });
        break;
      case 'heparin':
        this.addObject({
          title: 'Heparin',
          dosage: '3mg',  
          typical_dosage: '4mg',
          factors: [
            { name: 'Asian', type: 'Ethnicity', effect: -0.2 },
            { name: 'Heart Surgery', type: 'Condition', effect: 0.3 },
            { name: 'CYP2C9*2', type: 'SNP', effect: 0.5 },
          ]
        });
        break;
      case '':
        break;
      default:
        alert('Bad drug: only Warfarin and Heparin currently supported'); 
    }
    this.set('drug', "");
    this.set('selection', this.get('lastObject'));
  }
});

GTCA.PatientIndexController = Ember.ObjectController.extend({
});

GTCA.FactorVisualizationView = Ember.View.extend({
  didInsertElement: function() {
      var w = 300,                        //width
    h = 300,                            //height
    r = 100,                            //radius
    color = d3.scale.category20c();     //builtin range of colors
 
    data = [{"label":"one", "value":20}, 
            {"label":"two", "value":50}, 
            {"label":"three", "value":30}];

    var vis = d3.select(this.$().get(0))
        .append("svg:svg")              //create the SVG element inside the <body>
        .data([data])                   //associate our data with the document
            .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
            .attr("height", h)
        .append("svg:g")                //make a group to hold our pie chart
            .attr("transform", "translate(" + r + "," + r + ")")    //move the center of the pie chart from 0, 0 to radius, radius
 
    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(r);
 
    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array
 
    var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "slice");    //allow us to style things in the slices (like text)
 
        arcs.append("svg:path")
                .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
  
        arcs.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = r;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle")                          //center the text on it's origin
            .text(function(d, i) { return data[i].label; });        //get the label from our original data array

  }
});

GTCA.ApplicationRoute = Ember.Route.extend({
});
