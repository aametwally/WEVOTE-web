#include "WevoteClassifier.h"

namespace wevote
{

WevoteClassifier::WevoteClassifier( const TaxonomyBuilder &taxonomy )
    : _taxonomy( taxonomy )
{

}

void WevoteClassifier::classify(
        std::vector<ReadInfo> &reads,
        int minNumAgreed, int penalty, int threads) const
{
    LOG_INFO("Preprocessing reads..");
    preprocessReads( reads );
    LOG_INFO("[DONE] Preprocessing reads..");

    /// WEVOTE algorithm
    const int numToolsUsed = reads.front().annotation.size();

    if( minNumAgreed > numToolsUsed)
        LOG_ERROR("It's not allwed that minNumAgreed > numTools");

    double start = omp_get_wtime();
    omp_set_num_threads(threads);
    LOG_DEBUG("Min Number of Agreed= %d" , minNumAgreed );

    LOG_INFO("Classification (%d threads)..",threads);
#pragma omp parallel for
    for (int i=0 ; i<reads.size() ;i++)
    {
        ReadInfo &read = reads[i];
        if ( read.numToolsReported == 0)
        {
            read.resolvedTaxon=0;
            read.numToolsAgreed=numToolsUsed;
            read.score=1;
        }
        else if( read.numToolsReported == 1 && minNumAgreed<=1)
        {
            read.resolvedTaxon=0;
            for ( uint32_t annotation : read.annotation )
                read.resolvedTaxon += annotation;

            read.numToolsAgreed=1;
            if( read.numToolsAgreed == read.numToolsReported )
                read.score=
                        (double)read.numToolsAgreed /
                        (double)read.numToolsUsed;

            else
                read.score =
                        ((double)read.numToolsAgreed /
                         (double)read.numToolsUsed) -
                        (1.f/penalty*((double)read.numToolsUsed));
        }
        else if(read.numToolsReported==2 && minNumAgreed<=2)
        {
            int n=0;
            uint32_t savedTax_2[2];
            for ( uint32_t annotation : read.annotation )
                if( annotation != ReadInfo::noAnnotation )
                    savedTax_2[n++]=annotation;

            WEVOTE_ASSERT( n == 2 , "n must be 2.");

            read.resolvedTaxon = _taxonomy.lca(savedTax_2[0], savedTax_2[1]);
            read.numToolsAgreed=2;
            if(read.numToolsAgreed==read.numToolsReported)
                read.score =
                        (double)read.numToolsAgreed /
                        (double)read.numToolsUsed;
            else
                read.score =
                        (double)read.numToolsReported /
                        (double)(read.numToolsUsed * read.numToolsAgreed);
        }
        else if( read.numToolsReported >= 3 )
        {
            std::map<uint32_t, uint32_t> hitCounts;
            for ( uint32_t annotation : read.annotation)
                for( uint32_t parent : _taxonomy.getAncestry( annotation ) )
                    hitCounts[ parent ]++;

            /// Resolve tree for each sequence to get WEVOTE annotation
            read.resolvedTaxon =
                    _taxonomy.resolveTree( hitCounts , read.numToolsReported ,
                                           minNumAgreed);
            read.numToolsAgreed=
                    hitCounts[read.resolvedTaxon];

            if(read.numToolsAgreed==read.numToolsReported)
                read.score=
                        (double)read.numToolsAgreed /
                        (double)read.numToolsUsed;

            else
                read.score=
                        ((double)read.numToolsAgreed /
                         (double)(read.numToolsUsed)) -
                        (1.f/ (penalty * ((double)read.numToolsUsed)));
        }
        else
        {
            read.resolvedTaxon=0;
            read.numToolsAgreed=0;
            read.score=0;
        }
    }
    double end = omp_get_wtime();
    double total=end-start;
    LOG_INFO("[DONE] Classification (%d threads)..",threads);
    LOG_INFO("WEVOTE classification executed in=%f" , total );
}

std::vector<ReadInfo> WevoteClassifier::getUnclassifiedReads(
        const std::string &filename , std::string delim )
{
    const std::vector<std::string> lines = io::getFileLines( filename );
    return ReadInfo::parseUnclassifiedReads( lines.cbegin() , lines.cend() , delim );
}

void WevoteClassifier::writeResults(
        const std::vector<ReadInfo> &reads,
        const std::string &fileName ,
        bool csv )
{
    /// Export the detailed output in txt format
    std::ofstream myfile;
    myfile.open (fileName.c_str());
    if (!myfile.is_open())
        LOG_ERROR("Error opening Output file:%s",fileName);
    myfile << ReadInfo::toString( reads.cbegin() , reads.cend() , csv );
    myfile.close();
}

std::vector< ReadInfo >
WevoteClassifier::getClassifiedReads(
        const std::string &filename  ,
        bool csv )
{
    const std::string delim = (csv)? ",": "\t";
    const std::vector< std::string > lines = io::getFileLines( filename );
    return ReadInfo::parseClassifiedReads( lines.cbegin() , lines.cend() , delim );
}

void WevoteClassifier::preprocessReads( std::vector<ReadInfo> &reads ) const
{
    uint32_t numToolsUsed= reads.front().annotation.size();
    uint32_t numReads= reads.size();

    LOG_INFO("Num of reads= %d" , numReads );
    LOG_INFO("Num of used tools= %d" , numToolsUsed );

    for( wevote::ReadInfo &read : reads )
        read.numToolsUsed = numToolsUsed;

    /// Correct TaxonID for the not standard ranks
    _taxonomy.correctTaxa( reads );

    /// Count number of tools that identified each sequences
    for( wevote::ReadInfo &read : reads )
        read.numToolsReported = std::count_if( read.annotation.cbegin() ,
                                               read.annotation.cend() ,
                                               []( uint32_t taxid ){
                return ReadInfo::isAnnotation( taxid ); });
}

}
