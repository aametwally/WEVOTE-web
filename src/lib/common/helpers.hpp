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

}
}

#endif
