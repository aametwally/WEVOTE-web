#ifndef WEVOTECLASSIFIER_H
#define WEVOTECLASSIFIER_H

#include "TaxonomyBuilder.h"
#include "TaxLine.h"
#include "helpers.hpp"
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

    /**
     * @brief getReads
     * @param filename
     * @return
     */
    static std::vector< ReadInfo >
    getReads( const std::string &filename );

    /**
     * @brief writeResults
     * @param reads
     * @param fileName
     */
    static void writeResults(
            const std::vector< ReadInfo > &reads ,
            const std::string &fileName );

    /**
     * @brief readWevoteFile
     * @param filename
     * @param taxonomy
     * @return
     */
    static std::map< uint32_t , TaxLine >
    readResults( const std::string &filename ,
                 const TaxonomyBuilder &taxonomy );

    /**
     * @brief _preprocessReads
     * @param reads
     */
    void preprocessReads( std::vector< ReadInfo > &reads ) const;

private:
    const TaxonomyBuilder &_taxonomy;
};
}
#endif // WEVOTECLASSIFIER_H
