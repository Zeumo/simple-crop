/*
 *  simple-crop - v1.0.0
 *  MIT (c) 2014 Zeumo, Inc
 */

/* jshint strict: false */

(function(window, $) {
  var SimpleCrop, pluginName = 'simplecrop';

  SimpleCrop = function(el, options) {
    this.el      = el;
    this.$el     = $(el);
    this.options = $.extend({
      scale: 1,
      offset: 0.5,
      height: options.width || this.$el.height(),
      width: options.height || this.$el.height()
    }, options);

    this.$el.load($.proxy(function() {
      this.originalDimensions  = {
        width: this.$el.width(),
        height: this.$el.height()
      };

      this.orientation = this.originalDimensions.width < this.originalDimensions.height ? 'portrait' : 'landscape';
      this.portrait    = this.orientation === 'portrait';
      this.landscape   = this.orientation === 'landscape';

      if (this.originalDimensions.width === this.originalDimensions.height) {
        this.orientation = 'square';
        this.square      = true;
        this.portrait    = false;
        this.landscape   = false;
      }

      this.setupUI();
      this.setupDraggable();
    }, this));

    return this;
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

        if (self.square) { return; }

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
    this.$el.height('auto');
    this.setMaxDimensions();

    this.dimensions  = {
      width: this.$el.width(),
      height: this.$el.height()
    };

    if (this.dimensions.height < this.options.height) {
      this.$el.height(this.options.height);
    }

    if (!this.$el.parents('.simplecrop-container').length) {
      this.$el.wrap('<div class="simplecrop-container"><div class="simplecrop-constraint">');
    }

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

    if (width > this.options.width && !this.square) {
      position.left = (width - this.options.width) * -this.options.offset;
    }

    if (height > this.options.height && !this.square) {
      position.top = (height - this.options.height) * -this.options.offset;
    }

    return position;
  };

  SimpleCrop.prototype.setMaxDimensions = function() {
    this.$el.css({
      maxHeight: (this.landscape ? this.options.height : 'none'),
      maxWidth: (this.portrait ? this.options.width : 'none')
    });

    if (this.square) {
      this.$el.css({
        maxHeight: '100%',
        maxWidth: '100%'
      });
    }
  };

  SimpleCrop.prototype.getDimensions = function() {
    var position = this.getPosition();

    return {
      height: this.options.height * this.options.scale,
      width: this.options.width * this.options.scale,
      left: position.left * this.options.scale,
      top: position.top * this.options.scale
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
