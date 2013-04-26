var to_titlecase = function(str) {
  return str[0].toUpperCase() + str.substring(1)
}

var url_capitalize_resource = function(url) {
  var parts = url.split('/');
  var head_parts = parts.slice(0, parts.length - 1);
  var tail_titlecase = to_titlecase(parts[parts.length - 1]); // eg: patients to Patients
  return head_parts.join("/") + "/" + tail_titlecase;
}

GTCA.RESTAdapterStripXML = DS.RESTAdapter.extend({
  ajax: function(url, type, hash) {
    hash.dataFilter = function(xml_wrapped_json, dataType) {
        var xml_doc = $.parseXML(xml_wrapped_json)
        var $xml = $(xml_doc)
        var json = $xml.find('return').text();
        return json;
    };
    //var url_ = url_capitalize_resource(url);
    return this._super(url_, type, hash);
  }
});