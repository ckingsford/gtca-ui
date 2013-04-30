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
    this.transitionTo('patient', GTCA.Patient.find('huAC827A'));
  }
});

GTCA.FactorRoute = Ember.Route.extend({
});

GTCA.DosingNewSessionRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('session', GTCA.Session.createRecord({
      drugs: []
    }));
  }
});

GTCA.SessionRoute = Ember.Route.extend({
  events: {
    drug_selected: function(drug) {
      this.transitionTo('drug', drug);
    },
    no_more_drugs: function() {
      this.transitionTo('session');
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

GTCA.Session = DS.Model.extend({
  drugs: DS.hasMany('GTCA.Drug')
});

GTCA.Drug = DS.Model.extend({
  title: DS.attr('string'),
  dosage: DS.attr('number'),
  typical_dosage: DS.attr('number'),
  factors: DS.hasMany('GTCA.Factor')
});

GTCA.Factor = DS.Model.extend({
  name: DS.attr('string'),
  kind: DS.attr('string'),
  effect: DS.attr('number'),
  drug: DS.belongsTo('GTCA.Drug')
});

GTCA.Patient.FIXTURES = [{
  id: 'huAC827A',
  first_name: 'Nikhil',
  last_name: 'Venkatesan',
  birth_date: '3/10/1960',
  gender: 'Male',
  mr_id: 123213,
  acct_id: 13123
}];

GTCA.Session.FIXTURES = [];

GTCA.Factor.FIXTURES = [
  { id: 1, name: 'CYP2C9*2', kind: 'Variant', effect: 0.5, drug_id: 1 },
  { id: 2, name: 'CYP2C9*3', kind: 'Variant', effect: 0.5, drug_id: 1 },
  { id: 3, name: 'Asian', kind: 'Ethnicity', effect: 0.2, drug_id: 2 },
  { id: 4, name: 'Heart Surgery', kind: 'Condition', effect: 0.3, drug_id: 2 }
]

GTCA.Drug.FIXTURES = [{
  id: 1,
  title: 'Warfarin',
  dosage: 2,
  typical_dosage: 1,
  factors: [1, 2]
}, {
  id: 2,
  title: 'Heparin',
  dosage: 3,
  typical_dosage: 4,
  factors: [3, 4]
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
    var view = this;
    this.$('.modal').modal({
      keyboard: true
    });
    this.$('.modal').on('hidden', function() {
      view.get('controller').send('factor_closed');
    });
  },
  willDestroyElement: function() {
    this.$('.modal').modal('hide');
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
      this.send('drug_selected', selection);
    }
  }.observes('selection'),

  add_drug: function() { 
    drugs = this.get('drugs');
    var drug = undefined;
    switch(this.get('drug').toLowerCase()) {
      case 'warfarin':
        drug = GTCA.Drug.find(1);
        break;
      case 'heparin':
        drug = GTCA.Drug.find(2);
        break;
      case '':
        break;
      default:
        alert('Only Warfarin and Heparin are currently supported. We apologize for the inconvenience.'); 
    }

    drugs.addObject(drug);
    this.set('selection', drug);
    this.set('drug', "");
  },

  close_tab: function(drug) {
    drugs = this.get('drugs');
    drugs.removeObject(drug);

    if (drugs.get('length') == 0) {
      this.send('no_more_drugs');
      this.set('selection', null);
    } else if (this.get('selection') == drug) {
      go_to = Math.max(0, drugs.indexOf(drug) - 1);
      this.set('selection', drugs.objectAt(go_to));
    }
  },

  open_session_picker: function() {
    new GTCA.SessionPickerView().append();
  }
});

GTCA.SessionPickerView = Ember.View.extend({
  templateName: "session-picker",
  didInsertElement: function() {
    var view = this;
    this.$('.modal').modal();
    this.$('.modal').on('hidden', function() {
      view.destroy();
    });
  }
});

Ember.Handlebars.registerBoundHelper('renderEffect', function(value, opts) {
  // TODO: currently checking for undefined value
  // probably due to promise instead of loaded model?
  return value ? (value * 100).toString() + "%" : value;
});
