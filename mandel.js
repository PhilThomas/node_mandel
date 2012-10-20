var width ;
var height;
var cx;
var cy;
var scale;
var k;

function show_mandel(element)
{
    var src = 'mandelbrot.png' + '?' +
        'width=' + width + '&' +
        'height=' + height + '&' +
        'cx=' + cx + '&' +
        'cy=' + cy + '&' +
        'scale=' + scale + '&' +
        'k=' + k;
    element.innerHTML='<img src="' + src + '"/>';
}

function load_it(event, name) {
    var element = document.getElementById(name);

    width = 640;
    height = 640;
    cx = 0.0;
    cy = 0.0;
    scale = 1.0;
    k = 1000;
    
    show_mandel(element);
}

function point_it(event, name){
    var element = document.getElementById(name);
    
    var pos_x = event.offsetX?(event.offsetX):event.pageX-element.offsetLeft;
    var pos_y = event.offsetY?(event.offsetY):event.pageY-element.offsetTop;
    
    var x0 = cx - 4/(scale*2);
    var y0 = cy + 4/(scale*2);
    var dx = 4/(scale*width);
    var dy = 4/(scale*height);
    
    cx = x0+pos_x*dx;
    cy = y0-pos_y*dy;
    
    scale *= 2;
    //k = 10000;
    show_mandel(element);
}
