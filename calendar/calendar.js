



if (Meteor.isClient) {

	Template.callie.weeks = function() {
		var weeks = new Array();

		var today = new Date();		
		var numDaysSinceMonday = (today.getDay()+6)%7;
		var monday0 = new Date(today.getTime() - numDaysSinceMonday*24*60*60*1000);
		monday0.setHours(5);	monday0.setMinutes(0);	monday0.setSeconds(0);
		
		for (var i=0; i<16; i++) {
			var monday = new Date(monday0.getTime() + i*7*24*60*60*1000);
			var days = new Array();
			for (var j=0; j<7; j++) {
				var day = new Date(monday.getTime() + j*24*60*60*1000);
				var dateString = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][day.getDay()]+" "+day.getMonth()+"."+day.getDate();
				days.push({date:dateString, 
							name:"hello"});
			}
			weeks.push({days:days});
		}
		return weeks;
	}
	

}





// On server startup, create some todos if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function () {
	});
}

