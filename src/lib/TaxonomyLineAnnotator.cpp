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
        taxCounter[ read.resolvedTaxon ]++;

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

    std::for_each( annotatedTaxa.begin() , annotatedTaxa.end() ,
                   [this,totalCounts](
                   std::pair< const uint32_t , wevote::TaxLine > &p )
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

    const std::string delim = (csv)? "," : "\t";

    myfile << "taxon" << delim
           << "count" << delim
           << io::join( Rank::rankLabels.cbegin() + 1 ,
                        Rank::rankLabels.cend() , delim ) << "\n";

    for( const std::pair< uint32_t , wevote::TaxLine > &p : abundance)
        myfile << p.second.taxon << delim
               << p.second.count << delim
               << io::join( p.second.line.cbegin() + 1 ,
                            p.second.line.cend() , delim ) << "\n";
    myfile.close();
}

}
