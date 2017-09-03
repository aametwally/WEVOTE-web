# - Find CPPREST library
#
# This module checks for the required version number and defines
#  CPPREST_LIBRARIES, the libraries to link against to use CPPREST.
#  CPPREST_LIB_DIR, the location of the libraries
#  CPPREST_FOUND, If false, do not try to build PatternMiner
#
# Redistribution and use is allowed according to the terms of the BSD license.
# For details see the accompanying COPYING-CMAKE-SCRIPTS file.


FIND_LIBRARY(CPPREST_LIBRARY NAMES cpprest libcpprest.so cpprest140d_2_9.lib cpprest140_2_9.lib
    PATHS
    $ENV{CPPREST_DIR}
    /usr/lib
    /usr/local/lib
)

# Include dir
find_path( CPPREST_INCLUDEDIR
  NAMES
    cpprest/http_client.h
  PATHS
    $ENV{CPPREST_DIR}
    ${CASABLANCA_PKGCONF_INCLUDE_DIRS}
    ${CASABLANCA_DIR}
    /usr/local/include
    /usr/include
    ../../casablanca
  PATH_SUFFIXES
    Release/include
    include
)
message("lib:${CPPREST_LIBRARY}")
message("inc:${CPPREST_INCLUDEDIR}")

# Check CPPREST's version
IF (CPPREST_LIBRARY)
       FIND_FILE(CPPREST_version_FILE cpprest/version.h
                 ${CPPREST_INCLUDEDIR}
                )

        IF ( CPPREST_version_FILE)
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
        MESSAGE(STATUS "Not found: libcpprest library.")
        SET(CPPREST_FOUND 0)
        SET(CPPREST_LIBRARIES)
ENDIF (CPPREST_LIBRARY)

#if(WIN32)
#    set( CPPREST_LIBRARIES  $ENV{GDCM_DIR}/lib/gdcmDict.lib
#        $ENV{GDCM_DIR}/lib/gdcmMSFF.lib
#        CACHE INTERNAL "NON_REDERENCED_DEPENDENCIES")
#endif()

MARK_AS_ADVANCED(
    CPPREST_LIBRARIES
    CPPREST_INCLUDEDIR
)
