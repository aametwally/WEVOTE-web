#ifndef WEVOTECLASSIFIER_H
#define WEVOTECLASSIFIER_H

// local lib/common
#include "Logger.h"
#include "helpers.hpp"

// local lib
#include "TaxonomyBuilder.h"
#include "ReadInfo.h"
#include "TaxLine.h"
#include "TaxonomyBuilder.h"
namespace wevote
{


class WEVOTE_DLL WevoteClassifier
{
public:
    using DistanceFunctionType = std::function<double(const std::vector<double>&)>;

    /**
     * @brief WevoteClassifier
     * @param taxonomy
     */
    explicit WevoteClassifier( const TaxonomyBuilder &taxonomy );

    /**
     * @brief classify
     * @param reads
     */
    void classify(
            std::vector< ReadInfo > &reads ,
            int minNumAgreed ,
            int penalty ,
            DistanceFunctionType distanceFunction = manhattanDistance() ,
            int threads = 1 ) const;

    /**
     * @brief getReads
     * @param filename
     * @return
     */
    static std::pair<std::vector<ReadInfo>, std::vector<std::string> >
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
    static std::pair<std::vector<ReadInfo>, std::vector<std::string> >
    getClassifiedReads( const std::string &filename , bool csv = false );

    /**
     * @brief _preprocessReads
     * @param reads
     */
    void preprocessReads( std::vector< ReadInfo > &reads ) const;


    /**
     * @brief algorithmsAccumulativeDistances
     * @param reads
     * @param algorithms
     * @param distanceFunction
     * @return
     */
    std::map< std::string , double >
    algorithmsAccumulativeDistances( const std::vector< ReadInfo > &reads ,
                                     const std::vector< std::string > &algorithms ,
                                     DistanceFunctionType distanceFunction = euclideanDistance()) const;

    /**
     * @brief manhattanDistance
     * @return
     */
    static DistanceFunctionType manhattanDistance();

    /**
     * @brief euclideanDistance
     * @return
     */
    static DistanceFunctionType euclideanDistance();
private:
    std::vector< double > _computeDistance( const ReadInfo &read ) const;

private:
    const TaxonomyBuilder &_taxonomy;
};
}  // namespace wevote  // namespace wevote
#endif // WEVOTECLASSIFIER_H
