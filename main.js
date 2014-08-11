

Router.map(function() {
  this.route('logger', {path: '/'});
  this.route('todos');
});



TodoLists = new Meteor.Collection("todo_lists");
Todos = new Meteor.Collection("todos");

TaskLists = new Meteor.Collection("task_lists");
Tasks = new Meteor.Collection("task");

LogLists = new Meteor.Collection("log_lists");
Logs = new Meteor.Collection("logs");


