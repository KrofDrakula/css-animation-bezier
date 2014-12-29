$(function() {

    var container = $('#container'),
        animatable = $('#animatable'),
        renderer  = new Renderer({
            container: container.get(0),
            generator: new AnimationGenerator
        }),
        points = {},
        curve = new BezierCurve(
            new Vector2d(0, 0),
            new Vector2d(50, 0),
            new Vector2d(50, 100),
            new Vector2d(100, 100)
        ),
        base = new Vector2d(
            Math.round(window.innerWidth / 2) - 5,
            Math.round(window.innerHeight / 2) - 5
        );
    
    ['A', 'B', 'C', 'D'].forEach(function(pt) {
        var node = $('<div class="node"><span>' + pt + '</span></div>').appendTo(container);
        points[pt] = node;
        updatePoint(pt);

        node.draggable({
            start : update,
            drag  : update,
            stop  : update
        });

        function update() {
            if (pt == 'A') {
                curve.B = new Vector2d(
                    curve.B.x + node.offset().left - curve.A.x - base.x,
                    curve.B.y + node.offset().top - curve.A.y - base.y
                );
            } else if (pt == 'D') {
                curve.C = new Vector2d(
                    curve.C.x + node.offset().left - curve.D.x - base.x,
                    curve.C.y + node.offset().top - curve.D.y - base.y
                );
            }
            curve[pt] = new Vector2d(
                node.offset().left - base.x,
                node.offset().top - base.y
            )
            renderer.draw(curve);
        }
    });

    curve.on('change', function(pt) {
        updatePoint(pt);
        renderer.draw(curve);
    });

    container.find('.params').draggable();

    $('[name$=x],[name$=y]').change(function() {
        var point = $(this).attr('name')[0];
        curve[point] = new Vector2d(
            parseFloat($('[name=' + point + 'x]').val(), 10),
            parseFloat($('[name=' + point + 'y]').val(), 10)
        );
    });

    $('[data-action=run]').click(function() {
        var style = $('<style></style>');
        style.text(renderer.generator.generate(curve));
        style.appendTo('head');
        animatable.on('webkitAnimationEnd', function() {
            animatable.hide().css('-webkit-animation', '');
            style.remove();
        });
        setTimeout(function() {
            animatable.show().css('-webkit-animation', 'CUSTOM_ANIMATION ' + $('[name=anim_length]').val() + 's linear forwards');
        });
    });

    function updatePoint(pt) {
        points[pt].css({
            left: curve[pt].x + base.x + 'px',
            top: curve[pt].y + base.y + 'px'
        });
        container.find('[name=' + pt + 'x]').val(curve[pt].x);
        container.find('[name=' + pt + 'y]').val(curve[pt].y);
    }

    renderer.draw(curve);

});