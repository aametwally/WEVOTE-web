#ifndef HELPERS_HPP
#define HELPERS_HPP

#include "headers.hpp"
#include "Logger.h"

namespace wevote
{
namespace io
{

template< typename StringType ,
          typename std::enable_if< std::is_same< std::string , StringType >::value , int >::type = 0 >
defs::string_t toStringType( const StringType &str )
{
    std::wstring temp(str.length(),U(' '));
    std::copy(str.begin(), str.end(), temp.begin());
    return temp;
}

template< typename StringType ,
          typename std::enable_if< std::is_same< defs::string_t , StringType >::value , int >::type = 0 >
std::string toStringType( const StringType &str )
{
    std::string temp(str.length(), ' ');
    std::copy(str.begin(), str.end(), temp.begin());
    return temp;
}

template< typename SeqIt, typename SeperatorType  >
typename SeqIt::value_type join( SeqIt first , SeqIt last , const SeperatorType &sep )
{
    using StringType = SeqIt::value_type;
    auto binaryJoinString = [sep]( const StringType &a , const StringType &b )->StringType
    {
        return a + sep + b;
    };

    if( first == last )
        return StringType();
    else if ( std::next( first , 1 ) == last )
        return *first;
    else return std::accumulate( std::next( first , 1 ) , last ,
                                 *first , binaryJoinString  );
}

template< typename SeperatorType , typename Container >
typename Container::value_type join( const Container &container ,
                                     const SeperatorType &sep )
{
    return join( container.cbegin() , container.cend() , sep );
}

template< typename StringType = std::string ,
          typename T ,
          typename std::enable_if< std::is_same< StringType , std::string >::value , int >::type = 0>
typename StringType toString( typename T value )
{
    return std::to_string( value );
}

template< typename StringType = std::string  ,
          typename T ,
          typename std::enable_if< std::is_same< StringType , std::wstring >::value , int >::type = 0>
typename StringType toString( T value )
{
    return std::to_wstring( value );
}

template< typename CharType = char ,  typename SeqIt >
std::vector< std::basic_string< CharType >> asStringsVector( SeqIt firstIt , SeqIt lastIt )
{
    using T = SeqIt::value_type;
    using StringType = std::basic_string< CharType >;
    std::vector< StringType > stringified;
    std::transform( firstIt , lastIt ,
                    std::inserter( stringified , std::end( stringified )) ,
                    []( const T &element ) { return toString< StringType >( element ); } );
    return stringified;
}

template< typename Container >
std::vector< std::string > asStringsVector( const Container &container )
{
    return asStringsVector( container.cbegin() , container.cend());
}

template< typename CharType = char >
auto getFileLines( const std::string &filePath )
{
    std::basic_ifstream< CharType > f( filePath );
    std::vector< std::basic_string< CharType > > lines;
    std::basic_string< CharType > line;
    if( f )
        while( std::getline( f , line ))
            lines.push_back( line );
    else LOG_WARNING("Failed to open file:%s",filePath.c_str());
    return lines;
}

template< class CharType >
auto split( const std::basic_string< CharType > &s , CharType delim  )
{
    using StringType = std::basic_string< CharType >;
    std::basic_stringstream< CharType > ss( s );
    std::vector< StringType > tokens;
    StringType token;
    while( std::getline( ss , token , delim ))
        tokens.push_back( token );
    return tokens;
}

template< typename StringType , typename SeperatorType >
auto split( const StringType &s , SeperatorType delim  )
{
    std::vector< StringType > tokens;
    size_t last = 0; size_t next = 0;
    while ((next = s.find(delim, last )) != StringType::npos)
    {
        tokens.push_back( s.substr(last , next - last));
        last = next + 1;
    }
    last += delim.length() - 1;
    if( last < s.length() )
        tokens.push_back( s.substr( last , StringType::npos ));
    return tokens;
}

}
}

#endif
