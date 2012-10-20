var http = require('http');
var spawn = require("child_process").spawn;
var parse = require('url').parse;
var fs = require('fs');

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

function sendFile(filename, contentType)
{
    return function(url, request, response)
    {
        response.writeHead(200, {'Content-Type': contentType});
        fs.readFile(filename, function(err, data) {
            if(err) throw err;
            response.end(data);
        });
    }
}

function handleMandelbrot(url, request, response)
{
    var width = parseInt(url.query.width, 10);
    var height = parseInt(url.query.height, 10);
    var cx = parseFloat(url.query.cx);
    var cy = parseFloat(url.query.cy);
    var scale = parseFloat(url.query.scale);
    var k = parseInt(url.query.k, 10);
    
    var buf = new Buffer(width*height*3);
    
    var i = 0;
    var x0 = cx - 4/(scale*2);
    var y0 = cy + 4/(scale*2);
    var dx = 4/(scale*width);
    var dy = 4/(scale*height);
    
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            var c = ((1<<24)-1) * (mandel(x0+x*dx, y0-y*dy, k) / k);
            buf[i++] = ((c >> 0) & 0xff);
            buf[i++] = ((c >> 8) & 0xff);
            buf[i++] = ((c >> 16) & 0xff);
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
    '/': sendFile('index.html', 'text/html'),
    '/mandel.js': sendFile('mandel.js', 'text/javascript'),
    '/mandelbrot.png': handleMandelbrot
};
    
http.createServer(function (request, response) {
    var url = parse(request.url, true);
    if(url.pathname in handlers) {
        var handler = handlers[url.pathname];
        handler(url, request, response);
    }
    else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Oh Snap! ' + request.url);
    }
}).listen(PORT, IP);
