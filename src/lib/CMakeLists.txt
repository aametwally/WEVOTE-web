### Library name: wevote
set( WEVOTE_LIB "wevote" )


### Library sources/headers
set( WEVOTE_LIB_SOURCE_FILES
    create_db.cpp
    helpers.cpp
    WEVOTE.cpp
    ABUNDANCE.cpp
    )

set( WEVOTE_LIB_HEADER_FILES
    create_db.hpp
    helpers.hpp
    headers.hpp )


### Include directories.
include_directories( . )

#### Define the library
add_library( ${WEVOTE_LIB}
    ${WEVOTE_LIB_SOURCE_FILES}
    ${WEVOTE_LIB_HEADER_FILES})

#set_target_properties( ${ROSALIND_LIB} PROPERTIES LINKER_LANGUAGE CXX COMPILE_DEFINITIONS "LIBRARY_API=1")

install( TARGETS ${WEVOTE_LIB} DESTINATION lib )
install( FILES ${WEVOTE_LIB_HEADER_FILES} DESTINATION include/${WEVOTE_LIB} )
