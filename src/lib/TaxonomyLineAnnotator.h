#ifndef TAXONOMYLINEANNOTATOR_H
#define TAXONOMYLINEANNOTATOR_H

#include "helpers.hpp"
#include "TaxonomyBuilder.h"
#include "TaxLine.h"
#include "Logger.h"

namespace wevote
{

class TaxonomyLineAnnotator
{
public:
    /**
     * @brief TaxonomyLineAnnotator
     * @param taxonomy
     */
    TaxonomyLineAnnotator( const TaxonomyBuilder &taxonomy );

    /**
     * @brief annotateTaxonomyLines
     * @param taxa
     */
    void annotateTaxonomyLines( std::map< uint32_t , TaxLine > &taxa ) const;

    /**
     * @brief writeResults
     * @param abundance
     * @param filename
     */
    static void writeResults(
            const std::map< uint32_t , TaxLine > &abundance ,
            const std::string &filename );
private:
    const TaxonomyBuilder &_taxonomy;
};


}
#endif // TAXONOMYLINEANNOTATOR_H
