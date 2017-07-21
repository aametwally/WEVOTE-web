#ifndef HELPERS_HPP
#define HELPERS_HPP

#include "headers.hpp"
#include "ReadInfo.h"
#include "Logger.h"


namespace wevote
{
namespace io
{

template< typename SeqIt >
std::string join( SeqIt first , SeqIt last , const std::string &sep )
{
    auto binaryJoinString = [sep]( const std::string &a , const std::string &b ) -> std::string
    {
        return  a + ((a.length() > 0) ? sep : "") +  b ;
    };
    return std::accumulate( first , last ,
                            std::string() , binaryJoinString  );
}

template< typename Container = std::vector< std::string >>
std::string join( const Container &container ,
                  const std::string &sep )
{
    return join( container.cbegin() , container.cend() , sep );
}

template< typename T >
std::string toString( T value )
{
    return std::to_string( value );
}

template< typename SeqIt >
std::vector< std::string > asStringsVector( SeqIt firstIt , SeqIt lastIt )
{
    std::vector< std::string > stringified;
    std::transform( firstIt , lastIt ,
                    std::inserter( stringified , std::end( stringified )) ,
                    toString< typename SeqIt::value_type > );
    return stringified;
}

template< typename Container = std::vector< std::string >>
auto getFileLines( const std::string &filePath )
{
    std::ifstream f( filePath );
    Container lines;
    std::string line;
    if( f )
        while( std::getline( f , line ))
            lines.push_back( line );
    else std::cout << "Failed to open file:" << filePath ;
    return lines;
}

template< typename Container = std::vector< std::string >>
auto split( const std::string &s , char delim  )
{
    std::stringstream ss( s );
    Container tokens;
    std::string token;
    while( std::getline( ss , token , delim ))
        tokens.push_back( token );
    return tokens;
}

template< typename Container = std::vector< std::string >>
auto split( const std::string &s , std::string delim  )
{
    Container tokens;
    size_t last = 0; size_t next = 0;
    while ((next = s.find(delim, last )) != std::string::npos)
    {
        tokens.push_back( s.substr(last , next - last));
        last = next + 1;
    }
    last += delim.length() - 1;
    if( last < s.length() )
        tokens.push_back( s.substr( last , std::string::npos ));
    return tokens;
}

}
}

#endif
