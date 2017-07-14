### Library name: wevote
set( WEVOTE_LIB "wevote" )


### Library sources/headers
set( WEVOTE_LIB_SOURCE_FILES
    TaxonomyBuilder.cpp
    log/Logger.cpp
    )

set( WEVOTE_LIB_HEADER_FILES
    wevote.hpp
    TaxonomyBuilder.h
    common/helpers.hpp
    common/headers.hpp
    log/Colors.hh
    log/Logger.h
    log/LogLevel.hh )


### Include directories.
include_directories( . )
include_directories( common )
include_directories( log )

#### Define the library
add_library( ${WEVOTE_LIB}
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
