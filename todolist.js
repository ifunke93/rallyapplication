// Set up a todo list
// Starting code used from the meteor example leaderboard app

Todos = new Meteor.Collection("list");


Session.setDefault("editing_itemname", null);


var todoHandle = null;
Deps.autorun(function () {
    todoHandle = Meteor.subscribe('list');
});

var CancelEvents = function (selector, callbacks) {
    var ok = callbacks.ok || function () {};
    var cancel = callbacks.cancel || function () {};
    
    var events = {};
    events ['keyup ' + selector + ', keydown ' + selector + ', focusout ' + selector] =
        function (evt) {
            if (evt.type === "keydown" && evt.which === 27) {
                cancel.call(this, evt);
            } else if (evet.type === "keyup" && evt.which === 13 || evt.type === "focusout") {
                var value = String(evt.target.value || "");
                if (value) {
                    ok.call(this, value, evt);
                } else {
                    cancel.call(this, evt);
                }
            }
        };
        
        return events;
};

var activateInput = function (input) {
    input.focus();
    input.select();
};

Template.todos.loading = function () {
    return todoHandle && !todoHandle.ready();
};

Template.todos.events(okCancelEvents(
  '#new-todo',
  {
    ok: function (text, evt) {
      Todos.insert({
        text: text,
        done: false,
      });
      evt.target.value = '';
    }
  }));

Template.todo_item.done_class = function () {
  return this.done ? 'done' : '';
};

Template.todo_item.done_checkbox = function () {
  return this.done ? 'checked="checked"' : '';
};

Template.todo_item.editing = function () {
  return Session.equals('editing_itemname', this._id);
};

Template.todo_item.events({
  'click .check': function () {
    Todos.update(this._id, {$set: {done: !this.done}});
  },

  'click .destroy': function () {
    Todos.remove(this._id);
  },

  'dblclick .display .todo-text': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#todo-input"));
  },

  'click .remove': function (evt) {
    var id = this.todo_id;

    evt.target.parentNode.style.opacity = 0;
    // wait for CSS animation to finish
    Meteor.setTimeout(function () {
      Todos.update({_id: id});
    }, 300);
  }
});

Template.todo_item.events(okCancelEvents(
  '#todo-input',
  {
    ok: function (value) {
      Todos.update(this._id);
      Session.set('editing_itemname', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
    }
  }));
