#ifndef TAXLINE_H
#define TAXLINE_H

#include "headers.hpp"
#include "helpers.hpp"
#include "Rank.h"
#include "Serializable.hpp"

namespace wevote
{

struct Ancestry : public Serializable< Ancestry >
{
public:
    static std::string header( bool csv )
    {
        const std::string delim = (csv)? "," : "\t";
        return io::join( Rank::rankLabels.cbegin() + 1 ,
                         Rank::rankLabels.cend() , delim ) ;
    }

    std::string toString( bool csv ) const
    {
        const std::string delim = (csv)? "," : "\t";
        return io::join( line.cbegin() + 1 ,
                         line.cend() , delim ) ;
    }

    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        auto meta = _meta< defs::char_t , Meta >;

        properties.objectify( meta( Meta::Root ) ,
                              line.at( rankIndex( Meta::Root )));
        properties.objectify( meta( Meta::Superkingdom ) ,
                              line.at( rankIndex( Meta::Superkingdom )));
        properties.objectify( meta( Meta::Kingdom ) ,
                              line.at( rankIndex( Meta::Kingdom )));
        properties.objectify( meta( Meta::Phylum ) ,
                              line.at( rankIndex( Meta::Phylum )));
        properties.objectify( meta( Meta::Class ) ,
                              line.at( rankIndex( Meta::Class )));
        properties.objectify( meta( Meta::Order ) ,
                              line.at( rankIndex( Meta::Order )));
        properties.objectify( meta( Meta::Family ) ,
                              line.at( rankIndex( Meta::Family )));
        properties.objectify( meta( Meta::Genus ) ,
                              line.at( rankIndex( Meta::Genus )));
        properties.objectify( meta( Meta::Species ) ,
                              line.at( rankIndex( Meta::Species )));
    }
protected:
    friend class Serializable< Ancestry >;
    friend class TaxonomyLineAnnotator;
    enum class Meta {
        Root = 0  ,
        Superkingdom,
        Kingdom,
        Phylum ,
        Class ,
        Order ,
        Family ,
        Genus ,
        Species
    };

    template< typename EnumeratorType >
    static size_t rankIndex( EnumeratorType id )
    {
        return static_cast< size_t >( id );
    }

    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        auto meta = _meta< defs::char_t , Meta >;

        properties.deObjectify( meta( Meta::Root ) ,
                                line[ rankIndex( Meta::Root ) ]);
        properties.deObjectify( meta( Meta::Superkingdom ) ,
                                line[ rankIndex( Meta::Superkingdom ) ]);
        properties.deObjectify( meta( Meta::Kingdom ) ,
                                line[ rankIndex( Meta::Kingdom ) ]);
        properties.deObjectify( meta( Meta::Phylum ) ,
                                line[ rankIndex( Meta::Phylum ) ]);
        properties.deObjectify( meta( Meta::Class ) ,
                                line[ rankIndex( Meta::Class ) ]);
        properties.deObjectify( meta( Meta::Order ) ,
                                line[ rankIndex( Meta::Order ) ]);
        properties.deObjectify( meta( Meta::Family ) ,
                                line[ rankIndex( Meta::Family ) ]);
        properties.deObjectify( meta( Meta::Genus ) ,
                                line[ rankIndex( Meta::Genus ) ]);
        properties.deObjectify( meta( Meta::Species ) ,
                                line[ rankIndex( Meta::Species ) ]);
    }

    static const std::map< Meta , std::string > &_metaMap()
    {
        static const std::map< Meta , std::string > mmap{
            { Meta::Root        , RANK_ROOT }  ,
            { Meta::Superkingdom, RANK_SUPERKINGDOM },
            { Meta::Kingdom     , RANK_KINGDOM },
            { Meta::Phylum      , RANK_PHYLUM } ,
            { Meta::Class       , RANK_CLASS } ,
            { Meta::Order       , RANK_ORDER} ,
            { Meta::Family      , RANK_FAMILY } ,
            { Meta::Genus       , RANK_GENUS } ,
            { Meta::Species     , RANK_SPECIES }
        };
        return mmap;
    }

    std::array< std::string , RANKS_SIZE > line;

};

struct TaxLine : public Serializable<TaxLine>
{
protected:
    friend class Serializable< TaxLine >;
    enum class Meta{
        Taxon ,
        Count ,
        Ancestry
    };

public:
    uint32_t taxon;
    uint32_t count;
    Ancestry ancestry;
    double RA;

    static std::string header( bool csv )
    {
        std::stringstream ss;
        const std::string delim = (csv)? "," : "\t";
        ss << _meta( Meta::Taxon ) << delim
           << _meta( Meta::Count ) << delim
           << Ancestry::header( csv ) << "\n";
        return ss.str();
    }

    static std::string toString(  const std::map<uint32_t, TaxLine> &abundance , bool csv )
    {
        std::stringstream ss;
        if( csv )
            ss << TaxLine::header( csv );
        for( const std::pair< uint32_t , wevote::TaxLine > &p : abundance)
            ss << p.second.toString( csv );
        return ss.str();
    }

    std::string toString( bool csv ) const
    {
        std::stringstream ss;
        const std::string delim = (csv)? "," : "\t";
        ss << taxon << delim
           << count << delim
           << ancestry.toString( csv ) << "\n";
        return ss.str();
    }

    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        auto meta = _meta< defs::char_t , Meta >;
        properties.objectify( meta( Meta::Taxon ) , taxon );
        properties.objectify( meta( Meta::Count ) , count );
        properties.objectify( meta( Meta::Ancestry ) ,  ancestry );
    }

protected:
    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        auto meta = _meta< defs::char_t , Meta >;

        properties.deObjectify( meta( Meta::Taxon ) , taxon );
        properties.deObjectify( meta( Meta::Count ) , count );
        properties.deObjectify( meta( Meta::Ancestry ) , ancestry );
    }

    static const std::map< Meta , std::string > &_metaMap()
    {
        static const std::map< Meta , std::string > mmap{
            { Meta::Count , "count" } ,
            { Meta::Taxon , "taxon" } ,
            { Meta::Ancestry , "taxline" }
        };
        return mmap;
    }
};
}


#endif // TAXLINE_H
