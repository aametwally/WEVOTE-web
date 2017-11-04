#ifndef HELPERS_HPP
#define HELPERS_HPP

#include "headers.hpp"

namespace wevote
{
namespace io
{

template< typename StringType ,
          typename std::enable_if< std::is_same< std::string , StringType >::value , int >::type = 0 >
std::wstring toStringType( const StringType &str )
{
    std::wstring temp(str.length(),U(' '));
    std::copy(str.begin(), str.end(), temp.begin());
    return temp;
}

template< typename StringType ,
          typename std::enable_if< std::is_same< std::wstring , StringType >::value , int >::type = 0 >
std::string toStringType( const StringType &str )
{
    std::string temp(str.length(), ' ');
    std::copy(str.begin(), str.end(), temp.begin());
    return temp;
}

template< typename ConvertedType ,
          typename StringType ,
          typename std::enable_if< std::is_same< ConvertedType , StringType >::value , int >::type = 0 >
const StringType &convertOrReturn( const StringType &str )
{
    return str;
}

template< typename ConvertedType ,
          typename StringType ,
          typename std::enable_if< !std::is_same< ConvertedType , StringType >::value , int >::type = 0 >
ConvertedType convertOrReturn( const StringType &str )
{
    return toStringType( str );
}

template< typename SeqIt, typename SeperatorType  >
auto join( SeqIt first , SeqIt last , const SeperatorType &sep )
{
    using StringType = typename std::iterator_traits< SeqIt >::value_type;
    auto binaryJoinString = [sep]( StringType &a , const StringType &b )->StringType&
    {
        return (a += sep) += b ;
    };

    if( first == last )
        return StringType();
    else if ( std::next( first , 1 ) == last )
        return *first;
    else
    {
        StringType result = *first;
        result.reserve( std::accumulate( first , last , std::distance( first , last ) ,
                                         []( size_t size , const StringType &s ){ return size + s.size();}));
        return std::accumulate( std::next( first , 1 ) , last ,
                                result , binaryJoinString  );
    }
}

template< typename SeperatorType , typename Container >
typename Container::value_type join( const Container &container ,
                                     const SeperatorType &sep )
{
    return join( container.cbegin() , container.cend() , sep );
}

template< typename StringType ,
          typename T ,
          typename std::enable_if< std::is_same< StringType , std::string >::value , int >::type = 0>
std::string toString( T value )
{
    return std::to_string( value );
}

template< typename StringType ,
          typename T ,
          typename std::enable_if< std::is_same< StringType , std::wstring >::value , int >::type = 0>
std::wstring toString( T value )
{
    return std::to_wstring( value );
}

template< typename CharType = char ,  typename SeqIt >
std::vector< std::basic_string< CharType >> asStringsVector( SeqIt firstIt , SeqIt lastIt )
{

    using T = typename std::iterator_traits< SeqIt >::value_type;
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
    else std::cout << "Failed to open file:" << filePath << std::endl;
    return lines;
}

template< typename CharType = char >
void flushStringToFile( const std::basic_string< CharType > &data , const std::string &filePath )
{
    std::basic_ofstream< CharType > myfile;
    myfile.open (filePath.c_str());
    if (!myfile.is_open())
        std::cout << "Error opening Output file:" << filePath << std::endl;
    else
    {
        myfile << data;
        myfile.close();
    }
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
