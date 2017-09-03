# - Find CPPREST library
#
# This module checks for the required version number and defines
#  CPPREST_LIBRARIES, the libraries to link against to use CPPREST.
#  CPPREST_LIB_DIR, the location of the libraries
#  CPPREST_FOUND, If false, do not try to build PatternMiner
#
# Redistribution and use is allowed according to the terms of the BSD license.
# For details see the accompanying COPYING-CMAKE-SCRIPTS file.

# CPPREST preferred ENV VARIABLES:
# 1. CPPREST_LIBRARYDIR
# 2. CPPREST_INCLUDEDIR

FIND_LIBRARY(CPPREST_LIBRARY NAMES CPPREST PATHS
    /usr/lib
    /usr/local/lib
    $ENV{CPPREST_LIBRARYDIR}
)

# Include dir
find_path(CPPREST_INCLUDEDIR
  NAMES
    cpprest/http_client.h
  PATHS
    ${CASABLANCA_PKGCONF_INCLUDE_DIRS}
    ${CASABLANCA_DIR}
    $ENV{CPPREST_INCLUDEDIR}
    /usr/local/include
    /usr/include
    ../../casablanca
  PATH_SUFFIXES
    Release/include
    include
)

# Check CPPREST's version
IF (CPPREST_LIBRARY)
       FIND_FILE(CPPREST_version_FILE version.h
                 /usr/include/cpprest/
                 /usr/local/include/cpprest/
                )

        IF (DEFINED CPPREST_version_FILE)
            FILE(READ "${CPPREST_version_FILE}" _CPPREST_VERSION_H_CONTENTS)
            STRING(REGEX MATCH "#define CPPREST_VERSION_MAJOR ([0-9])" _MATCH "${_CPPREST_VERSION_H_CONTENTS}")
            SET(CPPREST_VERSION_MAJOR ${CMAKE_MATCH_1})
            STRING(REGEX MATCH "#define CPPREST_VERSION_MINOR ([0-9])" _MATCH "${_CPPREST_VERSION_H_CONTENTS}")
            SET(CPPREST_VERSION_MINOR ${CMAKE_MATCH_1})
            set (CPPREST_VERSION "${CPPREST_VERSION_MAJOR}.${CPPREST_VERSION_MINOR}")
            MESSAGE(STATUS "Detected CPPREST version number: ${CPPREST_VERSION}")
            IF (DEFINED CPPREST_VERSION AND CPPREST_VERSION VERSION_LESS CPPREST_FIND_VERSION)
                SET(CPPREST_FOUND 0)
                SET(CPPREST_LIBRARIES)
                MESSAGE(STATUS "Installed version ${CPPREST_VERSION} of CPPREST does not meet the minimum required version of ${CPPREST_FIND_VERSION}")
            ELSE ()
                SET(CPPREST_FOUND 1)
                SET(CPPREST_LIBRARIES ${CPPREST_LIBRARY})
                MESSAGE(STATUS "Found libcpprest library: ${CPPREST_LIBRARIES}")
            ENDIF ()
        ELSE ()
            SET(CPPREST_FOUND 0)
            SET(CPPREST_LIBRARIES )
            MESSAGE(STATUS "Unkown CPPREST version: unable to find version.h in cpprest/include/")
        ENDIF ()
ELSE (CPPREST_LIBRARY)
        SET(CPPREST_FOUND 0)
        SET(CPPREST_LIBRARIES)
ENDIF (CPPREST_LIBRARY)

MARK_AS_ADVANCED(
    CPPREST_LIBRARIES
    CPPREST_INCLUDEDIR
)
