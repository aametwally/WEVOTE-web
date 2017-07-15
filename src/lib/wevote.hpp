#ifndef WEVOTE_HPP
#define WEVOTE_HPP

#include "headers.hpp"
#include "Logger.h"
#include "TaxonomyBuilder.h"

namespace wevote
{
void wevotePreprocessing( std::vector< ReadInfo > &reads,
                          const TaxonomyBuilder &taxonomy )
{
    uint32_t numToolsUsed= reads.front().annotation.size();
    uint32_t numReads= reads.size();

    LOG_INFO("Num of reads= %d" , numReads );
    LOG_INFO("Num of used tools= %d" , numToolsUsed );

    for( wevote::ReadInfo &read : reads )
        read.numToolsUsed = numToolsUsed;

    /// Correct TaxonID for the not standard ranks
    taxonomy.correctTaxa( reads );

    /// Count number of tools that identified each sequences
    for( wevote::ReadInfo &read : reads )
        read.numToolsReported = std::count_if( read.annotation.cbegin() ,
                                               read.annotation.cend() ,
                                               []( uint32_t taxid ){
                return taxid != wevote::ReadInfo::noAnnotation; });
}

void wevoteClassifier( std::vector< ReadInfo > &reads ,
                       const TaxonomyBuilder &taxonomy,
                       int minNumAgreed ,
                       int penalty ,
                       int threads = 1 )
{
    /// WEVOTE algorithm
    const uint32_t numToolsUsed= reads.front().annotation.size();

    double start = omp_get_wtime();
    omp_set_num_threads(threads);
    LOG_INFO("Min Number of Agreed= %d" , minNumAgreed );

#pragma omp parallel for
    for (uint32_t i=0 ; i<reads.size() ;i++)
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

            WEVOTE_ASSERT( n == 1 , "n must be 1.");

            read.resolvedTaxon = taxonomy.lca(savedTax_2[0], savedTax_2[1]);
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
                for( uint32_t parent : taxonomy.getAncestry( annotation ) )
                    hitCounts[ parent ]++;

            /// Resolve tree for each sequence to get WEVOTE annotation
            read.resolvedTaxon =
                    taxonomy.resolveTree( hitCounts , read.numToolsReported ,
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
    LOG_INFO("WEVOTE classification executed in=%f" , total );
}
}
#endif // WEVOTE_HPP
