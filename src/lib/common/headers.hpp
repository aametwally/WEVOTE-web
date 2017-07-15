#ifndef HEADERS_HPP
#define HEADERS_HPP

// STL Containers
#include <map>
#include <set>
#include <vector>
#include <string>
#include <iterator>

// STL Smart Ptrs
#include <memory>

// HPC
#include <omp.h>

// STL Streams
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdio.h>

// C
#include <cstdio>
#include <cstdlib>
#include <cstring>

// STL Misc
#include <algorithm>
#include <functional>
#include <errno.h>
#include <fcntl.h>
#include <stdint.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <math.h>

//#include <getopt.h>
//#include <err.h>
//#include <sysexits.h>
//#include <unistd.h>
//#include <sys/mman.h>
//#include <sys/time.h>

#if defined(__linux__) || defined(__linux) || defined( __GNUC__ )
#define WEVOTE_DLL
#elif  defined( WEVOTE_LIB )
#define WEVOTE_DLL __declspec(dllexport)
#else
#define WEVOTE_DLL __declspec(dllimport)
#endif


#endif
