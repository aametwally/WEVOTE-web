/*
 * Copyrights (c) 2015
 * Marwan Abdellah <abdellah.marwan@gmail.com>
 * */


#ifndef LOGGER_H
#define LOGGER_H

#include <iostream>
#include <string>

#include "headers.hpp"
#include "LogLevel.hh"


/**
 * @brief The Logger class
 */
class WEVOTE_DLL Logger
{
public:
    /**
     * @brief instance
     * This function is called to create an instance of the class.
     * Calling the constructor publicly is not allowed.
     * The constructor is private and is only called by this Instance function.
     * @return
     */
    static Logger* instance();

    /**
     * @brief log
     * @param logLevel
     * @param filePath
     * @param lineNumber
     * @param functionName
     * @param string
     */
    void log( const LOG_LEVEL logLevel,
              const std::string& filePath,
              const int &lineNumber,
              const std::string& functionName,
              const wchar_t *string, ... );

    /**
     * @brief log
     * @param logLevel
     * @param filePath
     * @param lineNumber
     * @param functionName
     * @param string
     */
    void log( const LOG_LEVEL logLevel,
              const std::string& filePath,
              const int &lineNumber,
              const std::string& functionName,
              const char *string, ... );

private:
    /**
     * @brief Logger
     */
    Logger();

private:
    /**
     * @brief operator =
     * @return
     */
    Logger& operator=( Logger const& );

private: // Private Member Variables
    /**
     * @brief instance_
     */
    static Logger* instance_;

    /**
     * @brief logFilePtr_
     * File stream or std stream
     */
    FILE* logFilePtr_;
};

/** \brief Log run time application information */
#define LOG_INFO( ... )                                                      \
    Logger::instance()->log( LOG_LEVEL::LEVEL_INFO , __FILE__, __LINE__, __FUNCTION__, __VA_ARGS__ )

/** \brief Log debugging information */
#define LOG_DEBUG( ... )                                                     \
    Logger::instance()->log( LOG_LEVEL::LEVEL_DEBUG , __FILE__, __LINE__, __FUNCTION__, __VA_ARGS__ )

/** \brief Log warning messages */
#define LOG_WARNING( ... )                                                   \
    Logger::instance()->log( LOG_LEVEL::LEVEL_WARNING , __FILE__, __LINE__, __FUNCTION__, __VA_ARGS__ )

/** \brief Log error messages with out extra arguments */
#define LOG_ERROR( ... )                                                     \
    Logger::instance()->log( LOG_LEVEL::LEVEL_ERROR , __FILE__, __LINE__, __FUNCTION__, __VA_ARGS__ )

#define LOG_EXIT( ... )                                                      \
    Logger::instance()->log( LOG_LEVEL::LEVEL_EXIT , __FILE__, __LINE__, __FUNCTION__, __VA_ARGS__ )


#define WEVOTE_ASSERT( assertation , msg ) do { \
    if(!(assertation)) \
    LOG_ERROR("Assertation failed:%s",msg);\
    }while(0)



template< typename CharType ,
          typename std::enable_if< std::is_same< CharType , char >::value , int >::type = 0 >
constexpr auto strFormat()
{
    return "%s";
}

template< typename CharType ,
          typename std::enable_if< std::is_same< CharType , wchar_t >::value , int >::type = 0 >
constexpr auto strFormat()
{
    return "%ws";
}
#endif // LOGGER_H
