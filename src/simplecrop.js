/* jshint strict: false */

(function(window, $) {
  var SimpleCrop, pluginName = 'simplecrop';

  SimpleCrop = function(el, options) {
    var self     = this;

    this.el      = el;
    this.$el     = $(el);
    this.options = $.extend({
      offset: 0.5,
      height: options.width || this.$el.height(),
      width: options.height || this.$el.height()
    }, options);

    this.$el.load(function() {
      self.orientation = self.$el.width() < self.$el.height() ? 'portrait' : 'landscape';
      self.portrait    = self.orientation === 'portrait';
      self.landscape   = self.orientation === 'landscape';

      self.setupUI();
      self.setupDraggable();
    });
  };

  SimpleCrop.prototype.setupDraggable = function() {
    var self = this,
        leftEdge = Math.ceil(self.$constraint.position().left),
        topEdge  = Math.ceil(self.$constraint.position().top),
        relativeRight  = this.dimensions.width - self.$constraint.width(),
        relativeBottom = this.dimensions.height - self.$constraint.height();

    var drag = {
      start: function(e) {
        e.preventDefault();

        var rightClick = e.button === 2 || e.which === 3;
        if (rightClick) { return; }

        var data = {
          startX: e.clientX,
          relativeX: (e.clientX - leftEdge) - self.getPosition().left,
          relativeY: (e.clientY - topEdge) - self.getPosition().top
        };

        self.$el.trigger('cropstart');
        $(window).on('mousemove', function(e) {
          e.data = data;
          drag.move(e);
        });
      },

      move: function(e) {
        var left = Math.ceil(e.clientX - e.data.relativeX - leftEdge);
        var top = Math.ceil(e.clientY - e.data.relativeY - topEdge);

        if (left >= -relativeRight && left <= 0) {
          self.$el.css('left', left + 'px');
        }

        if (top >= -relativeBottom && top <= 0) {
          self.$el.css('top', top + 'px');
        }
      },

      stop: function() {
        $(window).off('mousemove');
        self.$el.trigger('cropend', [self.getDimensions()]);
      }
    };

    this.$constraint.on('mousedown', drag.start);
    $(window).on('mouseup', drag.stop);
  };

  SimpleCrop.prototype.setupUI = function() {
    this.$el.css({
      maxHeight: (this.landscape ? this.options.height : 'none'),
      maxWidth: (this.portrait ? this.options.width : 'none')
    });

   this.dimensions  = {
      width: this.$el.width(),
      height: this.$el.height()
    };

    if (this.dimensions.height < this.options.height) {
      this.$el.height(this.options.height);
    }

    this.$el.wrap('<div class="simplecrop-container"><div class="simplecrop-constraint">');

    this.$constraint = this.$el.parent('.simplecrop-constraint');
    this.$container  = this.$el.parents('.simplecrop-container');

    this.$constraint
      .width(this.options.width)
      .height(this.options.height)
      .addClass(this.orientation);

    this.$el.css(this.startingPosition());
  };

  SimpleCrop.prototype.startingPosition = function() {
    var position = {
          left: 0,
          top: 0
        },
        width  = this.dimensions.width,
        height = this.dimensions.height;

    if (width > this.options.width) {
      position.left = (width - this.options.width) * -this.options.offset;
    }

    if (height > this.options.height) {
      position.top = (height - this.options.height) * -this.options.offset;
    }

    return position;
  };

  SimpleCrop.prototype.getDimensions = function() {
    var position = this.getPosition();

    return {
      height: this.options.height,
      width: this.options.width,
      left: position.left,
      top: position.top
    };
  };

  SimpleCrop.prototype.getPosition = function() {
    return this.$el.position();
  };

  $.fn[pluginName] = function (options) {
    this.each(function() {
      if (!$.data(this, pluginName)) {
        $.data(this, pluginName, new SimpleCrop(this, options));
      }
    });
    return this;
  };

}(this, jQuery));
