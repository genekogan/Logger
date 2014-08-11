var okCancelEvents = function (selector, callbacks) {
  	var ok = callbacks.ok || function () {};
  	var cancel = callbacks.cancel || function () {};
  	var events = {};
	events['keyup '+selector+', keydown '+selector+', focusout '+selector] = function (evt) {
		if (evt.type === "keydown" && evt.which === 27) { // escape = cancel
        	cancel.call(this, evt);
      	} 
		else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        	var value = String(evt.target.value || "");
        	if (value)
          		ok.call(this, value, evt);
        	else
          		cancel.call(this, evt);
      	}
    };
  	return events;
};

function addNewTodo(list_id, name) {
	var sort_order = 0;
	if (Todos.find({list_id: list_id}).count() > 0) {
		sort_order = 1 + Todos.find({list_id: list_id}, {sort:{sort_order:-1}}).fetch()[0].sort_order;
	}
	Todos.insert({
		list_id: list_id, name: name, description: "",
		archived: false, completed: false,
		priority_level: 0, sort_order: sort_order, editing_description: true,
		timestamp_created: 5, timestamp_completed: null, timestamp_archived: null,
	});
}

function sortUp(todo_id) {
	var todo = Todos.find(todo_id).fetch()[0];
	if (todo.sort_order == 0)	return;
	var other = Todos.find({list_id:todo.list_id, sort_order:todo.sort_order-1}).fetch()[0];
	Todos.update(todo._id, {$set: {sort_order:todo.sort_order-1}});
	Todos.update(other._id, {$set: {sort_order:other.sort_order+1}});
}

function resortList(list_id) {
	var sort_order = 0;
	Todos.find({list_id:list_id}, {sort:{sort_order:1}}).fetch()
		.forEach(function (t) { 
			Todos.update(t._id, {$set:{sort_order:sort_order++}});
	});
}


if (Meteor.isClient) {
	
	Template.todoLists.todoLists = function () {
    	var lists = new Array();
		TodoLists.find({}, {sort: {sort_order: 1}}).forEach(function (thisList) {
			/*
			var sel = { list_id:thisList._id, archived:Session.get('view_archived') };
			if (tag_filter)
				sel.tags = tag_filter;
			if (Session.get('view_priority'))
				sel.priority = true;
			*/
			var selection = {list_id:thisList._id};
			var theTodos = Todos.find(selection, {sort: {sort_order: 1}}).fetch();
			if (theTodos.length > 0) {
				lists.push({id:thisList._id,
							name:thisList.name,
							list:thisList, 
							todos:theTodos,
							adding_todo: thisList.adding_todo,
							editing_todos_list: thisList.editing_todos_list });
			}
		});
		return lists;
  	};

	Template.todo.get_description = function() {
		var description = this.description;
	  	description = description.replace(/\r?\n/g, '<br/>');
	  	description = description.replace(/\s-\s/g, '&nbsp;-&nbsp;');
	  	return description;
	};
	
	Template.todo.description_empty = function() {
	  	return this.description.length<2;
	};
	
	Template.todo.completed = function() {
		return this.completed ? 'completed' : '';
	};
	
	Template.todo.getMoveLists = function() {
		var moveListStr = '';
		TodoLists.find({}).forEach(function (t) {
			moveListStr += '<li><div class="todo_move" id="'+t._id+'">'+t.name+'</div></li>';
		});
		return moveListStr;
	}

	Template.todoLists.events({
		'mousedown .todos_list_add': function (evt) {
			TodoLists.update(this.id, {$set: {adding_todo: !this.adding_todo}});
	  	},
		'mousedown .todos_list_edit': function (evt) {
			TodoLists.update(this.id, {$set: {editing_todos_list: !this.editing_todos_list}});
	  	},
		'mousedown .todos_list_up': function (evt) {
			alert("list up");
	  	},
		'dblclick .todos_list_description': function (evt) {
//			Todos.update(this._id, {$set: {editing_description: !this.editing_description}});
	  	}
	});
	
	Template.todoLists.events(okCancelEvents(	
		'.todos-list-add', {
	    	ok: function (text, evt) {
				if (evt.type == "keyup")
					addNewTodo(this.id, text);
				TodoLists.update(this.id, {$set: {adding_todo: false}});			
			}
	}));
	Template.todoLists.events(okCancelEvents(	
		'.todos-list-edit', {
	    	ok: function (text, evt) {
				TodoLists.update(this.id, {$set: {name: text, editing_todos_list: false}});			
			}
	}));	
	
	Template.todo.events({
		'mousedown .todo_name_display': function (evt) {
			Todos.update(this._id, {$set: {description_visible: !this.description_visible}});
	  	},
		'mousedown .todo_complete': function (evt) {
			Todos.update(this._id, {$set: {completed: !this.completed}});
	  	},
		'mousedown .todo_move': function (evt) {
			var other_list_id = evt.target.getAttribute('id');
			Todos.update(this._id, {$set: {list_id: other_list_id, sort_order:9999}});
			resortList(this.list_id);
			resortList(other_list_id);
	  	},
		'mousedown .todo_delete': function (evt) {
			Todos.remove(this._id);
			resortList(this.list_id);
	  	},
		'mousedown .todo_edit': function (evt) {
			Todos.update(this._id, {$set: {editing_todo: !this.editing_todo}});
	  	},
		'mousedown .todo_up': function (evt) {
			sortUp(this._id);
	  	},
		'mousedown .todo_priority': function (evt) {
			alert("prio");
	  	},
		'dblclick .todo_description': function (evt) {
			Todos.update(this._id, {$set: {editing_description: !this.editing_description}});
	  	}
	});
	
	Template.todo.events(okCancelEvents(
		'.todo-description-edit', {
	    	ok: function (text, evt) {
				Todos.update(this._id, {$set: {description: text}});
	    	},
	    	cancel: function (text, evt) {
				Todos.update(this._id, {$set: {editing_description: false}});
			}
	}));
	Template.todo.events(okCancelEvents(	
		'.todo-name-edit', {
	    	ok: function (text, evt) {
				Todos.update(this._id, {$set: {name: text, editing_todo: false}});
			}
	}));
}





// On server startup, create some todos if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function () {
		//TodoLists.remove({});
		//Todos.remove({});	
		 		
		if (Todos.find().count() === 0) {
			var list1 = TodoLists.insert({name:"list 1"});
			var list2 = TodoLists.insert({name:"list 2"});
			var list3 = TodoLists.insert({name:"list 3"});
			
			addNewTodo(list3, "task 1");
			addNewTodo(list2, "task 2");
			addNewTodo(list1, "task 3");
			addNewTodo(list3, "task 4");
			addNewTodo(list3, "task 5");
			addNewTodo(list1, "task 6");
			addNewTodo(list2, "task 7");
			addNewTodo(list2, "task 8");
			addNewTodo(list1, "task 9");
			addNewTodo(list1, "task 10");
			addNewTodo(list3, "task 11");
			addNewTodo(list1, "task 12");
		};		   
	});
}

