#ifndef TAXONOMYLINEANNOTATOR_H
#define TAXONOMYLINEANNOTATOR_H

// local lib/common
#include "Logger.h"
#include "helpers.hpp"

// local lib
#include "TaxLine.h"
#include "TaxonomyBuilder.h"
namespace wevote
{

class WEVOTE_DLL TaxonomyLineAnnotator
{
public:
    /**
     * @brief TaxonomyLineAnnotator
     * @param taxonomy
     */
    explicit explicit TaxonomyLineAnnotator( const TaxonomyBuilder &taxonomy );


    /**
     * @brief annotateTaxonomyLines
     * @param classifiedReads
     * @return
     */
    std::map<uint32_t, TaxLine>
    annotateTaxonomyLines(const std::vector<ReadInfo> &classifiedReads) const;

    /**
     * @brief writeResults
     * @param abundance
     * @param filename
     */
    static void writeResults(const std::map< uint32_t , TaxLine > &abundance ,
                             const std::string &filename , bool csv = true );
private:
    const TaxonomyBuilder &_taxonomy;
};


}  // namespace wevote  // namespace wevote
#endif // TAXONOMYLINEANNOTATOR_H
