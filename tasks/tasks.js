
if (Meteor.isServer) {
	Meteor.startup(function () {
		TaskLists.remove({});
		Tasks.remove({});
	
		if (TaskLists.find().count() === 0) {
			TaskLists.insert({id: 0, name:"list 1"});
			TaskLists.insert({id: 1, name:"list 2"});
		}	
		if (Tasks.find().count() === 0) {
			for (var i = 0; i < 6; i++) {
		        Tasks.insert({
					list_id: Math.floor(Random.fraction()*2),
					name: "task",
					description: "task description "+i,
					timestamp: 4,
					timestamp_created: 5
				});
			}
		};	 	
	});
}

