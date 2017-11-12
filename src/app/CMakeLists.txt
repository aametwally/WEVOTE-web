## Dependencies
include( Qt )
include_directories( ${WEVOTE_LIB_INCLUDE_DIRS} )

function(JOIN VALUES GLUE OUTPUT)
  string (REGEX REPLACE "([^\\]|^);" "\\1${GLUE}" _TMP_STR "${VALUES}")
  string (REGEX REPLACE "[\\](.)" "\\1" _TMP_STR "${_TMP_STR}") #fixes escaping
  set (${OUTPUT} "${_TMP_STR}" PARENT_SCOPE)
endfunction()

### Configure and install scripts and scripts handlers.
set( WEVOTE_PIPELINE_SCRIPT_NAME run_WEVOTE_PIPELINE.sh )
set( ABUNDANCE_SCRIPT_NAME run_ABUNDANCE.sh )
set( WEVOTE_CONFIG_FILE_NAME wevote.cfg )

set( ALGORITHMS_LIST )

if( EXISTS "${BLASTN_PATH}" AND EXISTS "${BLASTN_DB}")
    list( APPEND ALGORITHMS_LIST "\"blastn\"" )
endif()

if( EXISTS "${KRAKEN_PATH}" AND EXISTS "${KRAKEN_DB}")
    list( APPEND ALGORITHMS_LIST "\"kraken\"" )
endif()

if( EXISTS "${CLARK_PATH}" AND EXISTS "${CLARK_DB}")
    list( APPEND ALGORITHMS_LIST "\"clark\"" )
endif()

if( EXISTS "${METAPHLAN_PATH}" )
    list( APPEND ALGORITHMS_LIST "\"metaphlan\"" )
endif()

if( EXISTS "${TIPP_PATH}" )
    list( APPEND ALGORITHMS_LIST "\"tipp\"" )
endif()

list( LENGTH ALGORITHMS_LIST ALGORITHMS_COUNT )
JOIN( "${ALGORITHMS_LIST}" " ,\n" ALGORITHMS_LIST_COMMA )
set( ALGORITHMS_INITIALIZER_LIST "{${ALGORITHMS_LIST_COMMA}}")
configure_file( config.h.in ${CMAKE_CURRENT_SOURCE_DIR}/config.h @ONLY)
configure_file( wevote.cfg.in ${CMAKE_CURRENT_SOURCE_DIR}/wevote.cfg @ONLY)

set( PIPELINE_APP "wevotePipeline" )
set( CLASSIFIER_APP "wevoteClassifier")
set( ABUNDANCE_APP "abundanceAnnotator")
### Generate the executable
add_executable( ${PIPELINE_APP}
    CommandLineParser.hpp
    run_WEVOTE_PIPELINE.sh
    config.h
    WevoteScriptHandler.h
    WevoteScriptHandler.cpp
    wevotePipeline.cpp )

add_executable( ${CLASSIFIER_APP}
    CommandLineParser.hpp
    wevoteClassifier.cpp )

add_executable( ${ABUNDANCE_APP}
    CommandLineParser.hpp
    abundanceAnnotator.cpp )

### Make sure to use the required Qt modules
qt5_use_modules( ${PIPELINE_APP} Core )
qt5_use_modules( ${CLASSIFIER_APP} Core )
qt5_use_modules( ${ABUNDANCE_APP} Core )

target_link_libraries( ${PIPELINE_APP}  ${WEVOTE_LIB_LIBRARIES} )
target_link_libraries( ${CLASSIFIER_APP} ${WEVOTE_LIB_LIBRARIES} )
target_link_libraries( ${ABUNDANCE_APP} ${WEVOTE_LIB_LIBRARIES} )

# Install the executable (generate with 'make install' in the bin directory)
install( TARGETS ${PIPELINE_APP}  ${CLASSIFIER_APP} ${ABUNDANCE_APP} DESTINATION bin )
install( PROGRAMS ${ABUNDANCE_SCRIPT_NAME} ${WEVOTE_PIPELINE_SCRIPT_NAME} DESTINATION bin )
install( FILES ${WEVOTE_CONFIG_FILE_NAME} DESTINATION bin )
