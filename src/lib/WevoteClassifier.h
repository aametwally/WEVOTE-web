#ifndef WEVOTECLASSIFIER_H
#define WEVOTECLASSIFIER_H

#include "TaxonomyBuilder.h"
#include "Logger.h"

namespace wevote
{
class WEVOTE_DLL WevoteClassifier
{
public:
    /**
     * @brief WevoteClassifier
     * @param taxonomy
     */
    WevoteClassifier( const TaxonomyBuilder &taxonomy );

    /**
     * @brief classify
     * @param reads
     */
    void classify( std::vector< ReadInfo > &reads ,
                   int minNumAgreed ,
                   int penalty ,
                   int threads = 1) const;
protected:
    /**
     * @brief _preprocessReads
     * @param reads
     */
    void _preprocessReads( std::vector< ReadInfo > &reads ) const;

private:
    const TaxonomyBuilder &_taxonomy;
};
}
#endif // WEVOTECLASSIFIER_H
