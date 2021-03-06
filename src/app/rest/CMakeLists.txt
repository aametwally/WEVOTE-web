## Dependencies
include( Qt )
include( CppREST )
find_package(OpenSSL REQUIRED)
find_package(Boost REQUIRED COMPONENTS system)

include_directories(${OPENSSL_INCLUDE_DIR})
include_directories(${Boost_INCLUDE_DIRS})
include_directories(${CPPREST_INCLUDEDIR})
include_directories(${WEVOTE_LIB_INCLUDE_DIRS} )
include_directories( .. )

set( WEVOTE_REST "wevoteREST")



### Generate the executable
set( WEVOTE_REST_SRC
    ../WevoteScriptHandler.cpp
    RestHandler.cpp
    wevoteREST
    WevoteRestHandler.cpp )
set( WEVOTE_REST_HDR
    RestHandler.h
    WevoteRestHandler.h
    stdafx.h
    WevoteJSON.hpp
    WevoteRestMessages.hpp
    ../WevoteScriptHandler.h
    ../config.h
    ../config.h.in  )

set( WEVOTE_REST_MISC
    ../run_WEVOTE_PIPELINE.sh
    ../wevote.cfg.in
    ../wevote.cfg
    )

add_executable( ${WEVOTE_REST} ${WEVOTE_REST_SRC} ${WEVOTE_REST_HDR} ${WEVOTE_REST_MISC})

### Make sure to use the required Qt modules
qt5_use_modules( ${WEVOTE_REST} Core )


target_link_libraries( ${WEVOTE_REST} ${WEVOTE_LIB_LIBRARIES} ${OPENSSL_LIBRARIES} ${Boost_LIBRARIES} ${CPPREST_LIBRARIES})

# Install the executable (generate with 'make install' in the bin directory)
install( TARGETS ${WEVOTE_REST} DESTINATION bin )
