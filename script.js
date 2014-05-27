/*jshint asi:true*/
(function() {
    var c = document.getElementById('canvas'),
        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
        cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame,
        ctx = c.getContext('2d'),
        start = Math.floor(Math.random() * 360),
        stop = start - 180,
        colorStep = 0.15,
        line = 0.01,
        lineStep = 0.001,
        flag = true,
        linear,
        animation,
        counter = document.getElementById('count'),
        orientationDetect = ('ondeviceorientation' in window && 'ontouchstart' in window)

    function draw(e, timestamp) {
        var y

        ctx.clearRect(0,0, c.width, c.height)
        linear = ctx.createLinearGradient(0,0, c.width, c.height)

        if ( start > 360 ) { start = 0 }
        if ( stop > 360 ) { stop = 0 }

        if ( orientationDetect && e !== undefined) {
            y = e.gamma
            y += 90
            if ( y > 180 ) { y = 180 }
            if ( y < 0 ) { y = 0 }
            line = y/180
        } else {
            if ( flag ) {
                line += lineStep
            } else {
                line -= lineStep
            }
            if ( line > 1 ) {
                line = 1; flag = false;
            } else if ( line < 0 ) {
                line = 0; flag = true;
            }
        }

        linear.addColorStop(0,      'hsla(' + start +', 50%, 50%, 0.25)')
        linear.addColorStop(line,   'hsla(' + stop  +', 50%, 40%, 1)')
        linear.addColorStop(1,      'hsla(' + start +', 50%, 50%, 0.25)')

        ctx.fillStyle = linear
        ctx.fillRect(0,0, c.width, c.height)

        start += colorStep
        stop = (stop + colorStep > -colorStep && stop < 0) ? stop = 0 : stop + colorStep

        if ( !orientationDetect ) {
            animation = requestAnimationFrame(draw)
        }
    }

    function orientationHandler(e) {
        requestAnimationFrame(draw.bind(null,e))
    }

    function resizeCanvas() {
        c.width = window.innerWidth
        c.height = window.innerHeight
    }

    function debounce(fn, threshold, execAsap) {
        var timeout

        return function debounced() {
            var obj = this,
                args = arguments

            function delayed() {
                if (!execAsap) {
                    fn.apply(obj, args)
                }
                timeout = null
            }

            if (timeout) {
                clearTimeout(timeout)
            } else if (execAsap) {
                fn.apply(obj, args)
            }

            timeout = setTimeout(delayed, threshold || 100)
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        resizeCanvas()
        play.classList.add('active')

        draw()

        if ( orientationDetect ) {
            cancelAnimationFrame(animation)
            window.addEventListener('deviceorientation', orientationHandler, false)
        }
    }, false)

    play.addEventListener('click', function(e) {
        play.classList.add('active')
        pause.classList.remove('active')

        if ( orientationDetect ) {
            window.addEventListener('deviceorientation', orientationHandler, false)
        } else {
            draw()
        }
    }, false)

    pause.addEventListener('click', function() {
        play.classList.remove('active')
        pause.classList.add('active')

        if ( orientationDetect ) {
            window.removeEventListener('deviceorientation', orientationHandler)
        } else {
            cancelAnimationFrame(animation)
        }
    })

    window.addEventListener('resize', debounce(resizeCanvas), true)

    if (orientationDetect) {
        [play, pause].forEach(function(el) {
            el.style.display = 'none'
        })
    }

    if ( orientationDetect ) {
        setTimeout(function show() {
            document.getElementById('container').classList.add('show')

            setTimeout(function hide() {
                document.getElementById('container').classList.remove('show')
            }, 1000)
        }, 5000)
    }
})()
