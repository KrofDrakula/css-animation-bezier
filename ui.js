(function() {
    
    function Renderer(options) {
        this.container     = options.container;
        this.generator     = options.generator;
        this.canvas        = this.container.querySelector('canvas');
        this.params        = this.container.querySelector('.params');
        this.anim          = this.container.querySelector('.generated');
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    var proto = Renderer.prototype;

    Renderer.prototype.draw = function(curve) {
        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = 'none';

        var base = new Vector2d(Math.round(this.canvas.width / 2) + 0.5, Math.round(this.canvas.height / 2) + 0.5);
        ctx.save();
        ctx.translate(base.x, base.y);

        this.drawOrigin(ctx);
        this.drawBezier(ctx, curve);
        this.drawSegments(ctx, curve);
        ctx.restore();

    };

    Renderer.prototype.drawOrigin = function(ctx) {
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth   = 1;

        // vertical axis
        ctx.beginPath();
        ctx.moveTo(0, -window.innerHeight);
        ctx.lineTo(0, window.innerHeight);
        ctx.stroke();

        // horizontal axis
        ctx.beginPath();
        ctx.moveTo(-window.innerWidth, 0);
        ctx.lineTo(window.innerWidth, 0);
        ctx.stroke();
    };

    Renderer.prototype.drawBezier = function(ctx, curve) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth   = 3;

        ctx.beginPath();
        ctx.moveTo(curve.A.x, curve.A.y);
        ctx.bezierCurveTo(curve.B.x, curve.B.y, curve.C.x, curve.C.y, curve.D.x, curve.D.y);
        ctx.stroke();

        ctx.strokeStyle = '#bbb';
        ctx.lineWidth   = 1;

        ctx.beginPath();
        ctx.moveTo(curve.A.x, curve.A.y);
        ctx.lineTo(curve.B.x, curve.B.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(curve.D.x, curve.D.y);
        ctx.lineTo(curve.C.x, curve.C.y);
        ctx.stroke();
    };

    Renderer.prototype.drawSegments = function(ctx, curve) {
        var points = this.generator.generatePointList(curve);

        // Draw the individual linear segment points as circles
        ctx.strokeStyle = 'rgba(0,0,255,0.6)';
        ctx.lineWidth = 1;
        for (var i = 1; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 3, 0, 2 * Math.PI, true);
            ctx.stroke();
        }

        // Draw the linear line segment approximation
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        // Uncomment these lines to draw the curve's slope at that point
        // ctx.strokeStyle = 'rgba(0,255,0,0.5)';
        // ctx.lineWidth = 1;
        // for (var i = 1; i < points.length; i++) {
        //     ctx.beginPath();
        //     ctx.moveTo(points[i].x, points[i].y);
        //     ctx.lineTo(points[i].x + points[i].dir.x, points[i].y + points[i].dir.y);
        //     ctx.stroke();
        // }

        $(this.anim).val(this.generator.generate(curve));
    }

    this.Renderer = Renderer;

})();