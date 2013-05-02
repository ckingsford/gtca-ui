GTCA = Ember.Application.create({
  LOG_TRANSITIONS: true
});

GTCA.FixtureAdapter = DS.FixtureAdapter.extend({
  queryFixtures: function(fixtures, query, type) {
    if (type == "GTCA.DosagePrediction") {
      return [{
        id: 'drug_' + query.drug.toString() + '_conditions' + query.conditions.toString(),
        conditions: query.conditions,
        drug: query.drug
      }];
    }
  }
});

GTCA.Store = DS.Store.extend({
  revision: 12,
  adapter: 'GTCA.FixtureAdapter'
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
  first_name: 'John',
  last_name: 'Dou',
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

GTCA.TokenizedTextField = Ember.View.extend({
  toIdList: function(id_name) {
    l = [];
    $.each(id_name, function(idx, value) {
      l.push(value.id);
    });
    return l;
  },
  didInsertElement: function() {
    var view = this;
    var $i = view.$();

    $i.tokenInput(this.get('token_find_url'), {
      theme: "gtca",
      preventDuplicates: true,
      onAdd: function(item) {
        view.set('value', view.toIdList($i.tokenInput('get')));
      },
      onDelete: function(item) {
        view.set('value', view.toIdList($i.tokenInput('get')));
      }
    });
  }
});

GTCA.DrugsField = GTCA.TokenizedTextField.extend({
  didInsertElement: function() {
    this._super();

    var $i = this.$();
    $i.siblings('ul').addClass('search drug');
  },
});

GTCA.ConditionsField= GTCA.TokenizedTextField.extend({
  didInsertElement: function() {
    this._super();

    var $i = this.$();
    $i.siblings('ul').addClass('search drug');
  },
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

  calculate: function() {
    var session = this;
    var last = undefined;
    $.each(this.get('drug'), function(i, drug_id) {
      last = GTCA.Drug.find(drug_id);
      session.get('drugs').addObject(last)
    });
    this.set('selection', last);
  }
});

Ember.Handlebars.registerBoundHelper('renderEffect', function(value, opts) {
  // TODO: currently checking for undefined value
  // probably due to promise instead of loaded model?
  return value ? (value * 100).toString() + "%" : value;
});
