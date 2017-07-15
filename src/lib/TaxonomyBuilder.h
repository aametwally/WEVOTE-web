#ifndef TAXONOMYBUILDER_H
#define TAXONOMYBUILDER_H

#include "headers.hpp"
#include "Logger.h"

namespace wevote
{
class WEVOTE_DLL TaxonomyBuilder
{
public:
    TaxonomyBuilder( const std::string &nodesFilename ,
                     const std::string &namesFilename );

    /**
     * @brief getRank
     * @param taxid
     * @return
     */
    std::string getRank( uint32_t taxid ) const;

    /**
     * @brief getTaxName
     * @param taxid
     * @return
     */
    std::string getTaxName( uint32_t taxid ) const;

    /**
     * @brief getStandardParent
     * @param taxid
     * @return
     */
    uint32_t getStandardParent( uint32_t taxid ) const;

    /**
     * @brief correctTaxan
     * Convert non-standard taxon to a standard taxon (per taxon)
     * @param tempTax
     * @return
     */
    uint32_t correctTaxan( uint32_t tempTax ) const;

    /**
     * @brief lca
     * Get LCA of two nodes.
     * @param a
     * @param b
     * @return
     */
    uint32_t lca(uint32_t a, uint32_t b) const;

    /**
     * @brief getAncestry
     * Get all ancestry of a taxon.
     * @param taxon
     * @return
     */
    std::set<uint32_t> getAncestry(uint32_t taxon) const;

    /**
     * @brief resolveTree
     * Return the taxon of the highest weighted Root-to-Taxon path and passes WEVOTE threshold.
     * @param hit_counts
     * @param numToolsReported
     * @param minNumAgreed
     * @param threshold
     * @return
     */
    uint32_t resolveTree(
            const std::map<uint32_t, uint32_t> &hit_counts,
            uint32_t numToolsReported,
            uint32_t minNumAgreed ) const;

    /**
     * @brief correctTaxaVector
     * For an array of taxa: Convert non-standard taxon to a standard taxon.
     * @param inputTaxa
     */
    std::vector<uint32_t> correctTaxaVector(const std::vector<uint32_t> &inputTaxa) const;

    /**
     * @brief correctTaxa
     * Convert non-standard taxon to a standard taxon (per vector).
     * @param seq
     */
    std::vector<ReadInfo> correctTaxa(const std::vector<ReadInfo> &seq ) const;

    /**
     * @brief buildFullTaxIdMap
     * Build parent map: take taxon, get parent taxon.
     * @param filename
     * @return
     */
    static std::map<uint32_t, uint32_t> buildFullTaxIdMap(
            const std::string &filename );

    /**
     * @brief buildFullRankMap
     * Build rank map: take taxID, get rank.
     * @param filename
     * @return
     */
    static std::map<uint32_t, std::string>
    buildFullRankMap( const std::string &filename );

    /**
     * @brief buildStandardTaxidMap
     * Build standard parent map: take taxon, get standard parent taxon.
     * @param filename
     * @param parentMap
     * @param rankMap
     * @return
     */
    static std::map<uint32_t, uint32_t> buildStandardTaxidMap(
            const std::string &filename,
            const std::map<uint32_t, uint32_t> &parentMap,
            const std::map<uint32_t, std::string> &rankMap );

    /**
     * @brief buildTaxnameMap
     * Build name map: take taxon, get name.
     * @param filename
     * @return
     */
    static std::map<uint32_t, std::string> buildTaxnameMap(
            const std::string &filename );

    /**
     * @brief buildNameMapTaxid
     * Build reverse name map: take name, get taxon.
     * @param filename
     * @return
     */
    static std::map< std::string, uint32_t> buildNameMapTaxid(
            const std::string &filename );

    /**
     * @brief isRank
     * @param rank
     * @return
     */
    static bool isRank( const std::string &rank );
private:
    uint32_t _undefined;
    std::map< uint32_t , uint32_t > _parentMap;
    std::map< uint32_t , std::string > _rankMap;
    std::map<uint32_t, uint32_t> _standardMap;
    std::map<uint32_t, std::string> _namesMap;
//    std::map<std::string, uint32_t> _namesTaxMap;
};
}
#endif // TAXONOMYBUILDER_H
