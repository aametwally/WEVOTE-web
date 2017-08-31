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


/////
///// reference: http://en.cppreference.com/w/cpp/experimental/is_detected
///// To moment of developing this, the std::experimental::is_detected is not
///// yet supported in the c++14 of GCC v5.
//namespace experimental_std
//{

//template<typename... Ts> struct make_void { typedef void type;};
//template<typename... Ts> using void_t = typename make_void<Ts...>::type;

//namespace detail {
//template <class Default, class AlwaysVoid, template<class...> class Op, class... Args>
//struct detector {
//    using value_t = std::false_type;
//    using type = Default;
//};

//template <class Default, template<class...> class Op, class... Args>
//struct detector<Default, void_t<Op<Args...>>, Op, Args...> {
//    // Note that std::void_t is a C++17 feature
//    using value_t = std::true_type;
//    using type = Op<Args...>;
//};

//} // namespace detail

//template <class nonesuch , template<class...> class Op, class... Args>
//using is_detected = typename detail::detector<nonesuch, void, Op, Args...>::value_t;

//template <class nonesuch , template<class...> class Op, class... Args>
//using detected_t = typename detail::detector<nonesuch, void, Op, Args...>::type;

//template <class Default, template<class...> class Op, class... Args>
//using detected_or = detail::detector<Default, void, Op, Args...>;
//}

#endif
