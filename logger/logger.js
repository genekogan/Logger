if (Meteor.isClient) {
	
	Template.logger.logs = function() {
		return Logs.find({});
	};
	Template.logger.logLists = function() {
		return LogLists.find({});
	};
}

// On server startup, create some todos if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function () {
		LogLists.remove({});
		Logs.remove({});

		if (LogLists.find().count() === 0) {
			LogLists.insert({id: 0, name:"list 1"});
			LogLists.insert({id: 1, name:"list 2"});
		}
		
		if (Logs.find().count() === 0) {
			for (var i = 0; i < 6; i++) {
		        Logs.insert({
					list_id: Math.floor(Random.fraction()*2),
					type: "log",
					entry: "log description "+i,
					timestamp: 4,
					timestamp_created: 5
				});
			}
		};		   
	});
}

