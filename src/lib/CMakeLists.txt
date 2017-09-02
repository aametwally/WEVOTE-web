### Library name: wevote
set( WEVOTE_LIB "wevote" )


### Library sources/headers
set( WEVOTE_LIB_SOURCE_FILES
    WevoteClassifier.cpp
    TaxonomyBuilder.cpp
    TaxonomyLineAnnotator.cpp
    common/ReadInfo.cpp
    common/Taxon.cpp
    common/TaxLine.cpp
    common/Rank.cpp
    common/Serializable.hpp
    log/Logger.cpp
    )

set( WEVOTE_LIB_HEADER_FILES
    WevoteClassifier.h
    TaxonomyBuilder.h
    TaxonomyLineAnnotator.h
    common/helpers.hpp
    common/headers.hpp
    common/ReadInfo.h
    common/Taxon.h
    common/TaxLine.h
    common/Rank.h
    log/Colors.hh
    log/Logger.h
    log/LogLevel.hh )


### Include directories.
include_directories( . )
include_directories( common )
include_directories( log )

find_package(OpenMP REQUIRED)
if (OPENMP_FOUND)
    set (CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${OpenMP_C_FLAGS}")
    set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
endif()


#### Define the library
add_library( ${WEVOTE_LIB} SHARED
    ${WEVOTE_LIB_SOURCE_FILES}
    ${WEVOTE_LIB_HEADER_FILES})

#set_target_properties( ${ROSALIND_LIB} PROPERTIES LINKER_LANGUAGE CXX COMPILE_DEFINITIONS "LIBRARY_API=1")
set_target_properties( ${WEVOTE_LIB} PROPERTIES COMPILE_DEFINITIONS "WEVOTE_LIB=1")

install( TARGETS ${WEVOTE_LIB} DESTINATION lib )
install( FILES ${WEVOTE_LIB_HEADER_FILES} DESTINATION include/${WEVOTE_LIB} )


set(WEVOTE_LIB_INCLUDE_DIRS
  ${CMAKE_CURRENT_SOURCE_DIR}
  ${CMAKE_CURRENT_SOURCE_DIR}/common
  ${CMAKE_CURRENT_SOURCE_DIR}/log
  CACHE INTERNAL "${WEVOTE_LIB} include directories"
)

set(WEVOTE_LIB_LIBRARIES
  ${WEVOTE_LIB}
  CACHE INTERNAL "${WEVOTE_LIB} libraries"
)
