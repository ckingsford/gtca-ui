GTCA = Ember.Application.create({
  LOG_TRANSITIONS: true
});

GTCA.Store = DS.Store.extend({
  revision: 12,
  adapter: 'DS.FixtureAdapter'
});

GTCA.Router.map(function() {
  this.resource('patient', { path: '/patient/:patient_id' }, function() {
    this.resource('dosing', function() {
      this.route('new_session');
      this.resource('session', { path: '/session/:session_id'}, function() {
        this.resource('drug', { path: '/drug/:drug_id' }, function() {
          this.resource('factor', { path: '/factor/:factor_id'});
        });
      });
    });
  });
});

GTCA.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('patient', { id: 'huAC827A' });
  }
});

GTCA.FactorRoute = Ember.Route.extend({
});

GTCA.DosingNewSessionRoute = Ember.Route.extend({
  // TODO: actually create a new session object
  redirect: function() {
    this.transitionTo('session', Ember.Object.create({
      id: 0,
      drugs: Em.A([])
    }));
  }
});

GTCA.SessionRoute = Ember.Route.extend({
  model: function(params) {
    return Ember.Object.create({
      id: 0,
      drugs: Em.A([])
    });
  },
  setupController: function(controller, session) {
    controller.set('content', session);
  },
  events: {
    drug_selected: function(drug) {
      this.transitionTo('drug', drug);
    }
  }
});

GTCA.DrugRoute = Ember.Route.extend({
});

GTCA.Patient = DS.Model.extend({
  first_name: DS.attr('string'),
  last_name: DS.attr('string'),
  birth_date: DS.attr('date'),
  gender: DS.attr('string'),
  mr_id: DS.attr('number'),
  acct_id: DS.attr('number'),

  name: function() {
    return this.get('first_name') + " " + this.get("last_name");
  }.property('first_name', 'last_name')
});

GTCA.Patient.FIXTURES = [{
  id: 'huAC827A',
  first_name: 'John',
  last_name: 'Dou',
  birth_date: '3/10/1960',
  gender: 'Male',
  mr_id: 123213,
  acct_id: 13123
}];

GTCA.PatientRoute = Ember.Route.extend({
  renderTemplate: function() {
    this.render();
    this.render('patient-sidebar', {
                  into: 'patient',
                  outlet: 'patient_view'
                });
  },
});

GTCA.FactorRoute = Ember.Route.extend({
  events: {
    factor_closed: function() {
      this.transitionTo('drug');
    } 
  }
});

GTCA.FactorView = Ember.View.extend({
  didInsertElement: function() {
    this.$('.modal').modal();
  },
  willDestroyElement: function() {
    this.send('factor_closed');
  }
});

GTCA.DrugTextField = Ember.TextField.extend({
  insertNewline: function() {
    this.get('controller').send('add_drug');
  }
});

GTCA.DrugController = Ember.ObjectController.extend({
  needs: "patient"
});

GTCA.SessionController = Ember.ObjectController.extend({
  condition: "",

  condition_specified: function() {
    return this.get('condition') != "";
  }.property('condition'),

  selectionChanged: function() {
    selection = this.get('selection');
    if (selection) {
      this.send('drug_selected', this.get('selection'));
    }
  }.observes('selection'),

  add_drug: function() { 
    drugs = this.get('drugs');
    switch(this.get('drug').toLowerCase()) {
      case 'warfarin':
        drugs.addObject({ 
          id: 1,
          title: 'Warfarin',
          dosage: '2mg',
          typical_dosage: '1mg',
          factors: [
            { id: 1, name: 'CYP2C9*2', type: 'Variant', effect: 0.5 },
            { id: 2, name: 'CYP2C9*3', type: 'Variant', effect: 0.5 },
            { id: 3, name: 'Asian', type: 'Ethnicity', effect: -0.2 },
            { id: 4, name: 'Heart Surgery', type: 'Condition', effect: 0.3 },
          ]
        });
        break;
      case 'heparin':
        drugs.addObject({
          id: 2,
          title: 'Heparin',
          dosage: '3mg',
          typical_dosage: '4mg',
          factors: [
            { id: 1, name: 'Asian', type: 'Ethnicity', effect: -0.2 },
            { id: 2, name: 'Heart Surgery', type: 'Condition', effect: 0.3 },
            { id: 3, name: 'CYP2C9*2', type: 'Variant', effect: 0.5 },
          ]
        });
        break;
      case '':
        break;
      default:
        alert('Bad drug: only Warfarin and Heparin currently supported'); 
    }
    this.set('drug', "");
    this.set('selection', drugs.get('lastObject'));
  }
});
