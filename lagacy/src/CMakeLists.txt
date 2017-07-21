### Library name: wevote
set( LAGACY_WEVOTE_LIB "lagacy_wevote" )
set( LAGACY_WEVOTE_APP "lagacy_wevoteClassifier")
set( LAGACY_ABUNDANCE_APP "lagacy_abundanceAnnotator")

### Library sources/headers
set( LAGACY_WEVOTE_LIB_SOURCE_FILES
    create_db.cpp
    helpers.cpp
    )

set( LAGACY_WEVOTE_LIB_HEADER_FILES
    create_db.hpp
    helpers.hpp
    headers.hpp
 )

find_package(OpenMP)
if (OPENMP_FOUND)
    set (CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${OpenMP_C_FLAGS}")
    set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
endif()


#### Define the library
add_library( ${LAGACY_WEVOTE_LIB} SHARED
    ${LAGACY_WEVOTE_LIB_SOURCE_FILES}
    ${LAGACY_WEVOTE_LIB_HEADER_FILES})

#set_target_properties( ${ROSALIND_LIB} PROPERTIES LINKER_LANGUAGE CXX COMPILE_DEFINITIONS "LIBRARY_API=1")
set_target_properties( ${LAGACY_WEVOTE_LIB} PROPERTIES COMPILE_DEFINITIONS "WEVOTE_LIB=1")

install( TARGETS ${LAGACY_WEVOTE_LIB} DESTINATION lib )

set(LAGACY_WEVOTE_LIB_INCLUDE_DIRS
  ${CMAKE_CURRENT_SOURCE_DIR}/../..
  CACHE INTERNAL "${LAGACY_WEVOTE_LIB} include directories"
)

set(LAGACY_WEVOTE_LIB_LIBRARIES
  ${LAGACY_WEVOTE_LIB}
  CACHE INTERNAL "${LAGACY_WEVOTE_LIB} libraries"
)

add_executable( ${LAGACY_WEVOTE_APP}  WEVOTE.cpp )
add_executable( ${LAGACY_ABUNDANCE_APP}  ABUNDANCE.cpp )


target_link_libraries( ${LAGACY_WEVOTE_APP} ${LAGACY_WEVOTE_LIB_LIBRARIES} )
target_link_libraries( ${LAGACY_ABUNDANCE_APP} ${LAGACY_WEVOTE_LIB_LIBRARIES} )

# Install the executable (generate with 'make install' in the bin directory)
install( TARGETS ${LAGACY_WEVOTE_APP} ${LAGACY_ABUNDANCE_APP} DESTINATION bin )

