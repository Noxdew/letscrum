(function($) {
    var width, height, canvas, ctx, points, target, animateHeader = true;

    $(function() {
        // initHeader();
        // initAnimation();
        canvas = document.getElementById("bgcanvas");
        addListeners();
    });

    var opacityScale = 0.6;

    var colorPerSection = [
        [20, 255, 100],
        [77, 181, 255]
    ];

    var lastColor = colorPerSection[0];
    var strokecolor = colorToString.apply(this, lastColor);

    var colorChange = [
        //start, end, r, g, b
        // [0, 500, 0, 0, 255],
        // [500, 1000, 255, 0, 0],
    ];

    function generateColorChangeArray() {
        var sections = $(".fill-screen");
        sections.each(function(i, sec) {
            var elemRect = sec.getBoundingClientRect();
            colorChange.push([elemRect.top, elemRect.bottom].concat(colorPerSection[i]));
        });
    }
    generateColorChangeArray();

    function clamp(min, max, value) {
        return Math.min(Math.max(value, min), max);
    }

    function linearBezier(start, finish, time) {
        return start + time * (finish - start);
    }

    function colorToString(r, g, b) {
        return r + "," + g + "," + b;
    }

    function changeColor(scrollValue) {
        colorChange.some(function(row) {
            if (row[0] <= scrollValue && row[1] >= scrollValue) {
                time = (scrollValue - row[0]) / (row[1] - row[0]);
                strokecolor = colorToString(
                    clamp(0, 255, linearBezier(lastColor[0], row[2], time)).toFixed(0),
                    clamp(0, 255, linearBezier(lastColor[1], row[3], time)).toFixed(0),
                    clamp(0, 255, linearBezier(lastColor[2], row[4], time)).toFixed(0));
                // $(document.body).css("background-color", "rgb(" + strokecolor + ")");
                return true;
            }
        });
    }

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {
            x: width / 2,
            y: height / 2
        };
        width = $(document.body).width();
        height = $(document.body).height();
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext("2d");
        points = [];
        for (var x = 0; x < width; x = x + width / 20) {
            for (var y = 0; y < height; y = y + height / 20) {
                var px = x + Math.random() * width / 20;
                var py = y + Math.random() * height / 20;
                var p = {
                    x: px,
                    originX: px,
                    y: py,
                    originY: py
                };
                points.push(p);
            }
        }
        for (var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for (var j = 0; j < points.length; j++) {
                var p2 = points[j];
                if (p1 !== p2) {
                    var placed = false;
                    for (var k = 0; k < 5; k++) {
                        if (!placed) {
                            if (closest[k] === undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                    for (k = 0; k < 5; k++) {
                        if (!placed) {
                            if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }
        for (i in points) {
            var c = new Circle(points[i],2 + Math.random() * 2,"rgba(255,255,255,0.3)");
            points[i].circle = c;
        }
    }
    function addListeners() {
        if (!("ontouchstart" in window)) {
            window.addEventListener("mousemove", mouseMove);
        }
        window.addEventListener("scroll", scrollCheck);
        window.addEventListener("resize", resize);
    }
    function mouseMove(e) {
        var posx = 0;
        var posy = 0;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }
    function scrollCheck() {
        changeColor(document.body.scrollTop);
        if (document.body.scrollTop > height)
            animateHeader = false;
        else
            animateHeader = true;
    }
    function resize() {
        width = $(document.body).width();
        height = $(document.body).height();
        canvas.width = width;
        canvas.height = height;
        generateColorChangeArray();
        initHeader();
        initAnimation();
    }
    function initAnimation() {
        animate();
        for (var i in points) {
            shiftPoint(points[i]);
        }
    }
    function animate() {
        if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (var i in points) {
                if (Math.abs(getDistance(target, points[i])) < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if (Math.abs(getDistance(target, points[i])) < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if (Math.abs(getDistance(target, points[i])) < 40000) {
                    points[i].active = 0.02;
                    points[i].circle.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0;
                }
                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }
    function shiftPoint(p) {
        TweenLite.to(p, 1 + 1 * Math.random(), {
            x: p.originX - 50 + Math.random() * 100,
            y: p.originY - 50 + Math.random() * 100,
            ease: Circ.easeInOut,
            onComplete: function() {
                shiftPoint(p);
            }
        });
    }
    function drawLines(p) {
        if (!p.active)
            return;
        for (var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = "rgba(" + strokecolor + "," + p.active * opacityScale + ")";
            ctx.stroke();
        }
    }
    function Circle(pos, rad, color) {
        var _this = this;
        (function() {
            _this.pos = pos || null ;
            _this.radius = rad || null ;
            _this.color = color || null ;
        })();
        this.draw = function() {
            if (!_this.active)
                return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = "rgba(" + strokecolor + "," + _this.active * opacityScale + ")";
            ctx.fill();
        };
    }
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
})(jQuery);
