#ifndef TAXONOMYLINEANNOTATOR_H
#define TAXONOMYLINEANNOTATOR_H

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
private:
    const TaxonomyBuilder &_taxonomy;
};


}
#endif // TAXONOMYLINEANNOTATOR_H
