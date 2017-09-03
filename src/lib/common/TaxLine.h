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
    std::array< defs::string_t , RANKS_SIZE > line;
    double RA;

    static defs::string_t header( bool csv )
    {
        defs::stringstream_t ss;
        const defs::string_t delim = (csv)? U(",") : U("\t");
        ss << _meta( Meta::Taxon ) << delim
           << _meta( Meta::Count ) << delim
           << io::join( Rank::rankLabels.cbegin() + 1 ,
                        Rank::rankLabels.cend() , delim ) << "\n";
        return ss.str();
    }

    static defs::string_t toString(  const std::map<uint32_t, TaxLine> &abundance , bool csv )
    {
        defs::stringstream_t ss;
        if( csv )
            ss << TaxLine::header( csv );
        for( const std::pair< uint32_t , wevote::TaxLine > &p : abundance)
            ss << p.second.toString( csv );
        return ss.str();
    }

    defs::string_t toString( bool csv ) const
    {
        defs::stringstream_t ss;
        const defs::string_t delim = (csv)? U(",") : U("\t");
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

    static const std::map< Meta , defs::string_t > &_metaMap()
    {
        static const std::map< Meta , defs::string_t > mmap{
            { Meta::Count , U("count")} ,
            { Meta::Line , U("line") } ,
            { Meta::Taxon , U("taxon") }
        };
        return mmap;
    }
};
}


#endif // TAXLINE_H
