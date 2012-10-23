var width = 640;
var height = 640;
var cx = 0.0;
var cy = 0.0;
var scale = 1.0;
var k = 1000;

$(document).ready(function () {
    $('body').append("<img id='mandel'/>");
    
    $('#mandel').load(function() {
        $('#mandel').fadeIn();
    });
    
    $('#mandel').click(function(event) {
        var pos_x = event.pageX - $(this).position().left;
        var pos_y = event.pageY - $(this).position().top;
        
        var x0 = cx - 4/(scale*2);
        var y0 = cy + 4/(scale*2);
        var dx = 4/(scale*width);
        var dy = 4/(scale*height);
        
        cx = x0+pos_x*dx;
        cy = y0-pos_y*dy;
        
        scale *= 2;
        //k = 10000;
        show_mandel();
    });
    
    show_mandel();
});

function show_mandel()
{
    var src = 'cmandelbrot.png' + '?' + $.param({
        width: width,
        height: height,
        cx: cx,
        cy: cy,
        scale: scale,
        k: k});
        
    $('#mandel').fadeOut();
    $('#mandel').attr('src', src);
}
