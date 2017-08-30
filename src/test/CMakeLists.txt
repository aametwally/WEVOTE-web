# Make test executable
include_directories( ${WEVOTE_LIB_INCLUDE_DIRS}
    ${LAGACY_WEVOTE_LIB_INCLUDE_DIRS}
    ${CATCH_INCLUDE_DIR})


configure_file( tests.h.in ${CMAKE_CURRENT_SOURCE_DIR}/tests.h @ONLY)

find_package(OpenMP)
if (OPENMP_FOUND)
    set (CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${OpenMP_C_FLAGS}")
    set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
endif()

set(TEST_SOURCES ${CMAKE_CURRENT_SOURCE_DIR}/tests.cpp)
set(TEST_HEADERS ${CMAKE_CURRENT_SOURCE_DIR}/tests.h
    ${CMAKE_CURRENT_SOURCE_DIR}/tests.h.in)
add_executable(tests ${TEST_SOURCES} ${TEST_HEADERS})
target_link_libraries(tests Catch ${WEVOTE_LIB_LIBRARIES} ${LAGACY_WEVOTE_LIB_LIBRARIES} )
