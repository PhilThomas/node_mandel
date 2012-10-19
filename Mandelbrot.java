class Mandelbrot {
    public static void main(String[] args)
    {
        Mandelbrot mandelbrot = new Mandelbrot();
        
        mandelbrot.plotMandelbrotSet(100, 50, 10, 0.0, 0.0, 4.0/150.0, 2.0);
        //mandelbrot.plotMandelbrotSet(150, 50, 5000l, -0.13856524454488, -0.64935990748190, .00045, 2.0);
    }
    
    public void plotMandelbrotSet(int nx, int ny, long k, double cx, double cy, double scale, double ar)
    {
        double xscale = scale;
        double yscale = scale*ar;
        double x0 = cx - xscale*nx/2;
        double x1 = cx + xscale*nx/2;
        double y0 = cy + yscale*ny/2;
        double y1 = cy - yscale*ny/2;
        String map = "_.-+*$%@#";
        
        for(double y = y0; y > y1; y -= yscale) {
            
            for(double x = x0; x < x1; x += xscale) {                
                long i = inMandelbrotSet(x, y, k);
                
                if(i == k) {
                    System.out.print(" ");
                }
                else {
                    System.out.print(map.charAt((int)(i * map.length() / k)));
                }
            }
            
            System.out.println();
        }
    }
    
    public long inMandelbrotSet(double ci, double cq, long k)
    {
        double zi = 0.0;
        double zq = 0.0;
        
        for(long i = 0; i < k; i++) {
            double tmp = zi*zi - zq*zq + ci;
            zq = 2*zi*zq + cq;
            zi = tmp;
            
            if(zi*zi + zq*zq >= 4) {
                return i;
            }
        }
        
        return k;
    }
}
