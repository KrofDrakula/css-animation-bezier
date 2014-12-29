css-animation-bezier
====================

A tool for generating CSS3 Animation using linear approximated Bézier paths.

Try out the generator live in your browser right now!

http://krofdrakula.github.io/css-animation-bezier/

[![images/demo.gif](Animated demo)](http://krofdrakula.github.io/css-animation-bezier/)

Contributions welcome.

Usage
-----

Include `curves[.min].js` on your page (or `require` the file using NodeJS). To create a curve, instantiate a new Bézier curve instance:

```js
var b = new BezierCurve(
    new Vector2d(10, 10),
    new Vector2d(40, 10),
    new Vector2d(10, 40),
    new Vector2d(40, 40)
);
 
var g = new AnimationGenerator;
 
console.log(g.generate(b));
```

This will output the stylesheet content as a string to the console.

Internals
---------

The library uses line segments to approximate the Bézier curve. It implements a very simple an naïve optimization algorithm that eliminates redundant line segments that do not contribute to the curve reproduction fidelity. The curve ends up using more line segments where the curve's slope varies more.

It could be improved further by using more advanced techniques, but it satisfies the need for speed and quality I had for the project I was working on. YMMV. Perhaps someone can enlighten me on a better way to approach this.

Browser Compatibility
---------------------

The library currently generates WebKit-prefixed stylesheet content, but will be upgraded later for runtime determination.