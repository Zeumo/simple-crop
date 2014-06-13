# simplecrop

A simple, lightweight UI for image cropping

## Usage

```
$('.croppable').simplecrop(options);
```

See test.html for a complete example.

## Options

* width (default: options height or element height)
* height (default: options width or element height)
* offset (default: 0.5)

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
