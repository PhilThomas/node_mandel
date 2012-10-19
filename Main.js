var http = require('http');
var spawn = require("child_process").spawn;

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

http.createServer(function (request, response) {
    if(request.url == '/') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('<html><head></head><body><img src="mandelbrot.png"/></body></html>');
    }
    else if(request.url == '/mandelbrot.png') {
        var width = 640;
        var height = 640;
        var buf = new Buffer(width*height*3);
        
        var i = 0;
        for(var y = 0; y < height; y++) {
            for(var x = 0; x < width; x++) {
                var c = 511 - mandel(4*x/width-2, 4*y/height-2, 511);
                buf[i++] = ((c >> 0) & 7) << 6;
                buf[i++] = ((c >> 3) & 7) << 6;
                buf[i++] = ((c >> 6) & 7) << 6;
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
    else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Oh Snap! ' + request.url);
    }
}).listen(PORT);

console.log('Server running at http://'+IP+':'+PORT+'/');
