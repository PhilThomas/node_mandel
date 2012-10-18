#include <vector>
#include <iostream>
#include <algorithm>
#include <boost/lambda/lambda.hpp>

int main(int argc, char **argv)
{
    std::vector<int> vec;
    
    vec.push_back(0);
    vec.push_back(1);
    
    std::for_each(vec.begin(), vec.end(), std::cout << boost::lambda::_1 << '\n');
    
    return 0;
}
