#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <unistd.h>

typedef double real_t;

real_t mandel(real_t x, real_t y, size_t k)
{
    real_t zi = 0.0;
    real_t zq = 0.0;
    real_t zi2 = 0.0;
    real_t zq2 = 0.0;
    
    for(size_t i = 0; i < k; i++) {
        if(zi2+zq2 >= 4) return (real_t)i/k;
        zq = 2*zi*zq + y;
        zi = zi2 - zq2 + x;
        zi2 = zi*zi;
        zq2 = zq*zq;
        i++;
    }
    
    return -1.0;
}

struct rgb_t
{
  uint8_t r;
  uint8_t g;
  uint8_t b;
};

struct gradient_t
{
  real_t i;
  struct rgb_t c;
};

struct gradient_t grad[] = {
    { 0.0, { 0xff, 0x00, 0x00 } },
    { 0.1, { 0x00, 0xff, 0x00 } },
    { 0.2, { 0x00, 0x00, 0xff } },
    { 0.3, { 0xff, 0xff, 0x00 } },
    { 0.4, { 0xff, 0x00, 0x00 } },
    { 0.5, { 0x00, 0xff, 0x00 } },
    { 0.6, { 0x00, 0x00, 0xff } },
    { 0.7, { 0xff, 0xff, 0x00 } },
    { 0.8, { 0xff, 0x00, 0x00 } },
    { 0.9, { 0x00, 0xff, 0x00 } },
    { 1.0, { 0x00, 0x00, 0x00 } },
};
    
int main(int argc, char **argv)
{
    size_t width = strtoul(argv[1], NULL, 10);
    size_t height = strtoul(argv[2], NULL, 10);
    real_t cx = strtod(argv[3], NULL);
    real_t cy = strtod(argv[4], NULL);
    real_t scale = strtod(argv[5], NULL);
    size_t k = strtoul(argv[6], NULL, 10);
    
    uint8_t *buf = (uint8_t*)malloc(width*height*3);
    
    size_t i = 0;
    real_t x0 = cx - 4/(scale*2);
    real_t y0 = cy + 4/(scale*2);
    real_t dx = 4/(scale*width);
    real_t dy = 4/(scale*height);
    uint8_t r, g, b;
    
    for(size_t y = 0; y < height; y++) {
        for(size_t x = 0; x < width; x++) {
            real_t h = mandel(x0+x*dx, y0-y*dy, k);
            
            if(h < 0.0) {
                r = g = b = 0;
            }
            else {
		struct gradient_t *g0 = &grad[0];
                
                while(1) {
		    struct gradient_t *g1 = g0+1;
                    
                    if(h < g1->i) {
                        real_t p = (h - g0->i) / (g1->i - g0->i);
                        r = g0->c.r + (g1->c.r - g0->c.r) * p;
                        g = g0->c.g + (g1->c.g - g0->c.g) * p;
                        b = g0->c.b + (g1->c.b - g0->c.b) * p;
                        break;
                    }
                    else {
			g0 = g1;
                    }
                }                
            }
            
            buf[i++] = r;
            buf[i++] = g;
            buf[i++] = b;
        }
    }

    write(STDOUT_FILENO, buf, width*height*3);

    return 0;
}

