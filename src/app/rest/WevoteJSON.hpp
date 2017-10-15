#ifndef WEVOTEJSON_HPP
#define WEVOTEJSON_HPP

#include <type_traits>
#include "helpers.hpp"
#include "cpprest/json.h"
#include "Logger.h"

namespace wevote
{
namespace io
{

template< typename T >
using isWStringType = std::is_same< T , std::wstring >;
template< typename T >
using isStringType = std::is_same< T , std::string >;
template< typename T >
using isSuppotedString = std::is_same< T , defs::string_t >;
template< typename T >
using isBoolType = std::is_same< T , bool >;
template< typename T>
using isArithmeticType = std::is_arithmetic< T >;
template< typename T >
using enableIfNumber = std::enable_if< std::is_arithmetic< T >::value && !std::is_same< T , bool >::value , int >;
template< typename T >
using enableIfAPISupported = std::enable_if< isWStringType< T >::value ||
isStringType< T >::value || isArithmeticType< T >::value , int >;
template< typename T >
using enableIfSupportedString = std::enable_if< ( isWStringType< T >::value ||
isStringType< T >::value ) && isSuppotedString< T >::value , int >;
template< typename T >
using disableIfSupportedString = std::enable_if< ( isWStringType< T >::value ||
isStringType< T >::value ) && !isSuppotedString< T >::value , int >;
template< typename T >
using disableIfAPISupported = std::enable_if< !isWStringType< T >::value &&
!isStringType< T >::value && !isArithmeticType< T >::value , int >;

class Objectifier
{
private:

    template< typename T ,
              typename disableIfAPISupported< T >::type = 0 >
    static web::json::value _toValue( const T &t )
    {
        return _nonPODToValue< T >( t );
    }

    template< typename T ,
              typename enableIfNumber< T >::type = 0 >
    static web::json::value _toValue( T number )
    {
        return web::json::value::number( number );
    }

    template< typename T ,
              typename std::enable_if< isBoolType< T >::value , int >::type = 0>
    static web::json::value _toValue( T arg )
    {
        return web::json::value::boolean( arg );
    }

    template< typename T ,
              typename enableIfSupportedString< T >::type =0>
    static web::json::value _toValue( const T &str )
    {
        return web::json::value::string( str );
    }

    template< typename T ,
              typename disableIfSupportedString< T >::type =0>
    static web::json::value _toValue( const T &str )
    {
        return web::json::value::string(io::toStringType( str ));
    }

public:
    template< typename T >
    static web::json::value objectFrom( const T &object )
    {
        return _toValue( object );
    }

    template< typename T >
    static web::json::value objectFromArray( const std::vector< T > &objects )
    {
        web::json::array array;
        std::transform( objects.cback() ,
                        objects.cend(),
                        std::inserter( array , std::end( array )) , _toValue< T > );
        return array;
    }

    web::json::value getObject() const
    {
        return _object;
    }

    template< typename T >
    void objectify( const utility::string_t &key , const T &value )
    {
        web::json::value val = _toValue< T >( value );
        _object[ key ] = val;
    }

    template< typename SeqIt >
    void objectify( const utility::string_t &key , SeqIt firstIt , SeqIt lastIt )
    {
        std::vector< web::json::value > array;
        using T = typename SeqIt::value_type;
        std::transform( firstIt , lastIt , std::inserter( array , std::end( array )) , _toValue< T > );
        _object[ key ] = web::json::value::array( array );
    }
private:
    Objectifier()
        : _object( web::json::value::object())
    {
    }

    template< typename T >
    static web::json::value _nonPODToValue( T object )
    {
        Objectifier properties;
        object.objectify( properties );
        return properties.getObject();
    }

    template< typename T >
    static std::string toString( const T &t )
    {
        return _toValue( t ).serialize();
    }

    web::json::value _object;
};

class DeObjectifier
{
public:
    template< typename T >
    static T fromObject( web::json::value object )
    {
        DeObjectifier properties( object );
        return T::fromObject( properties );
    }

private:
    DeObjectifier( web::json::value object )
        : _object( object )
    {

    }

    template< typename T ,
              typename std::enable_if< std::is_arithmetic< T >::value , int  >::type = 0 >
    static T _fromValue( const web::json::value &number )
    {
        return static_cast< T >( number.as_double());
    }

    template< typename T ,
              typename std::enable_if<std::is_same< T, bool>::value , int >::type = 0 >
    static bool _fromValue( const web::json::value &boolArg )
    {
        return boolArg.as_bool();
    }

    template< typename T ,
              typename enableIfSupportedString< T >::type = 0 >
    static defs::string_t _fromValue( const web::json::value &str )
    {
        return str.as_string();
    }

    template< typename T ,
              typename disableIfSupportedString< T >::type = 0 >
    static std::string _fromValue( const web::json::value &str )
    {
        return wevote::io::toStringType( str.as_string());
    }

    template< typename T,
              typename disableIfAPISupported< T >::type = 0>
    static T _fromValue( const web::json::value &value )
    {
        return DeObjectifier::fromObject< T >( value );
    }

public:
    template< typename T >
    static std::vector< T > toStdArray( web::json::value objects )
    {
        try
        {
            const web::json::array array = objects.as_array();
            std::vector< T > stdArray;
            std::transform( array.cbegin() , array.cend() ,
                            std::inserter( stdArray , std::end( stdArray )) ,
                            fromObject< T > );
            return stdArray;
        }
        catch( ... )
        {
            if( !objects.is_array())
                LOG_WARNING("Trying to get array from non-array object. object:%s",
                            USTR(objects.serialize()));

        }
    }

    template< typename T >
    void deObjectify( const utility::string_t &key , T &value ) const
    {
        try
        {
            value = _fromValue< T >( _object.at( key ));
        }
        catch( ... )
        {

//            LOG_WARNING("Trying to get type: <%s>,<key:%s> from <%s>", typeid(T).name(),
//                        key.c_str() , _object.serialize().c_str());
        }
    }

    template< typename T >
    void deObjectifyArray( const utility::string_t &key , std::vector< T > &dest ) const
    {
        try
        {
            std::function<T(const web::json::value&)> fromval = _fromValue< T >;
            const web::json::value value = _object.at( key );
            const web::json::array array = value.as_array();
            std::transform( array.cbegin() , array.cend() ,
                            std::inserter( dest , std::end( dest )) ,
                            fromval );
        }
        catch( ... )
        {
//            LOG_WARNING("Trying to get type: <%s> from <%s>", typeid(T).name(),
//                        USTR(_object.serialize()));
        }
    }
private:

    web::json::value _object;
};

struct WevoteEnsembleSubmissionRequest
{

};

}
}

#endif // WEVOTEJSON_HPP
