(function(global) {

    function extend(obj) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var name in source) if (source.hasOwnProperty(name))
                obj[name] = source[name];
        }
        return obj;
    }

    var EventEmitter = {
        on : function(type, handler) {
            this._ensureEvent(type);
            this._events[type].push(handler);
        },
        off : function(type, handler) {
            if (this._events && this._events[type]) {
                this._events[type] = this._events[type].filter(function(h) {
                    return h !== handler;
                });
            }
        },
        emit: function(type) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._ensureEvent(type);
            this._events[type].forEach(function(handler) {
                handler.apply(this, args);
            });
        },
        _ensureEvent: function(type) {
            if (!this._events) this._events = {};
            if (!this._events[type]) this._events[type] = [];
        }
    };

    function Vector2d(x, y) {
        this.x = x;
        this.y = y;
    }

    Object.defineProperty(Vector2d.prototype, 'length', {
        get        : function() { return Math.sqrt(this.x * this.x + this.y * this.y); },
        enumerable : true
    });

    Vector2d.prototype.add = function(v) {
        if (v instanceof this.constructor)
            return new this.constructor(this.x + v.x, this.y + v.y);
        else
            return new this.constructor(this.x + v, this.y + v);
    };

    Vector2d.prototype.sub = function(v) {
        if (v instanceof this.constructor)
            return this.add(v.neg());
        else
            return this.add(-v);
    };

    Vector2d.prototype.neg = function() {
        return new this.constructor(-this.x, -this.y);
    };

    Vector2d.prototype.scale = function(s) {
        return new this.constructor(this.x * s, this.y * s);
    };

    Vector2d.prototype.dot = function(v) {
        return this.x * v.x + this.y * v.y;
    };

    Vector2d.prototype.cross = function(v) {
        return this.x * v.y - this.y * v.x;
    };

    Vector2d.prototype.towards = function(other) {
        return other.sub(this).normalize();
    };

    Vector2d.prototype.normalize = function() {
        return this.scale(1 / this.length);
    };

    Vector2d.random = function(unit) {
        var r = Math.random() * Math.PI * 2,
            d = unit ? 1 : Math.random();
        return new this(
            d * Math.cos(r),
            d * Math.sin(r)
        );
    };

    Vector2d.randomWithin = function(rectangle) {
        return new this(
            rectangle.corner.x + Math.random() * rectangle.width,
            rectangle.corner.y + Math.random() * rectangle.height
        );
    };

    Vector2d.prototype.rotate = function(r) {
        return new this.constructor(
            this.x * Math.cos(r) - this.y * Math.sin(r),
            this.x * Math.sin(r) + this.y * Math.cos(r)
        );
    };

    Vector2d.prototype.clone = function() {
        return new this.constructor(this.x, this.y);
    };

    function BezierCurve(A, B, C, D) {
        this._A = A;
        this._B = B;
        this._C = C;
        this._D = D;
    };

    extend(BezierCurve.prototype, EventEmitter);

    ['A', 'B', 'C', 'D'].forEach(function(pt) {
        Object.defineProperty(BezierCurve.prototype, pt, {
            get: function() { return this['_' + pt]; },
            set: function(v) {
                this['_' + pt] = v;
                this.emit('change', pt);
            }
        });
    });

    BezierCurve.prototype.interpolate = function(t) {
        var tt = t * t,
            ttt = tt * t,
            u = 1 - t,
            uu = u * u,
            uuu = uu * u;

        return this.A.scale(uuu).
                    add(this.B.scale(3 * uu * t)).
                    add(this.C.scale(3 * u * tt)).
                    add(this.D.scale(ttt));
    };

    // Derivative to determine the curve's slope.
    BezierCurve.prototype.direction = function(t) {
        var tt = t * t,
            g = (t - 1) * (t - 1),
            h = -3 * tt + 4 * t - 1,
            i = 3 * tt - 2 * t,
            j = - tt;

        return this.A.scale(g).
                    add(this.B.scale(h)).
                    add(this.C.scale(i)).
                    add(this.D.scale(j)).
                    scale(-3);
    };

    function AnimationGenerator(options) {
        this.options = extend({}, this.constructor.defaults, options || {});
    }

    AnimationGenerator.defaults = {
        segments        : 128,
        orientAlongPath : false,
        maxError        : 1,
        name            : 'CUSTOM_ANIMATION'
    };

    AnimationGenerator.prototype.generate = function(bezier) {
        return this.generateAnimation(this.generatePointList(bezier));
    };

    AnimationGenerator.prototype.generatePointList = function(bezier) {
        var increment = 1 / this.options.segments,
            points = [],
            i, p, t, d, pa, n, minD, minError = 0, idx;

        for (var i = 0; i <= this.options.segments; i++) {
            var t = i * increment,
                p = bezier.interpolate(t);
            p.t = t;
            p.dir = bezier.direction(t);
            p.angle = -Math.atan2(p.dir.x, p.dir.y) / Math.PI * 180;
            points.push(p);
        }

        // Cull as many points as possible from the generated segments
        // while the error is less than the maximum allowed.
        do {
            if (points.length == 2) break;

            idx      = null;
            minError = Infinity;

            for (i = 1; i < points.length - 1; i++) {
                n = points[i-1].towards(points[i+1]);
                pa = points[i-1].sub(points[i]);
                d = pa.sub(n.scale(pa.dot(n))).length;
                if (d < minError && d < this.options.maxError) {
                    minError = d;
                    idx = i;
                }
            }

            if (idx != null) points.splice(idx, 1);

        } while (minError <= this.options.maxError)

        return points;
    }

    AnimationGenerator.prototype.generateAnimation = function(pointList) {
        var i, rollingSum = 0, total = 0,
            animation = ['@-webkit-keyframes ' + this.options.name + ' {'];

        pointList[0].l = 0;
        for (i = 1; i < pointList.length; i++) {
            total += pointList[i].l = pointList[i].sub(pointList[i-1]).length;
        }

        for (i = 0; i < pointList.length; i++) {
            rollingSum += pointList[i].l;
            animation.push(this._generateKeyframe(rollingSum / total, pointList[i]));
        }

        animation.push('}');
        return animation.join('\n');
    };

    AnimationGenerator.prototype._generateKeyframe = function(position, point) {
        var extras = '';
        if (this.options.orientAlongPath) {
            extras = 'rotate(' + point.angle.toFixed(1) + 'deg)';
        }
        return '  ' + (position * 100).toFixed(4) + '% { -webkit-transform: translate(' + (point.x.toFixed(1)) + 'px, ' + (point.y.toFixed(1)) + 'px) ' + extras + '; }';
    };

    // exports
    global.Vector2d           = Vector2d;
    global.BezierCurve        = BezierCurve;
    global.AnimationGenerator = AnimationGenerator;

})((typeof module != 'undefined' && module.exports) ? module.exports : window);