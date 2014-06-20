# simplecrop

A simple, lightweight UI for image cropping

Supports horizontal and vertial cropping

![](http://cl.ly/image/2q0p1E1M0m3b/horizontal-dog.gif)
![](http://cl.ly/image/462T0g1w0V1q/vertical-angel.gif)

## Install

Copy the css and js file from src/ to your project and require as needed.

## Usage

```
$('.croppable').simplecrop(options);
```

See test.html for a complete example.

## Options

* width (default: options height or element height)
* height (default: options width or element height)
* offset (default: 0.5)
* scale (default: 1)

## Events

* cropstart (fires when user starts dragging)
* cropend (fires when user stops dragging)

`cropend` also includes dimensions (top, left, width, height) with the callback to passed to your code.

```javascript
$(document).on('cropend', function(e, dimensions) {
  console.log(dimensions);
});
```

## License

MIT (c) 2014 Zeumo
