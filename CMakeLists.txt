cmake_minimum_required(VERSION 3.5)

### c++14 standards
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)


if(WIN32)
    set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
    set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
    set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

elseif(UNIX)
    ##-------------------- Use settings at: https://cmake.org/Wiki/CMake_RPATH_handling#Always_full_RPATH
    # With these settings you will be able to
    # execute your programs from the build tree and
    # they will find the shared libraries in the build
    # tree and also the shared libraries outside your project,
    # when installing all executables and shared libraries
    # will be relinked, so they will find all libraries they need.
    ########################################################################
    ########################################################################
    # use, i.e. don't skip the full RPATH for the build tree
    SET(CMAKE_SKIP_BUILD_RPATH  FALSE)

    # when building, don't use the install RPATH already
    # (but later on when installing)
    SET(CMAKE_BUILD_WITH_INSTALL_RPATH FALSE)

    SET(CMAKE_INSTALL_RPATH "${CMAKE_INSTALL_PREFIX}/lib")

    # add the automatically determined parts of the RPATH
    # which point to directories outside the build tree to the install RPATH
    SET(CMAKE_INSTALL_RPATH_USE_LINK_PATH TRUE)


    # the RPATH to be used when installing, but only if it's not a system directory
    LIST(FIND CMAKE_PLATFORM_IMPLICIT_LINK_DIRECTORIES "${CMAKE_INSTALL_PREFIX}/lib" isSystemDir)
    IF("${isSystemDir}" STREQUAL "-1")
       SET(CMAKE_INSTALL_RPATH "${CMAKE_INSTALL_PREFIX}/lib")
    ENDIF("${isSystemDir}" STREQUAL "-1")
    ########################################################################
    ########################################################################
endif()

project(wevote C CXX)

### Add CMake modules
set( CMAKE_MODULE_PATH ${CMAKE_SOURCE_DIR}/cmake )

### Define test data directory and the output directory.
set( DATA_DIRECTORY ${CMAKE_SOURCE_DIR}/data)


### Add all the files in the src directory to the CMake tree
#add_subdirectory( lagacy )
add_subdirectory( src )
