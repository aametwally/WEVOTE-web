#ifndef TAXLINE_H
#define TAXLINE_H

#include "headers.hpp"
#include "helpers.hpp"
#include "Rank.h"
#include "Serializable.hpp"

namespace wevote
{

struct TaxLine : public Serializable<TaxLine>
{
protected:
    friend class Serializable< TaxLine >;
    enum class Meta{
        Taxon ,
        Count ,
        Line
    };

public:
    uint32_t taxon;
    uint32_t count;
    std::array< std::string , RANKS_SIZE > line;
    double RA;

    static std::string header( bool csv )
    {
        std::stringstream ss;
        const std::string delim = (csv)? "," : "\t";
        ss << _meta( Meta::Taxon ) << delim
           << _meta( Meta::Count ) << delim
           << io::join( Rank::rankLabels.cbegin() + 1 ,
                        Rank::rankLabels.cend() , delim ) << "\n";
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
           << io::join( line.cbegin() + 1 ,
                        line.cend() , delim ) << "\n";
        return ss.str();
    }

    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        properties.objectify( _meta( Meta::Taxon ) , taxon );
        properties.objectify( _meta( Meta::Count ) , count );
        properties.objectify( _meta( Meta::Line  ) , line.cbegin() , line.cend());
    }

protected:
    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        properties.deObjectify( _meta( Meta::Taxon ) , taxon );
        properties.deObjectify( _meta( Meta::Count ) , count );
        properties.deObjectifyArray( _meta( Meta::Line  ) , line );
    }

    static const std::map< Meta , std::string > &_metaMap()
    {
        static const std::map< Meta , std::string > mmap{
            { Meta::Count , "count"} ,
            { Meta::Line , "line" } ,
            { Meta::Taxon , "taxon" }
        };
        return mmap;
    }
};
}


#endif // TAXLINE_H
