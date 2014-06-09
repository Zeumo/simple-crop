/* jshint strict: false */

(function(window, $) {
  var SimpleCrop, pluginName = 'simplecrop';

  SimpleCrop = function(el, options) {
    this.$el     = $(el);
    this.options = $.extend({
      offset: 0.5,
      height: options.width || this.$el.height(),
      width: options.height
    }, options);

    this.setupUI();
    this.setupDraggable();
  };

  SimpleCrop.prototype.setupDraggable = function() {
    var self = this,
        leftEdge = Math.ceil(self.$constraint.position().left),
        relativeRight = this.$el.width() - self.$constraint.width();

    var drag = {
      start: function(e) {
        e.preventDefault();

        var rightClick = e.button === 2 || e.which === 3;
        if (rightClick) { return; }

        var data = {
          startX: e.clientX,
          relativeX: e.clientX - leftEdge
        };

        data.relativeX -= self.getLeftOffset();

        self.$el.trigger('cropstart');
        $(window).on('mousemove', function(e) {
          e.data = data;
          drag.move(e);
        });
      },

      move: function(e) {
        var x = Math.ceil(e.clientX - e.data.relativeX - leftEdge);

        if (x >= -relativeRight && x <= 0) {
          self.$el.css('left', x + 'px');
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
    this.$el.wrap('<div class="simplecrop-container"><div class="simplecrop-constraint">');

    this.$constraint = this.$el.parent('.simplecrop-constraint');
    this.$container  = this.$el.parents('.simplecrop-container');

    this.$constraint.width(this.options.width).height(this.options.height);
    this.$container.width(this.$el.width());
    this.$el.css('left', this.startingOffset());
  };

  SimpleCrop.prototype.startingOffset = function() {
    var offset, width = this.$el.width();

    if (this.options.offset > 0 && this.options.offset < 1) {
      // Use ratio
      offset = (width - this.$constraint.width()) * -this.options.offset;

    } else {
      // Use pixel offset
      offset = this.options.offset;
    }

    return offset;
  };

  SimpleCrop.prototype.getDimensions = function() {
    return {
      height: this.options.height,
      width: this.options.width,
      left: this.getLeftOffset()
    };
  };

  SimpleCrop.prototype.getLeftOffset = function() {
    return Math.ceil(this.$el.position().left);
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
