
Router.map(function() {
  this.route('logger', {path: '/'});
  this.route('todos');
});


TodoLists = new Meteor.Collection("todo_lists");
Todos = new Meteor.Collection("todos");

TaskLists = new Meteor.Collection("task_lists");
Tasks = new Meteor.Collection("task");

Logs = new Meteor.Collection("logs");
LogNames = new Meteor.Collection("logNames");
LogLocations = new Meteor.Collection("logLocations");

/*
var dateStart = new Date(2014, 5, 20);
var dateEnd = new Date(2014, 5, 21);
Meteor.publish('logs', {timestamp: 
	{$gte: dateStart, $lte: dateEnd}});
*/