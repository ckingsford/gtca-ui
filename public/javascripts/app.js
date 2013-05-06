GTCA = Ember.Application.create({
  LOG_TRANSITIONS: true
});

GTCA.FixtureAdapter = DS.FixtureAdapter.extend({
  queryFixtures: function(fixtures, query, type) {
    if (type == "GTCA.Prediction") {
      return [{
        id: 'drug_' + query.drug.toString() + '_conditions_' + query.conditions.toString(),
        conditions: query.conditions,
        drug: query.drug,
        dosage: 3,
        typical_dosage: 4,
        factors: [3, 4]
      }];
    } else if (type == "GTCA.Drug") {
      console.log(fixtures);
      return fixtures;
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
        this.resource('prediction', { path: '/prediction/:prediction_id' }, function() {
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
      predictions: []
    }));
  }
});

GTCA.SessionRoute = Ember.Route.extend({
  events: {
    selected: function(prediction) {
      this.transitionTo('prediction', prediction);
    },
    no_more_predictions: function() {
      this.transitionTo('session');
    }
  }
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
  predictions: DS.hasMany('GTCA.Predictions')
});

GTCA.Prediction = DS.Model.extend({
  drug: DS.belongsTo('GTCA.Drug'),
  conditions: DS.hasMany('GTCA.Condition'),
  typical_dosage: DS.attr('number'),
  dosage: DS.attr('number'),
  factors: DS.hasMany('GTCA.Factor')
});

GTCA.Drug = DS.Model.extend({
  title: DS.attr('string'),
}
);
GTCA.Condition = DS.Model.extend({
  title: DS.attr('string'),
});

GTCA.Factor = DS.Model.extend({
  name: DS.attr('string'),
  kind: DS.attr('string'),
  effect: DS.attr('number'),
  prediction: DS.belongsTo('GTCA.Prediction')
});

GTCA.Prediction.FIXTURES = [{
  id: 'drug_1_conditions_1',
  conditions: [ 1 ],
  drug: 1,
  dosage: 3,
  typical_dosage: 4,
  factors: [1, 2]
}];

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
  { id: 1, name: 'CYP2C9*2', kind: 'Variant', effect: 0.5, prediction: 1 },
  { id: 2, name: 'CYP2C9*3', kind: 'Variant', effect: 0.5, prediction: 1 },
  { id: 3, name: 'Asian', kind: 'Ethnicity', effect: 0.2, prediction: 2 },
  { id: 4, name: 'Heart Surgery', kind: 'Condition', effect: 0.3, prediction: 2 }
]

GTCA.Drug.FIXTURES = [{
  id: 1,
  title: 'Warfarin',
}, {
  id: 2,
  title: 'Heparin',
}];

GTCA.Condition.FIXTURES = [{
  id: 1,
  title: 'Atrial Fibrillation',
}, {
  id: 2,
  title: 'Fibromyalgia',
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
      this.transitionTo('prediction');
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
    $i.siblings('ul').addClass('search condition');
  },
});

GTCA.PredictionController = Ember.ObjectController.extend({
  needs: "patient"
});

GTCA.SessionController = Ember.ObjectController.extend({
  selectionChanged: function() {
    selection = this.get('selection');
    if (selection) {
      this.send('selected', selection);
    }
  }.observes('selection'),

  close_tab: function(prediction) {
    predictions = this.get('predictions');
    predictions.removeObject(prediction);

    if (predictions.get('length') == 0) {
      this.send('no_more_predictions');
      this.set('selection', null);
    } else if (this.get('selection') == prediction) {
      go_to = Math.max(0, predictions.indexOf(prediction) - 1);
      this.set('selection', predictions.objectAt(go_to));
    }
  },

  calculate: function() {
    var session = this;
    var conditions_input = this.get('conditions_input');
    $.each(this.get('drugs_input'), function(i, drug_id) {
      var last = GTCA.Prediction.find({ drug: drug_id, conditions: conditions_input });
      last.then(function(l) {
        session.get('predictions').addObjects(l);
        session.set('selection', l.get('lastObject'));
      });
    });
  },

  open_session_picker: function() {
    new GTCA.SessionPickerView().append();
  },

  open_session_picker2: function() {
    new GTCA.SessionPickerView2().append();
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

GTCA.SessionPickerView2 = Ember.View.extend({
  templateName: "session-picker2",
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
