"""
    File: readTable.py
    
    Author: William J. Bosl
    Children's Hospital Boston
    300 Longwood Avenue
    Boston, MA 02115
    Email: william.bosl@childrens.harvard.edu
    Web: http://chip.org

    Copyright (C) 2011 William Bosl, Children's Hospital Boston Informatics Program (CHIP)
    http://chip.org. 

    Purpose:
    
    This file is part of a Django-based SMArt application that implements
    a two-step test for medication adherence. It is intended to be used as
    a SMArt web application within the context of a SMArt container. See
    http://www.smartplatforms.org/ for detailed information about SMArt applications.
    
    This is a general table reading function. The assumption is that each row contains 
    coefficients for a model. The columns headed by the keyword 'label' determine which 
    is appropriate for a given model. The coefficients are in the columns headed by 'coeff'. 
    Any line that starts with '#' in the data file is ignored.
        
    License information should go here.

    $Log: readTable.py,v $
"""

import string as str
import sys

class readTable():
    
    # We only want to read the database once, so do it at initiation
    def __init__(self, datafilename):
        # Read the data from the datafile or database
        try:
            datafile = open(datafilename)
        except:
            print "Can't open datafile: ", datafilename
            return
        
        # Read in all data lines: skip blank lines and
        # those that begin with '#'
        self.lines = datafile.readlines()
        datafile.close()
        
    def read(self):
                
        lines = self.lines
        datalines = []
        for line in lines:
            if line[0] == '#':
                continue
            elif not line.strip():
                continue
            else:
                datalines.append( str.split(line.lower()) )
            
        table = {}
     
        for line in datalines:
            n = len(line)
            key = line[0]
            age = line[1]
            if not table.has_key(key):
                table[key] = {}         

            table[key][age] = []
            for i in range(2,n):
                table[key][age].append(line[i])
           
        return table



if __name__ == "__main__":

    if(len(sys.argv) != 2):
        print "Usage:  python readData.py filename"
        sys.exit()
    else:
        filename = sys.argv[1]
    data = readTable.read(filename)
    
    for v1 in data:
        for v2 in data[v1]:
            print "data[%s][%s] = " %(v1,v2), data[v1][v2]