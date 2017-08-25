## Dependencies
include( Qt )
include_directories( ${WEVOTE_LIB_INCLUDE_DIRS} )
include_directories( ${QTSERVICE_INCLUDE_DIRS} )

set( MY_SERVICE_APP "myservice")


### Generate the executable

set( MY_SERVICE_SRC
    MyService.cpp
    myservice.cpp )
set( MY_SERVICE_HDR
    MyService.h )

set( MY_SERVICE_MISC
    myservice.conf.in
    myservice.conf )

add_executable( ${MY_SERVICE_APP} ${MY_SERVICE_SRC} ${MY_SERVICE_HDR} ${MY_SERVICE_MISC} )

### Make sure to use the required Qt modules
qt5_use_modules( ${MY_SERVICE_APP} Core )

target_link_libraries( ${MY_SERVICE_APP} ${WEVOTE_LIB_LIBRARIES} ${QTSERVICE_LIBRARIES})

# Install the executable (generate with 'make install' in the bin directory)
install( TARGETS ${MY_SERVICE_APP} DESTINATION bin )

set( SERVICE_EXECUTABLE_PATH ${CMAKE_INSTALL_PREFIX}/bin/${MY_SERVICE_APP} )
configure_file( myservice.conf.in ${CMAKE_CURRENT_SOURCE_DIR}/myservice.conf @ONLY)

# Install conf files at /home/user/.config/upstart.
#install( FILES ${CMAKE_CURRENT_SOURCE_DIR}/myservice.conf DESTINATION "$ENV{HOME}/.config/upstart/${MY_SERVICE_APP}" )
