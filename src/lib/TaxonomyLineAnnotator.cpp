#include "TaxonomyLineAnnotator.h"


namespace wevote
{

TaxonomyLineAnnotator::TaxonomyLineAnnotator(
        const TaxonomyBuilder &taxonomy )
    : _taxonomy( taxonomy )
{

}

std::map< uint32_t , TaxLine >
TaxonomyLineAnnotator::annotateTaxonomyLines(
        const std::vector< ReadInfo > &classifiedReads ) const
{
    std::map< uint32_t , TaxLine > annotatedTaxa;
    std::map< uint32_t , uint32_t > taxCounter;
    for( const ReadInfo &read : classifiedReads )
    {
        ++taxCounter[ _taxonomy.correctTaxan( read.resolvedTaxon )];
    }

    std::for_each( taxCounter.cbegin() , taxCounter.cend() ,
                   [&annotatedTaxa]( const std::pair< uint32_t , uint32_t > &p)
    {
        annotatedTaxa[ p.first ].taxon = p.first;
        annotatedTaxa[ p.first ].count = p.second;
    });


    uint32_t totalCounts=
            std::accumulate( annotatedTaxa.cbegin() ,
                             annotatedTaxa.cend() ,
                             0 , []( int c , const std::pair< uint32_t , wevote::TaxLine > &p ){
        return c + p.second.count;
    });
    LOG_INFO("Total # reads = %d", totalCounts );

    for( auto it = annotatedTaxa.begin() ; it != annotatedTaxa.end() ; ++it )
    {
        it->second.RA = ((double)it->second.count/(double)totalCounts)*100;
        uint32_t taxon = it->first;
        wevote::Ancestry &taxLine = it->second.ancestry;

        while( taxon != wevote::ReadInfo::noAnnotation )
        {
            const std::string rank = _taxonomy.getRank( taxon );
            const std::string name = _taxonomy.getTaxName( taxon );
            const wevote::RankID id = wevote::Rank::rankID.at( rank );
            const size_t idx = static_cast< size_t >( id );
            std::cout << "[tax:" << taxon << "][idx:" << idx << "][name:" << name << "][rank:" << rank << "]" << std::endl;
            taxLine.line[ idx ] = name;
            taxon = _taxonomy.getStandardParent( taxon );
        }
    }

    return annotatedTaxa;
}


void TaxonomyLineAnnotator::writeResults(
        const std::map<uint32_t, TaxLine> &abundance,
        const std::string &filename ,
        bool csv  )
{
    std::ofstream myfile;
    myfile.open (filename.c_str());
    if (!myfile.is_open())
        LOG_ERROR("Error opening Output file: %s", filename.c_str());
    myfile << TaxLine::toString( abundance , csv );
    myfile.close();
}

}
