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
    var zi2 = 0.0;
    var zq2 = 0.0;
    
    for(var i = 0; i < k; i++) {
        if(zi2+zq2 >= 4) return i/k;
        zq = 2*zi*zq + y;
        zi = zi2 - zq2 + x;
        zi2 = zi*zi;
        zq2 = zq*zq;
        i++;
    }
    
    return undefined;
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

var map = [
    [ 0.0, 0xff, 0x00, 0x00 ],
    [ 0.1, 0x00, 0xff, 0x00 ],
    [ 0.2, 0x00, 0x00, 0xff ],
    [ 0.3, 0xff, 0xff, 0x00 ],
    [ 0.4, 0xff, 0x00, 0x00 ],
    [ 0.5, 0x00, 0xff, 0x00 ],
    [ 0.6, 0x00, 0x00, 0xff ],
    [ 0.7, 0xff, 0xff, 0x00 ],
    [ 0.8, 0xff, 0x00, 0x00 ],
    [ 0.9, 0x00, 0xff, 0x00 ],
    [ 1.0, 0x00, 0x00, 0x00 ]
];
    
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
    var r, g, b;
    
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            var h = mandel(x0+x*dx, y0-y*dy, k);
            
            if(h === undefined) {
                r = g = b = 0;
            }
            else {
                var i0;
                var r0;
                var g0;
                var b0;
                
                for(var t in map) {
                    var m = map[t];
                    var i1 = m[0];
                    var r1 = m[1];
                    var g1 = m[2];
                    var b1 = m[3];
                    
                    if(h < i1) {
                        var p = (h - i0) / (i1 - i0);
                        r = r0 + (r1 - r0) * p;
                        g = g0 + (g1 - g0) * p;
                        b = b0 + (b1 - b0) * p;
                        break;
                    }
                    else {
                        i0 = i1;
                        r0 = r1;
                        g0 = g1;
                        b0 = b1;
                    }
                }                
            }
            
            buf[i++] = r;
            buf[i++] = g;
            buf[i++] = b;
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

function handleCMandelbrot(url, request, response)
{
    var width = parseInt(url.query.width, 10);
    var height = parseInt(url.query.height, 10);
    var cx = parseFloat(url.query.cx);
    var cy = parseFloat(url.query.cy);
    var scale = parseFloat(url.query.scale);
    var k = parseInt(url.query.k, 10);
        
    var cmd = './mandelbrot ' + width + ' ' + height + ' ' + cx + ' ' + cy + ' ' + scale + ' ' + k + ' | convert -equalize -size ' + width + 'x' + height + ' -depth 8 rgb:- png:-';
    //console.log('Running: ' + cmd);
    var convert = spawn('/bin/sh', ['-c', cmd]);

    response.writeHead(200, {'Content-Type': 'image/png'});

    // Write the output of convert straight to the response
	convert.stdout.on('data', function(data) {
		response.write(data);
	});

	// When we're done rendering, we're done
	convert.on('exit', function(code) {
		response.end();
	});
}

var handlers = {
    '/': sendFile('index.html', 'text/html'),
    '/mandel.js': sendFile('mandel.js', 'text/javascript'),
    '/mandelbrot.png': handleMandelbrot,
    '/cmandelbrot.png': handleCMandelbrot
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
