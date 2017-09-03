#ifndef SERIALIZABLE_HPP
#define SERIALIZABLE_HPP

#include "headers.hpp"

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

    template< class MetaType >
    static defs::string_t _meta( MetaType m )
    {
        return T::_metaMap().at( m );
    }

    template< class MetaType >
    static const std::map< MetaType , defs::string_t > &_metaMap()
    {
        return T::_metaMap();
    }
};

#endif // SERIALIZABLE_HPP
