#!/usr/bin/env python
str = raw_input("Please enter a number: ")
try:
    i = int(str)
    print "You entered", str
except ValueError:
    print "What??"
