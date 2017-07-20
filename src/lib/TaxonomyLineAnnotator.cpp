#include "TaxonomyLineAnnotator.h"


namespace wevote
{

TaxonomyLineAnnotator::TaxonomyLineAnnotator(
        const TaxonomyBuilder &taxonomy )
    : _taxonomy( taxonomy )
{

}

void TaxonomyLineAnnotator::annotateTaxonomyLines(
        std::map<uint32_t, TaxLine> &taxa ) const
{
    LOG_INFO("Total #reads have Taxon 0 = %d",  taxa[0].count );

    uint32_t totalCounts=
            std::accumulate( taxa.cbegin() , taxa.cend() ,
                             0 , []( int c , const std::pair< uint32_t , wevote::TaxLine > &p ){
        return c + p.second.count;
    });
    LOG_INFO("Total # reads = %d", totalCounts );

    std::for_each( taxa.begin() , taxa.end() ,
                   [&]( std::pair< const uint32_t , wevote::TaxLine > &p )
    {
        p.second.RA = ((double)p.second.count/(double)totalCounts)*100;
        uint32_t taxon = p.first;
        wevote::TaxLine &taxLine = p.second;

        while( taxon != wevote::ReadInfo::noAnnotation )
        {
            const std::string rank = _taxonomy.getRank( taxon );
            const std::string name = _taxonomy.getTaxName( taxon );
            const wevote::RankID id = wevote::Rank::rankID.at( rank );
            const size_t idx = static_cast< size_t >( id );
            taxLine.line[ idx ] = name;
            taxon = _taxonomy.getStandardParent( taxon );
        }
    });
}

}
