window.initCanvas = function() {

    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;
    var isDark = document.documentElement.classList.contains('dark') || 
                 (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width/2, y: height/2};

        largeHeader = document.getElementById('large-header');
        if (largeHeader) {
            largeHeader.style.height = height+'px';
        }

        canvas = document.getElementById('demo-canvas');
        if (!canvas) return; 

        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // Check theme again more reliably
        var bodyClass = document.body.className;
        var htmlClass = document.documentElement.className;
        isDark = htmlClass.includes('dark') || bodyClass.includes('dark');

        // create points - denser for antigravity feel
        points = [];
        var spacing = width > 768 ? 15 : 10;
        for(var x = 0; x < width; x = x + width/spacing) {
            for(var y = 0; y < height; y = y + height/spacing) {
                var px = x + Math.random()*width/spacing;
                var py = y + Math.random()*height/spacing;
                var p = {
                    x: px, 
                    originX: px, 
                    y: py, 
                    originY: py,
                    vx: Math.random() * 0.5 - 0.25, // velocity for "floating"
                    vy: Math.random() * 0.5 - 0.25
                };
                points.push(p);
            }
        }

        // find closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j];
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a circle to each point
        for(var i in points) {
            var c = new Circle(points[i], 1+Math.random()*2, isDark ? 'rgba(34,211,238,0.3)' : 'rgba(8,145,178,0.3)');
            points[i].circle = c;
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = posy = 0;
        if (e.clientX || e.clientY) {
            posx = e.clientX;
            posy = e.clientY;
        } else if (e.pageX || e.pageY) {
            posx = e.pageX - (document.body.scrollLeft + document.documentElement.scrollLeft);
            posy = e.pageY - (document.body.scrollTop + document.documentElement.scrollTop);
        }
        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        if (largeHeader) largeHeader.style.height = height+'px';
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
        }
    }

    // animation
    function initAnimation() {
        animate();
        for(var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if(animateHeader) {
            if (ctx) ctx.clearRect(0,0,width,height);
            
            // Re-check dark mode on each frame for theme toggles
            var htmlClass = document.documentElement.className;
            isDark = htmlClass.includes('dark');

            for(var i in points) {
                // Update floating position subtly
                points[i].x += points[i].vx;
                points[i].y += points[i].vy;

                // Bounce off edges
                if (points[i].x < 0 || points[i].x > width) points[i].vx *= -1;
                if (points[i].y < 0 || points[i].y > height) points[i].vy *= -1;

                // detect points in range of mouse
                var dist = getDistance(target, points[i]);
                if(dist < 40000) { // increased range for interactivity
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if(dist < 80000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if(dist < 120000) {
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
        if (typeof TweenLite !== 'undefined') {
            // Antigravity drift: slow and wandering
            TweenLite.to(p, 4+2*Math.random(), {
                x: p.originX - 100 + Math.random() * 200,
                y: p.originY - 100 + Math.random() * 200, 
                ease: Sine.easeInOut,
                onComplete: function() {
                    shiftPoint(p);
                }
            });
        }
    }

    // Canvas manipulation
    function drawLines(p) {
        if(!p.active) return;
        if (!ctx) return;
        for(var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            
            // Antigravity cyan/blue glow
            var strokeColor = isDark ? 'rgba(34,211,238,' : 'rgba(8,145,178,';
            ctx.strokeStyle = strokeColor + p.active + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }

    function Circle(pos,rad,color) {
        var _this = this;

        // constructor
        _this.pos = pos || null;
        _this.radius = rad || null;
        _this.color = color || null;

        this.draw = function() {
            if(!_this.active) return;
            if (!ctx) return;
            
            // Add bloom/glow effect for antigravity feel
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            
            var fillColor = isDark ? 'rgba(34,211,238,' : 'rgba(8,145,178,';
            ctx.fillStyle = fillColor + _this.active + ')';
            
            if (isDark) {
                ctx.shadowBlur = 10 * _this.active;
                ctx.shadowColor = 'rgba(34,211,238, 0.5)';
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
    
};
