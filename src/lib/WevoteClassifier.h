#ifndef WEVOTECLASSIFIER_H
#define WEVOTECLASSIFIER_H

#include "TaxonomyBuilder.h"
#include "ReadInfo.h"
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
    static std::pair< std::vector< ReadInfo > ,  std::vector< std::string >>
    getUnclassifiedReads(const std::string &filename , std::string delim = ",");

    /**
     * @brief writeResults
     * @param reads
     * @param fileName
     */
    static void writeResults( const std::vector< ReadInfo > &reads , const std::vector<std::string> &tools,
                              const std::string &fileName , bool csv = false );

    /**
     * @brief readWevoteFile
     * @param filename
     * @param taxonomy
     * @return
     */
    static std::pair< std::vector< ReadInfo > ,  std::vector< std::string >>
    getClassifiedReads( const std::string &filename , bool csv = false );

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
