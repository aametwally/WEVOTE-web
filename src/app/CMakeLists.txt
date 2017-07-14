## Dependencies
include( Qt )
include_directories( ${WEVOTE_LIB_INCLUDE_DIRS} )


set( WEVOTE_APP "wevoteApp")
set( ABUNDANCE_APP "abundanceApp")
### Generate the executable

set( COMMAND_LINE_PARSER
    CommandLineParser.hpp )

add_executable( ${WEVOTE_APP} ${COMMAND_LINE_PARSER} WEVOTE.cpp )
add_executable( ${ABUNDANCE_APP} ${COMMAND_LINE_PARSER} ABUNDANCE.cpp )

### Make sure to use the required Qt modules
qt5_use_modules( ${WEVOTE_APP} Core )
qt5_use_modules( ${ABUNDANCE_APP} Core )

target_link_libraries( ${WEVOTE_APP} ${WEVOTE_LIB_LIBRARIES} )
target_link_libraries( ${ABUNDANCE_APP} ${WEVOTE_LIB_LIBRARIES} )

# Install the executable (generate with 'make install' in the bin directory)
install( TARGETS ${WEVOTE_APP} ${ABUNDANCE_APP} DESTINATION bin )
