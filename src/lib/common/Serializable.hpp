#ifndef SERIALIZABLE_HPP
#define SERIALIZABLE_HPP

#include "headers.hpp"
#include "helpers.hpp"

template< typename T >
class Serializable
{
protected:
    Serializable(){}
    T &_instance()
    {
        return static_cast<T const&>(*this);
    }

public:
    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        _instance().objectify( properties );
    }

    template< typename DeObjectifier >
    static T fromObject( const DeObjectifier &properties )
    {
        T t;
        t._populateFromObject( properties );
        return t;
    }

protected:
    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        _instance()._populateFromObject( properties );
    }

    template< typename CharType = char ,
              typename MetaType ,
              typename std::enable_if< std::is_same< char , CharType >::value , int >::type = 0 >
    static auto _meta( MetaType m )
    {
        return T::_metaMap().at( m );
    }

    template< typename CharType = char ,
              typename MetaType ,
              typename std::enable_if< std::is_same< wchar_t , CharType >::value , int >::type = 0 >
    static auto _meta( MetaType m )
    {
        return wevote::io::toStringType( T::_metaMap().at( m ));
    }

    template< class MetaType >
    static const std::map< MetaType , std::string > &_metaMap()
    {
        return T::_metaMap();
    }
};

#endif // SERIALIZABLE_HPP
