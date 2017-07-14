### Library name: wevote
set( WEVOTE_LIB "wevote" )


### Library sources/headers
set( WEVOTE_LIB_SOURCE_FILES
    common/create_db.cpp
    common/helpers.cpp
    )

set( WEVOTE_LIB_HEADER_FILES
    common/create_db.hpp
    common/helpers.hpp
    common/headers.hpp )


### Include directories.
include_directories( . )
include_directories( common )


#### Define the library
add_library( ${WEVOTE_LIB}
    ${WEVOTE_LIB_SOURCE_FILES}
    ${WEVOTE_LIB_HEADER_FILES})

#set_target_properties( ${ROSALIND_LIB} PROPERTIES LINKER_LANGUAGE CXX COMPILE_DEFINITIONS "LIBRARY_API=1")


install( TARGETS ${WEVOTE_LIB} DESTINATION lib )
install( FILES ${WEVOTE_LIB_HEADER_FILES} DESTINATION include/${WEVOTE_LIB} )


set(WEVOTE_LIB_INCLUDE_DIRS
  ${CMAKE_CURRENT_SOURCE_DIR}
  ${CMAKE_CURRENT_SOURCE_DIR}/common
  CACHE INTERNAL "${WEVOTE_LIB} include directories"
)

set(WEVOTE_LIB_LIBRARIES
  ${WEVOTE_LIB}
  CACHE INTERNAL "${WEVOTE_LIB} libraries"
)
