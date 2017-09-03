/*
 * Copyrights (c) 2015
 * Marwan Abdellah <abdellah.marwan@gmail.com>
 * */

#include <time.h>
#include <stdio.h>
#include <stdarg.h>
#include <stddef.h>
#include <stdlib.h>
#include "Logger.h"
#include "Colors.hh"

#if defined(__linux__) || defined(__linux) || defined(__GNUC__)
#include <unistd.h>
#define TIME_STAMP_FORMAT "%D.%M.%Y, %H:%M:%S"
#else
#include <process.h> /* for getpid() and the exec..() family */
#include <direct.h> /* for _getcwd() and _chdir() */
#define TIME_STAMP_FORMAT "%H:%M:%S"
#endif

#define TIME_STAMP_CHAR_LENGTH 128

// Global static pointer used to ensure a single instance of the class
Logger* Logger::instance_ = NULL;


Logger::Logger()
{
    // Print the log messages to the std stream
    logFilePtr_ = stdout;
}

Logger* Logger::instance()
{
    if ( !instance_ )
        instance_ = new Logger;

    return instance_;
}

void Logger::log( const LOG_LEVEL logLevel,
                  const std::string& filePath,
                  const int& lineNumber,
                  const std::string& functionName,
                  const char *string, ... )
{
    // Variable arguments information
    va_list argumentList;

    // Lof message
    char logMessage[1024];

    // Get the arguments and add them to the buffer
    va_start( argumentList, string );
    vsnprintf( logMessage, sizeof( logMessage ), string, argumentList );

    // Get the time now
    time_t timeNow = time( NULL );

    // Time stamp string
    char timeStamp[TIME_STAMP_CHAR_LENGTH];

    // Format the time string and get the local time
    strftime( timeStamp, sizeof(timeStamp ),
              (char*) TIME_STAMP_FORMAT , localtime( &timeNow ));

    switch ( logLevel )
    {
    case LOG_LEVEL::LEVEL_INFO:
        fprintf( logFilePtr_,
                 STD_RED "[%d]" STD_RESET                   // Process Id
                 STD_YELLOW "[%s]" STD_RESET                // Time stamp
                 STD_CYAN " %s :" STD_RESET                 // filePath name
                 STD_GREEN "[%d]\n" STD_RESET               // Code line
                 STD_MAGENTA "\t* %s" STD_RESET             // Function name
                 STD_WHITE " %s \n" STD_RESET,              // Message
                 (int) getpid(),                            // Process Id
                 timeStamp,                                 // Time stamp
                 filePath.c_str(),                          // filePath name
                 lineNumber,                                // Code line
                 functionName.c_str(),                      // Function name
                 logMessage);                               // Message
        break;

    case LOG_LEVEL::LEVEL_DEBUG:
        fprintf( logFilePtr_,
                 STD_RED "[%d]" STD_RESET                   // Process Id
                 STD_YELLOW "[%s]" STD_RESET                // Time stamp
                 STD_CYAN " %s :" STD_RESET                 // filePath name
                 STD_GREEN "[%d] \n" STD_RESET              // Code line
                 STD_MAGENTA "\t* %s" STD_RESET             // Function name
                 STD_BOLD_WHITE " %s \n" STD_RESET,         // Message
                 (int) getpid(),                            // Process Id
                 timeStamp,                                 // Time stamp
                 filePath.c_str(),                          // filePath name
                 lineNumber,                                // Code line
                 functionName.c_str(),                      // Function name
                 logMessage);                               // Message
        break;

    case LOG_LEVEL::LEVEL_WARNING:
        fprintf( logFilePtr_,
                 STD_RED "[%d]" STD_RESET                   // Process Id
                 STD_YELLOW "[%s]" STD_RESET                // Time stamp
                 STD_CYAN " %s :" STD_RESET                 // filePath name
                 STD_GREEN "[%d] " STD_RESET                // Code line
                 STD_BOLD_YELLOW "[WARNGIN] \n" STD_RESET   // [WARNING]
                 STD_MAGENTA "\t* %s" STD_RESET             // Function name
                 STD_BOLD_YELLOW " %s \n" STD_RESET,        // Message
                 (int) getpid(),                            // Process Id
                 timeStamp,                                 // Time stamp
                 filePath.c_str(),                          // filePath name
                 lineNumber,                                // Code line
                 functionName.c_str(),                      // Function name
                 logMessage);                               // Message
        break;

    case LOG_LEVEL::LEVEL_ERROR:
        fprintf( logFilePtr_,
                 STD_RED "[%d]" STD_RESET                   // Process Id
                 STD_YELLOW "[%s]" STD_RESET                // Time stamp
                 STD_CYAN " %s :" STD_RESET                 // filePath name
                 STD_GREEN "[%d] " STD_RESET                // Code line
                 STD_BOLD_RED "[ERROR] \n" STD_RESET        // [ERROR]
                 STD_MAGENTA "\t* %s" STD_RESET             // Function name
                 STD_BOLD_RED " %s \n" STD_RESET,           // Message
                 (int) getpid(),                            // Process Id
                 timeStamp,                                 // Time stamp
                 filePath.c_str(),                          // filePath name
                 lineNumber,                                // Code line
                 functionName.c_str(),                      // Function name
                 logMessage);                               // Message
        LOG_EXIT(logMessage);
        break;

    case LOG_LEVEL::LEVEL_EXIT:
        fprintf( logFilePtr_,
                 STD_BOLD_RED "\t EXITTING due to an ERROR ...\n " STD_RESET );
        exit(EXIT_FAILURE);
        break;

    default:
        break;
    }

    // Done
    va_end(argumentList);
}

void Logger::log( const LOG_LEVEL logLevel,
                  const std::string& filePath,
                  const int& lineNumber,
                  const std::string& functionName,
                  const wchar_t *string, ... )
{
    // Variable arguments information
    va_list argumentList;

    // Lof message
    wchar_t logMessage[1024];

    // Get the arguments and add them to the buffer
    va_start( argumentList, string );
    vswprintf( logMessage, sizeof( logMessage ), string, argumentList );

    // Get the time now
    time_t timeNow = time( NULL );

    // Time stamp string
    char timeStamp[TIME_STAMP_CHAR_LENGTH];

    // Format the time string and get the local time
    strftime( timeStamp, sizeof(timeStamp ),
              (char*) TIME_STAMP_FORMAT , localtime( &timeNow ));

    switch ( logLevel )
    {
    case LOG_LEVEL::LEVEL_INFO:
        fwprintf( logFilePtr_,
                  U(STD_RED "[%d]" STD_RESET                   // Process Id
                    STD_YELLOW "[%hs]" STD_RESET                // Time stamp
                    STD_CYAN " %hs :" STD_RESET                 // filePath name
                    STD_GREEN "[%d]\n" STD_RESET               // Code line
                    STD_MAGENTA "\t* %hs" STD_RESET             // Function name
                    STD_WHITE " %ws \n" STD_RESET),              // Message
                  (int) getpid(),                            // Process Id
                  timeStamp,                                 // Time stamp
                  filePath.c_str(),                          // filePath name
                  lineNumber,                                // Code line
                  functionName.c_str(),                      // Function name
                  logMessage);                               // Message
        break;

    case LOG_LEVEL::LEVEL_DEBUG:
        fwprintf( logFilePtr_,
                  U(STD_RED "[%hs]" STD_RESET                   // Process Id
                    STD_YELLOW "[%hs]" STD_RESET                // Time stamp
                    STD_CYAN " %hs :" STD_RESET                 // filePath name
                    STD_GREEN "[%d] \n" STD_RESET              // Code line
                    STD_MAGENTA "\t* %hs" STD_RESET             // Function name
                    STD_BOLD_WHITE " %ws \n" STD_RESET),         // Message
                  (int) getpid(),                            // Process Id
                  timeStamp,                                 // Time stamp
                  filePath.c_str(),                          // filePath name
                  lineNumber,                                // Code line
                  functionName.c_str(),                      // Function name
                  logMessage);                               // Message
        break;

    case LOG_LEVEL::LEVEL_WARNING:
        fwprintf( logFilePtr_,
                  U(STD_RED "[%d]" STD_RESET                   // Process Id
                    STD_YELLOW "[%hs]" STD_RESET                // Time stamp
                    STD_CYAN " %hs :" STD_RESET                 // filePath name
                    STD_GREEN "[%d] " STD_RESET                // Code line
                    STD_BOLD_YELLOW "[WARNGIN] \n" STD_RESET   // [WARNING]
                    STD_MAGENTA "\t* %hs" STD_RESET             // Function name
                    STD_BOLD_YELLOW " %ws \n" STD_RESET),        // Message
                  (int) getpid(),                            // Process Id
                  timeStamp,                                 // Time stamp
                  filePath.c_str(),                          // filePath name
                  lineNumber,                                // Code line
                  functionName.c_str(),                      // Function name
                  logMessage);                               // Message
        break;

    case LOG_LEVEL::LEVEL_ERROR:
        fwprintf( logFilePtr_,
                  U(STD_RED "[%d]" STD_RESET                   // Process Id
                    STD_YELLOW "[%hs]" STD_RESET                // Time stamp
                    STD_CYAN " %hs :" STD_RESET                 // filePath name
                    STD_GREEN "[%d] " STD_RESET                // Code line
                    STD_BOLD_RED "[ERROR] \n" STD_RESET        // [ERROR]
                    STD_MAGENTA "\t* %hs" STD_RESET             // Function name
                    STD_BOLD_RED " %ws \n" STD_RESET),           // Message
                  (int) getpid(),                            // Process Id
                  timeStamp,                                 // Time stamp
                  filePath.c_str(),                          // filePath name
                  lineNumber,                                // Code line
                  functionName.c_str(),                      // Function name
                  logMessage);                               // Message
        LOG_EXIT(logMessage);
        break;

    case LOG_LEVEL::LEVEL_EXIT:
        fwprintf( logFilePtr_,
                  U(STD_BOLD_RED "\t EXITTING due to an ERROR ...\n " STD_RESET) );
        exit(EXIT_FAILURE);
        break;

    default:
        break;
    }

    // Done
    va_end(argumentList);
}
