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
                                               [&]( uint32_t taxid ){
                return taxid != wevote::ReadInfo::noAnnotation; });
}

void wevoteClassifier( std::vector< ReadInfo > &reads ,
                       const TaxonomyBuilder &taxonomy,
                       int minNumAgreed ,
                       int penalty ,
                       int threads = 1 )
{
    /// WEVOTE algorithm
    std::map<uint32_t, uint32_t> hit_counts;
    std::set<uint32_t> parents;
    std::set<uint32_t>::iterator set_iterator;
    std::map<uint32_t, uint32_t>::iterator iterator_name;
    uint32_t savedTax_2[2];
    uint32_t n=0;
    uint32_t numToolsUsed= reads.front().annotation.size();

    double start = omp_get_wtime();
    omp_set_num_threads(threads);
    LOG_INFO("Min Number of Agreed= %d" , minNumAgreed );

#pragma omp parallel for private (hit_counts, parents, set_iterator, iterator_name, SavedTax_2, n)
    for (uint32_t i=0 ; i<reads.size() ;i++)
    {
        if (reads[i].numToolsReported == 0)
        {
            reads[i].resolvedTaxon=0;
            reads[i].numToolsAgreed=numToolsUsed;
            reads[i].score=1;
            continue;
        }
        else if(reads[i].numToolsReported == 1 && minNumAgreed<=1)
        {
            reads[i].resolvedTaxon=0;
            for (uint32_t j=0 ; j<numToolsUsed ; j++)
            {
                reads[i].resolvedTaxon += reads[i].annotation[j];
            }
            reads[i].numToolsAgreed=1;
            if(reads[i].numToolsAgreed==reads[i].numToolsReported)
            {
                reads[i].score=(double)reads[i].numToolsAgreed / (double)reads[i].numToolsUsed;
            }
            else
            {
                reads[i].score=((double)reads[i].numToolsAgreed / (double)reads[i].numToolsUsed) - (1/penalty*((double)reads[i].numToolsUsed));
            }
            continue;
        }
        else if(reads[i].numToolsReported==2 && minNumAgreed<=2)
        {
            n=0;

            for (uint32_t j=0 ; j<numToolsUsed ; j++)
            {
                if(reads[i].annotation[j])
                {
                    savedTax_2[n]=reads[i].annotation[j];
                    n++;
                }
            }

            reads[i].resolvedTaxon = taxonomy.lca(savedTax_2[0], savedTax_2[1]);
            reads[i].numToolsAgreed=2;
            if(reads[i].numToolsAgreed==reads[i].numToolsReported)
            {
                reads[i].score=(double)reads[i].numToolsAgreed / (double)reads[i].numToolsUsed;
            }
            else
            {
                reads[i].score=(double)reads[i].numToolsReported / (double)(reads[i].numToolsUsed * reads[i].numToolsAgreed);
            }
            continue;
        }
        else if(reads[i].numToolsReported>=3)
        {
            hit_counts.clear();
            for (uint32_t j=0 ; j<numToolsUsed ; j++)
            {
                parents = taxonomy.getAncestry(reads[i].annotation[j]);
                for(set_iterator = parents.begin(); set_iterator != parents.end(); set_iterator++)
                    hit_counts[*set_iterator]++;
            }

            /// Resolve tree for each sequence to get WEVOTE annotation
            reads[i].resolvedTaxon =
                    taxonomy.resolveTree( hit_counts , reads[i].numToolsReported ,
                                          minNumAgreed);
            reads[i].numToolsAgreed=
                    hit_counts[reads[i].resolvedTaxon];

            if(reads[i].numToolsAgreed==reads[i].numToolsReported)
                reads[i].score=
                        (double)reads[i].numToolsAgreed /
                        (double)reads[i].numToolsUsed;

            else
                reads[i].score=
                        ((double)reads[i].numToolsAgreed /
                         (double)(reads[i].numToolsUsed)) -
                        (1.f/ (penalty * ((double)reads[i].numToolsUsed)));
        }
        else
        {
            reads[i].resolvedTaxon=0;
            reads[i].numToolsAgreed=0;
            reads[i].score=0;
            continue;
        }
    }
    double end = omp_get_wtime();
    double total=end-start;
    LOG_INFO("WEVOTE classification executed in=%f" , total );
}

}
#endif // WEVOTE_HPP
