/*
 *  simple-crop - v1.1.0
 *  MIT (c) 2014 Zeumo, Inc
 */

(function(window, $) {
  'use strict';

  var SimpleCrop, pluginName = 'simplecrop';

  SimpleCrop = function(el, options) {
    this.el  = el;
    this.$el = $(el);

    if (!options) { options = {}; }

    this.options = $.extend({
      scale: 1,
      offset: 0.5,
      height: options.width || this.$el.height(),
      width: options.height || this.$el.height()
    }, options);

    this.createContainers();
    this.onLoad();
  };

  $.extend(SimpleCrop.prototype, {
    onLoad: function() {
      this.$el.load($.proxy(function() {
        this.naturalDimensions = {
          width: this.$el.width(),
          height: this.$el.height()
        };

        this.orientation = this.getOrientation();
        this.portrait    = this.orientation === 'portrait';
        this.landscape   = this.orientation === 'landscape';
        this.square      = this.orientation === 'square';

        this.setupUI();
        this.setupDraggable();
      }, this));
    },

    destroy: function() {
      $.removeData(this.$el[0]);
    },

    getOrientation: function() {
      var width  = this.naturalDimensions.width,
          height = this.naturalDimensions.height;

      if (width > height) {
        return 'landscape';
      } else if(width < height) {
        return 'portrait';
      } else {
        return 'square';
      }
    },

    setupDraggable: function() {
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
          $(window)
            .off('mousemove.simplecrop')
            .on('mousemove.simplecrop', function(e) {
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
          $(window).off('mousemove.simplecrop');
          self.$el.trigger('cropend', [self.getDimensions()]);
        }
      };

      this.$constraint.on('mousedown.simplecrop', drag.start);
      $(window).on('mouseup.simplecrop', drag.stop);
    },

    setupUI: function() {
      this.resetContainers();
      this.setMaxDimensions();

      this.dimensions = {
        width: this.$el.width(),
        height: this.$el.height()
      };

      this.$constraint
        .width(this.options.width)
        .height(this.options.height)
        .addClass(this.orientation);

      this.$el.css(this.startingPosition());
    },

    createContainers: function() {
      this.$el.wrap('<div class="simplecrop-container"><div class="simplecrop-constraint">');
      this.getContainers();
    },

    getContainers: function() {
      this.$constraint = this.$el.parent('.simplecrop-constraint');
      this.$container  = this.$el.parents('.simplecrop-container');
    },

    resetContainers: function() {
      this.getContainers();

      if (this.$constraint.length) {
        this.$constraint
          .removeClass('portrait landscape square')
          .attr('style', '');
      } else {
        this.createContainers();
      }
    },

    startingPosition: function() {
      var position = {
            left: 0,
            top: 0
          },
          width  = this.dimensions.width,
          height = this.dimensions.height;

      if (!this.square) {
        if (width > this.options.width) {
          position.left = (width - this.options.width) * -this.options.offset;
        }

        if (height > this.options.height) {
          position.top = (height - this.options.height) * -this.options.offset;
        }
      }

      return position;
    },

    setMaxDimensions: function() {
      if (this.square) {
        this.$el.css({
          maxHeight: '100%',
          maxWidth: '100%'
        });
      } else {
        this.$el.css({
          maxHeight: (this.landscape ? this.options.height : 'none'),
          maxWidth: (this.portrait ? this.options.width : 'none')
        });
      }
    },

    getDimensions: function() {
      var position = this.getPosition();

      return {
        height: this.getScaleHeight(),
        width: this.getScaleWidth(),
        left: position.left * this.options.scale,
        top: position.top * this.options.scale
      };
    },

    getScaleHeight: function() {
      return this.options.height * this.options.scale;
    },

    getScaleWidth: function() {
      return this.options.width * this.options.scale;
    },

    getPosition: function() {
      return this.$el.position();
    },
  });

  $.fn[pluginName] = function (options) {
    this.each(function() {
      if (!$.data(this, pluginName)) {
        $.data(this, pluginName, new SimpleCrop(this, options));
      }
    });
    return this;
  };

}(this, jQuery));
