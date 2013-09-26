(function ($, BB, _) {

	var App = Backbone.View.extend({
		el: "#comments",
		events: {
			'click .button': 'createComment'
		},
		initialize: function () {
		  this.$input_author = $("#author"),
		  this.$input_message = $("#message"),
		  this.listenTo(this.collection, 'add', this.createView),
		  this.listenTo(this.collection, 'add remove', this.commentCount),
		  this.$comment_list = $("#comment_list"),
		  this.$comment_count = $("#comment_count")
		},
		commentCount: function(){
		  this.$comment_count.html(this.collection.length);
		},
		createComment: function(){
		   var _this = this;

			var comment = new CommentModel({
				author: this.$input_author.val(),
				message: this.$input_message.val(),
				time_elapsed: Date()
			});

			comment.save(null, {
				success: function (model, resp, options) {
					_this.collection.add(model);
				},
				error: function (model, xhr, options) {
					alert('Error on save');
				}
			});
		},
		createView: function (model, collection) {
			var view = new CommentView({ model: model});
			this.$comment_list.append(view.render().el);
		}
	});

	var CommentModel = Backbone.Model.extend({
		defaults: {
			author: '',
			message: '',
			time_elapsed: '',
			upvotes: 0
		},
		idAttribute: '_id',
		url: function () {
			var location = 'http://localhost:9090/comments';
			return this.id ? (location + '/' + this.id) : location;
		},
		initialize: function () {
		}

	});

	var CommentCollection = Backbone.Collection.extend({
		model: CommentModel,
		url: 'http://localhost:9090/comments',
		initialize: function () {

		}
	});

	var CommentView = Backbone.View.extend({
		tagName: 'li',
		template: $('#comment-template').html(),
		events: {
		  'click .upvote' : 'upvoteComment',
		  'click .delete' : 'removeComment'
		},
		initialize: function() {
		  this.listenTo(this.model, 'destroy', this.removeView);
		  this.listenTo(this.model, 'change' , this.changeVote);
		},
		changeVote: function(){
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(this.model.toJSON()));
		},
		upvoteComment: function(){
		  var newAttrs = {
				author: this.model.get('author'),
				message: this.model.get('message'),
				time_elapsed: this.model.get('time_elapsed'),
				upvotes: this.model.get('upvotes') + 1
			}

		  this.model.save(newAttrs, {
			  wait: true,
		  success: function (model, resp, opt) {
			  console.log('model update success: ', model);
		  },
		  error: function (model, xhr, opt) {
			  console.log('model update error: ', model);
		  }
		  });

		},
		removeComment: function () {
			this.model.destroy({
				wait: true,
				success: function (model, resp, opt) {
					console.log('model destroy success: ', model);
				},
				error: function (model, xhr, opt) {
					console.log('model destroy error: ', model);
				}
			})
		},
		removeView: function () {
			this.undelegateEvents();
			this.stopListening();
			this.remove();
		},
		render: function() {
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(this.model.toJSON()))
			return this;
		}
	});

	var commentApp = new App({ collection: new CommentCollection() });

	// for debugging purposes
	window.app = commentApp;
})(jQuery, Backbone, _)
