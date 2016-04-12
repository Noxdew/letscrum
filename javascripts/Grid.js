(function($) {
    var width, height, canvas, ctx, points, target, animateHeader = true;
    var background;
    $(function() {
        // initHeader();
        // initAnimation();
        canvas = document.getElementById("bgcanvas");
        background = $($(".color-bg")[0]);
        addListeners();
    });

    var opacityScale = 0.6;

    var bgColorPerSection = [
        [244, 248, 250],
        [235, 242, 255],
        [234, 231, 249]
    ];

    var colorPerSection = [
        [91, 100, 172],
        [153, 156, 204],
        [158, 192, 240]
    ];

    var lastColor = colorPerSection[0];
    var strokecolor = colorToString.apply(this, lastColor);
    var lastBGColor = bgColorPerSection[0];

    var colorChange = [
        //start, r, g, b
        // [0, 0, 0, 255],
        // [500, 255, 0, 0],
    ];

    var bgColorChange = [];

    function generateColorChangeArray() {
        var sections = $(".fill-screen");
        sections.each(function(i, sec) {
            var elemRect = sec.getBoundingClientRect();
            colorChange.push([elemRect.top].concat(colorPerSection[i]));
            bgColorChange.push([elemRect.top].concat(bgColorPerSection[i]));
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
        var maximumIndex = colorChange.length;

        for (var i = maximumIndex - 1; i >= 0; i--) {
            if (scrollValue > colorChange[i][0]) {
                console.log(scrollValue)
                if (i == maximumIndex - 1) {
                    strokecolor = colorToString.apply(this, colorChange[i].slice(1));
                    background.css("background-color", "rgb(" + colorToString.apply(this, bgColorChange[i].slice(1)) + ")");
                } else {
                    var lowerBound = colorChange[i][0];
                    var time = (scrollValue - lowerBound) / (colorChange[i + 1][0] - lowerBound);
                    strokecolor = colorToString(
                        clamp(0, 255, linearBezier(colorChange[i][1], colorChange[i + 1][1], time)).toFixed(0),
                        clamp(0, 255, linearBezier(colorChange[i][2], colorChange[i + 1][2], time)).toFixed(0),
                        clamp(0, 255, linearBezier(colorChange[i][3], colorChange[i + 1][3], time)).toFixed(0));

                    background.css("background-color", "rgb(" + colorToString(
                        clamp(0, 255, linearBezier(bgColorChange[i][1], bgColorChange[i + 1][1], time)).toFixed(0),
                        clamp(0, 255, linearBezier(bgColorChange[i][2], bgColorChange[i + 1][2], time)).toFixed(0),
                        clamp(0, 255, linearBezier(bgColorChange[i][3], bgColorChange[i + 1][3], time)).toFixed(0)) + ")");
                }
                return;
            }
        }
        strokecolor = colorToString.apply(this, colorChange[0].slice(1));
        background.css("background-color", "rgb(" + colorToString.apply(this, bgColorChange[0].slice(1)) + ")");
    }

    function getHeight() {
        return $(document.body).height() - $("#footer").innerHeight();
    }

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {
            x: width / 2,
            y: height / 2
        };
        width = $(document.body).width();
        height = getHeight();
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
        height = getHeight();
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
