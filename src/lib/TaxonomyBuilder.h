#ifndef TAXONOMYBUILDER_H
#define TAXONOMYBUILDER_H

#include "headers.hpp"
#include "helpers.hpp"
#include "Taxon.h"
#include "ReadInfo.h"
#include "Logger.h"
#include "Rank.h"

namespace wevote
{

struct TaxonomyPrivate;

class TaxonomyBuilder
{
public:
    /**
     * @brief TaxonomyBuilder
     * @param nodesFilename
     * @param namesFilename
     */
    WEVOTE_DLL TaxonomyBuilder( const defs::string_t &nodesFilename ,
                     const defs::string_t &namesFilename );


    WEVOTE_DLL ~TaxonomyBuilder();

public:
    /**
     * @brief getRank
     * @param taxid
     * @return
     */
    WEVOTE_DLL defs::string_t getRank( uint32_t taxid ) const;

    /**
     * @brief getTaxName
     * @param taxid
     * @return
     */
    WEVOTE_DLL defs::string_t getTaxName( uint32_t taxid ) const;

    /**
     * @brief getStandardParent
     * @param taxid
     * @return
     */
    WEVOTE_DLL uint32_t getStandardParent( uint32_t taxid ) const;

    /**
     * @brief correctTaxan
     * Convert non-standard taxon to a standard taxon (per taxon)
     * @param tempTax
     * @return
     */
    WEVOTE_DLL uint32_t correctTaxan( uint32_t tempTax ) const;

    /**
     * @brief lca
     * Get LCA of two nodes.
     * @param a
     * @param b
     * @return
     */
    WEVOTE_DLL uint32_t lca(uint32_t a, uint32_t b) const;

    /**
     * @brief getAncestry
     * Get all ancestry of a taxon.
     * @param taxon
     * @return
     */
    WEVOTE_DLL std::set<uint32_t> getAncestry(uint32_t taxon) const;

    /**
     * @brief resolveTree
     * Return the taxon of the highest weighted Root-to-Taxon path and passes WEVOTE threshold.
     * @param hit_counts
     * @param numToolsReported
     * @param minNumAgreed
     * @param threshold
     * @return
     */
    WEVOTE_DLL uint32_t resolveTree(const std::map<uint32_t, uint32_t> &hit_counts,
            uint32_t numToolsReported,
            uint32_t minNumAgreed ) const;

    /**
     * @brief correctTaxaVector
     * For an array of taxa: Convert non-standard taxon to a standard taxon.
     * @param inputTaxa
     */
    WEVOTE_DLL std::vector<uint32_t>
    correctTaxaVector( const std::vector<uint32_t> &inputTaxa ) const;

    /**
     * @brief correctTaxa
     * Convert non-standard taxon to a standard taxon (per vector).
     * @param seq
     */
    WEVOTE_DLL void
    correctTaxa(std::vector<ReadInfo> &seq ) const;

    /**
     * @brief getParentMapCopy
     * @return
     */
    WEVOTE_DLL std::map< uint32_t , uint32_t >
    getParentMapCopy() const;

    /**
     * @brief getRankMapCopy
     * @return
     */
    WEVOTE_DLL std::map< uint32_t , defs::string_t >
    getRankMapCopy() const;

    /**
     * @brief getNamesMapCopy
     * @return
     */
    WEVOTE_DLL std::map< uint32_t , defs::string_t >
    getNamesMapCopy() const;


    /**
     * @brief getStandardMapCopy
     * @return
     */
    WEVOTE_DLL std::map< uint32_t , uint32_t >
    getStandardMapCopy() const;

    /**
     * @brief buildFullTaxIdMap
     * Build parent map: take taxon, get parent taxon.
     * @param filename
     * @return
     */
    static std::map<uint32_t, uint32_t> buildFullTaxIdMap(const defs::string_t &filename );

    /**
     * @brief buildFullRankMap
     * Build rank map: take taxID, get rank.
     * @param filename
     * @return
     */
    static std::map<uint32_t, defs::string_t>
    buildFullRankMap( const defs::string_t &filename );

    /**
     * @brief buildStandardTaxidMap
     * Build standard parent map: take taxon, get standard parent taxon.
     * @param filename
     * @param parentMap
     * @param rankMap
     * @return
     */
    static std::map<uint32_t, uint32_t> buildStandardTaxidMap(
            const defs::string_t &filename,
            const std::map<uint32_t, uint32_t> &parentMap,
            const std::map<uint32_t, defs::string_t> &rankMap );

    /**
     * @brief buildTaxnameMap
     * Build name map: take taxon, get name.
     * @param filename
     * @return
     */
    static std::map<uint32_t, defs::string_t> buildTaxnameMap(
            const defs::string_t &filename );

    /**
     * @brief buildNameMapTaxid
     * Build reverse name map: take name, get taxon.
     * @param filename
     * @return
     */
    static std::map< defs::string_t, uint32_t> buildNameMapTaxid(
            const defs::string_t &filename );

    /**
     * @brief isRank
     * @param rank
     * @return
     */
    static bool isRank( const defs::string_t &rank );
private:
    mutable uint32_t _undefined;
    std::unique_ptr< TaxonomyPrivate > _data;

};
}
#endif // TAXONOMYBUILDER_H
