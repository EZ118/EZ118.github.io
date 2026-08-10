
$(function () {
    var canvas = document.getElementById('radianceCanvas');
    var ctx = canvas.getContext('2d');
    var width, height, animId;

    function getCenter() {
        var wrap = $('.portrait-wrap');
        if (!wrap.length) return { x: $(window).width() / 2, y: $(window).height() / 2 };
        var rect = wrap[0].getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    function resize() {
        width = $(window).width();
        height = $(window).height();
        canvas.width = width;
        canvas.height = height;
    }

    function draw(t) {
        ctx.clearRect(0, 0, width, height);
        var c = getCenter();
        var cx = c.x, cy = c.y;
        var time = t * 0.001;
        var maxDim = Math.max(width, height);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (var i = 0; i < 8; i++) {
            var pulse = Math.sin(time * 2.5 + i * 0.7) * 0.25 + 0.85;
            var radius = maxDim * (0.6 + i * 0.15) * pulse;
            var grad = ctx.createRadialGradient(cx, cy, 15, cx, cy, radius);
            var a1 = 0.5 - i * 0.05;
            var a2 = 0.25 - i * 0.03;
            grad.addColorStop(0, 'rgba(255,255,200,' + a1 + ')');
            grad.addColorStop(0.2, 'rgba(255,220,100,' + (a1 * 0.9) + ')');
            grad.addColorStop(0.5, 'rgba(255,180,30,' + a2 + ')');
            grad.addColorStop(0.8, 'rgba(255,140,0,0.1)');
            grad.addColorStop(1, 'rgba(255,80,0,0)');
            ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad; ctx.fill();
        }

        for (var j = 0; j < 120; j++) {
            var angle = (j / 120) * Math.PI * 2 + time * 0.2;
            var lenVar = Math.sin(time * 4.5 + j * 1.3) * 0.35 + 0.75;
            var length = maxDim * 1.2 * lenVar;
            var alpha = 0.15 + Math.abs(Math.sin(time * 6 + j * 0.5)) * 0.35;
            var endX = cx + Math.cos(angle) * length;
            var endY = cy + Math.sin(angle) * length;
            var grad = ctx.createLinearGradient(cx, cy, endX, endY);
            grad.addColorStop(0, 'rgba(255,255,220,' + alpha + ')');
            grad.addColorStop(0.3, 'rgba(255,210,80,' + (alpha * 0.8) + ')');
            grad.addColorStop(0.7, 'rgba(255,160,20,' + (alpha * 0.4) + ')');
            grad.addColorStop(1, 'rgba(255,100,0,0)');
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(endX, endY);
            ctx.strokeStyle = grad; ctx.lineWidth = 1.2 + Math.sin(time * 3 + j) * 0.5;
            ctx.stroke();
        }

        for (var k = 0; k < 80; k++) {
            var angle = (k / 80) * Math.PI * 2 + time * 0.35;
            var length = maxDim * 0.5 * (0.6 + Math.sin(time * 7 + k) * 0.3);
            var alpha = 0.2 + Math.sin(time * 8 + k * 0.8) * 0.2;
            var endX = cx + Math.cos(angle) * length;
            var endY = cy + Math.sin(angle) * length;
            var grad = ctx.createLinearGradient(cx, cy, endX, endY);
            grad.addColorStop(0, 'rgba(255,255,200,' + alpha + ')');
            grad.addColorStop(1, 'rgba(255,150,0,0)');
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(endX, endY);
            ctx.strokeStyle = grad; ctx.lineWidth = 1.8 + Math.sin(time * 5 + k) * 0.7;
            ctx.stroke();
        }

        for (var s = 0; s < 150; s++) {
            var seed = s * 17.3;
            var angle = (seed % 360) * Math.PI / 180 + time * 0.25;
            var dist = maxDim * 0.9 * (0.2 + (s % 10) * 0.08 + Math.sin(time * 3 + s) * 0.1);
            var sx = cx + Math.cos(angle) * dist;
            var sy = cy + Math.sin(angle) * dist;
            var sparkAlpha = 0.3 + Math.sin(time * 9 + s * 1.7) * 0.3;
            if (sparkAlpha > 0.2) {
                ctx.beginPath();
                ctx.arc(sx, sy, 1.5 + Math.random() * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,220,' + sparkAlpha + ')';
                ctx.fill();
                var starSize = 4 + Math.random() * 4;
                ctx.strokeStyle = 'rgba(255,255,200,' + (sparkAlpha * 0.7) + ')';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(sx - starSize, sy);
                ctx.lineTo(sx + starSize, sy);
                ctx.moveTo(sx, sy - starSize);
                ctx.lineTo(sx, sy + starSize);
                ctx.stroke();
            }
        }

        for (var a = 0; a < 40; a++) {
            var angle = (a / 40) * Math.PI * 2 + time * 0.6;
            var radius = maxDim * (0.35 + Math.sin(time * 2 + a) * 0.1);
            var ax = cx + Math.cos(angle) * radius;
            var ay = cy + Math.sin(angle) * radius;
            var alpha = 0.2 + Math.sin(time * 7 + a) * 0.2;
            ctx.beginPath();
            ctx.arc(ax, ay, 2 + Math.sin(time * 6 + a) * 1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,240,150,' + alpha + ')';
            ctx.fill();
        }

        ctx.restore();
        animId = requestAnimationFrame(draw);
    }

    $(window).on('resize', resize);
    resize();
    animId = requestAnimationFrame(draw);
    $(window).on('beforeunload', function () {
        if (animId) cancelAnimationFrame(animId);
    });
});