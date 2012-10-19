var http = require('http');
var spawn = require("child_process").spawn;
var parse = require('url').parse;

var PORT = process.env.PORT;
var IP = process.env.IP;

function mandel(x, y, k)
{
    var zi = 0.0;
    var zq = 0.0;
    for(var i = 0; i < k; i++) {
        var ztmp = zi*zi - zq*zq + x;
        zq = 2*zi*zq + y;
        zi = ztmp;
        
        if((zi*zi + zq*zq) >= 4.0)
            return i;
    }
    
    return k;
}

function handleRoot(url, request, response)
{
    response.writeHead(200, {'Content-Type': 'text/html'});
    /*jshint multistr:true */
    response.end('\
    <html>\n\
    <head>\n\
    <script language="JavaScript">\n\
    function point_it(event){\n\
        var mandel = document.getElementById("mandel");\n\
        var pos_x = event.offsetX?(event.offsetX):event.pageX-mandel.offsetLeft;\n\
        var pos_y = event.offsetY?(event.offsetY):event.pageY-mandel.offsetTop;\n\
        var src = "mandelbrot.png?pos_x="+pos_x+"&pos_y="+pos_y;\n\
        mandel.src = src;\n\
    }\n\
    </script>\n\
    </head>\n\
    <body>\n\
    <div id="mandel" onclick="point_it(event)">\n\
    <img src="mandelbrot.png"/>\n\
    </div>\n\
    <div id="text"/>\n\
    </body>\n\
    </html>\n');
    /*jshint multistr:false */
}

function handleMandelbrot(url, request, response)
{
    var width = parseInt(url.query.width) || 640;
    var height = parseInt(url.query.height) || 640;
    var cx = parseFloat(url.query.cx) || -1.0;
    var cy = parseFloat(url.query.cy) || 0.0;
    var scale = parseFloat(url.query.scale) || 3.0;
    var k = parseInt(url.query.k) || (1<<12);
    
    var buf = new Buffer(width*height*3);
    
    var i = 0;
    var x0 = cx - 4/(scale*2);
    var y0 = cy + 4/(scale*2);
    var dx = 4/(scale*width);
    var dy = 4/(scale*height);
    
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            var c = ((1<<24)-1) * (mandel(x0+x*dx, y0-y*dy, k) / k);
            buf[i++] = ~((c >> 0) & 0xff);
            buf[i++] = ~((c >> 8) & 0xff);
            buf[i++] = ~((c >> 16) & 0xff);
        }
    }
    
    var convert = spawn('convert', ['-size', width+'x'+height, '-depth', '8', 'rgb:-', 'png:-']);

    response.writeHead(200, {'Content-Type': 'image/png'});

	// Write the output of convert straight to the response
	convert.stdout.on('data', function(data) {
		response.write(data);
	});

	// When we're done rendering, we're done
	convert.on('exit', function(code) {
		response.end();
	});
    
    // Pump in the raw content
    convert.stdin.write(buf);
    convert.stdin.end();
}

var handlers = {
    '/': handleRoot,
    '/mandelbrot.png': handleMandelbrot
};
    
http.createServer(function (request, response) {
    var url = parse(request.url, true);
    var handler = handlers[url.pathname];
    if(handler) {
        handler(url, request, response);
    }
    else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Oh Snap! ' + request.url);
    }
}).listen(PORT, IP);

//console.log('Server running at http://'+IP+':'+PORT+'/');
