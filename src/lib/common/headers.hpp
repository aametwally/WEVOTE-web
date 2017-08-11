#ifndef HEADERS_HPP
#define HEADERS_HPP

// STL Containers
#include <map>
#include <set>
#include <vector>
#include <string>
#include <iterator>
#include <array>
//#include <tr1/unordered_map>
#include <unordered_map>

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
#include <numeric>
#include <errno.h>
#include <fcntl.h>
#include <stdint.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <math.h>
#include <type_traits>

#if defined(__linux__) || defined(__linux) || defined( __GNUC__ )
#define WEVOTE_DLL
#elif  defined( WEVOTE_LIB )
#define WEVOTE_DLL __declspec(dllexport)
#else
#define WEVOTE_DLL __declspec(dllimport)
#endif


#endif
