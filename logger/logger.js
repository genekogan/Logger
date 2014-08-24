
var okCancelEvents = function (selector, callbacks) {
  	var ok = callbacks.ok || function () {};
  	var cancel = callbacks.cancel || function () {};
  	var events = {};
	events['keyup '+selector+', keydown '+selector+', focusout '+selector] = function (evt) {
		if (evt.type === "keydown" && evt.which === 27) { // escape = cancel
        	cancel.call(this, evt);
      	} 
		else if (evt.type === "keyup" && evt.which === 13 || evt.type === "focusout") {
        	var value = String(evt.target.value || "");
        	if (value)	ok.call(this, value, evt);
        	else		cancel.call(this, evt);
      	}
    };
  	return events;
};

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getDateNDaysFrom(start, days) {
    return new Date(start.getTime() + days*24*60*60*1000);
}

function addNewEntry(type, entry, timestamp, location) {
	Logs.insert({
		type: type, entry: entry, 
		timestamp: timestamp, timestamp_created: new Date(),
		location: location
	});
}

function parseEntries(entries) {
	// set initial timestamp
	timestamp = new Date();
	timestamp.setSeconds(0);

	// set default list and type
	var type = "log";
	
	entries.forEach(function (entry) {
		if (entry.match(/[^ ]+/) == null)	return false;
		
		// find change of date line
		var dateChange = entry.match(/^@([^A-Za-z]+)/);
		if (dateChange != null) {
			dateChange = dateChange[1].split(/\//);
			if (dateChange.length == 3) {
				timestamp = new Date(dateChange[2], dateChange[0]-1, dateChange[1]);
			} 
			else {
				timestamp = new Date(timestamp.getYear()+1900, dateChange[0]-1, dateChange[1]);
			}
			return false;
		}

		// set default time and location
		var location = null;

		// look for metadata
		entry = entry.split(/@\(([^\)]+)\)[^A-Za-z]*$/g);
		var metadata = entry[1];
		entry = entry[0];
		
		if (metadata != null) {
			metadata = metadata.split(/,/);

			// set time
			var time = metadata[0].split(/:/);
			timestamp.setHours(time[0]);
			timestamp.setMinutes(time[1]);

			// set location
			if (metadata.length == 2) {
				var logloc = LogLocations.find({name:metadata[1]});
				if (logloc.count() > 0) {
					location = logloc.fetch()[0].gps;
				}
				else {
					location = null;
				}
			} 
			else if (metadata.length == 3) {
				location = [ parseFloat(metadata[1]), parseFloat(metadata[2]) ];
			}
		}
		
		// replace aliases with full names
		LogNames.find({}).forEach(function (n) {entry=entry.replace("~"+n.alias, "~"+n.name)});
		
		// add log entry to meteor
		addNewEntry(type, entry, timestamp, location)
	});
}

function setDateRange(dateStart, dateEnd) {
	Session.set('date_start', dateStart);
	Session.set('date_end', dateEnd);	
	Meteor.subscribe('logs', {timestamp: 
		{$gte: Session.get('date_start'), $lte: Session.get('date_end')}});	
}



if (Meteor.isClient) 
{	
	Session.setDefault('isEditing', false);
	Session.setDefault('date_start', new Date(2014, 5, 20));
	Session.setDefault('date_end', new Date(2014, 5, 21));

	Template.logger.logs = function() {
		return Logs.find({timestamp: 
			{$gte: Session.get('date_start'), $lte: Session.get('date_end')}},
			{sort:{timestamp:1}});
	};

	Template.logger.numlogs = function() {
		return Logs.find({timestamp: 
			{$gte: Session.get('date_start'), $lte: Session.get('date_end')}},
			{sort:{timestamp:1}}).count();
	};
	
	Template.logger.events({
		'mousedown .test1': function (evt) {
			//setDateRange(new Date(2012,10,5), new Date(2012,11,19));			
	  	}
	});
	
	Template.addEntries.events(okCancelEvents(
		'.addEntries', {
			ok: function (text, evt) {
			},
			cancel: function (evt) {
				var entries = evt.target.value.split('\n');
				parseEntries(entries);
			}
	}));
	
	Template.loggerNavbar.rendered = function() {
	  	$(function() {
	    	$('#rangeBegin').datetimepicker({pickTime: false});
	    	$('#rangeEnd').datetimepicker({pickTime: false});
			$('#rangeBegin').datetimepicker().data().DateTimePicker.hide();
			$('#rangeEnd').datetimepicker().data().DateTimePicker.hide();
			$('#rangeBegin').datetimepicker().data().DateTimePicker.setDate("8/1/2014");
			$('#rangeEnd').datetimepicker().data().DateTimePicker.setDate("8/15/2014");
			var today = new Date();
			var yesterday = getDateNDaysFrom(today, -10);
			setDateRange(yesterday, today);			
	  	});
 	};

	Template.addEntries.addingEntries = function() {
		return Session.get('isEditing') ? "Editing" : "";
	}
	Template.logger.addingEntries = function() {
		return Session.get('isEditing') ? "Editing" : "";
	} 
	Template.loggerNavbar.addingEntries = function() {
		return Session.get('isEditing') ? "Editing" : "";
	} 

	Template.loggerNavbar.events({
    	'click .loggerRange': function () {
			var date1 = $('#rangeBegin').data().date.split("/");
			var date2 = $('#rangeEnd').data().date.split("/");
			setDateRange(new Date(date1[2],date1[0]-1,date1[1],5,5,0), new Date(date2[2],date2[0]-1,date2[1]),5,5,0);			
	 	},
		'click .loggerDay': function () {
			var date1 = $('#rangeBegin').data().date.split("/");
			var theDate = new Date(date1[2],date1[0]-1,date1[1]);
			theDate.setHours(5);	theDate.setMinutes(5);	theDate.setSeconds(0);
			setDateRange(theDate, getDateNDaysFrom(theDate, 1));
	 	},
		'click .loggerRandom': function () {
			var beginDate = new Date(2012,7,3);
			var endDate = new Date();
			var theDate = randomDate(beginDate, endDate)
			theDate.setHours(5);	theDate.setMinutes(5);	theDate.setSeconds(0);
			setDateRange(theDate, getDateNDaysFrom(theDate, 1));			
	 	},
		'click #navbar_addEntries': function () {
			Session.set('isEditing', !Session.get('isEditing'));	
		}
  	});
}


// On server startup, create some todos if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function () {
		//Logs.remove({}); 
		//LogNames.remove({});
		//LogLocations.remove({});
		/*
		if (Logs.find().count() === 0) {
			for (var i = 0; i < 0; i++) {
				addNewEntry(
					"log", "log description", 
					new Date(2014, Math.floor(Random.fraction()*12), Math.floor(Random.fraction()*28), Math.floor(Random.fraction()*24), Math.floor(Random.fraction()*60)),
					[55,66]);  
			}
		};	
		*/	   
	});
}

