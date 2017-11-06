#include "TaxonomyBuilder.h"

namespace wevote
{

struct TaxonomyPrivate
{
    TaxonomyPrivate( const std::string &nodesFilename  ,
                     const std::string &namesFilename )
        : parentMap( TaxonomyBuilder::buildFullTaxIdMap( nodesFilename )),
          rankMap( TaxonomyBuilder::buildFullRankMap( nodesFilename )),
          namesMap( TaxonomyBuilder::buildTaxnameMap( namesFilename )),
          standardMap( TaxonomyBuilder::buildStandardTaxidMap( nodesFilename, parentMap, rankMap)){}

    const std::map< uint32_t , uint32_t > parentMap;
    const std::map< uint32_t , std::string > rankMap;
    const std::map< uint32_t , std::string > namesMap;
    const std::map< uint32_t , uint32_t > standardMap;
    //    std::map<std::string, uint32_t> _namesTaxMap;

};

TaxonomyBuilder::TaxonomyBuilder( const std::string &nodesFilename  ,
                                  const std::string &namesFilename )
    : _undefined( 0 ),
      _data( new TaxonomyPrivate( nodesFilename  , namesFilename ))
{
    LOG_INFO("Taxonomy Builder Constructed.");
}

TaxonomyBuilder::~TaxonomyBuilder()
{

}

std::string TaxonomyBuilder::getRank(uint32_t taxid) const
{
    try{
        return _data->rankMap.at( taxid );
    } catch( const std::out_of_range & )
    {
        return "";
    }
}

std::string TaxonomyBuilder::getTaxName(uint32_t taxid) const
{
    try{
        return _data->namesMap.at( taxid );
    } catch( const std::out_of_range & )
    {
        return "";
    }
}

std::string TaxonomyBuilder::getStandardTaxName(uint32_t taxid) const
{
    return getTaxName( correctTaxan( taxid ));
}

uint32_t TaxonomyBuilder::getStandardParent(uint32_t taxid) const
{
    try{
        return _data->standardMap.at( taxid );
    } catch( const std::out_of_range & )
    {
        return ReadInfo::noAnnotation;
    }
}

uint32_t TaxonomyBuilder::correctTaxan( uint32_t taxid ) const
{
    if ( taxid == ReadInfo::noAnnotation )
        return ReadInfo::noAnnotation;
    try
    {
        std::string rank;
        auto rankIt = _data->rankMap.find( taxid );
        if( rankIt == _data->rankMap.end())
            rank = "";
        else rank = rankIt->second;

        while (!isRank( rank ) )
        {
            taxid = _data->parentMap.at( taxid );
            if( taxid == ReadInfo::noAnnotation )
                return ReadInfo::noAnnotation;
            else
            {
                rankIt = _data->rankMap.find( taxid );
                if( rankIt == _data->rankMap.end())
                    rank = "";
                else rank = rankIt->second;
            }
        }
    }catch( const std::out_of_range & )
    {
        _undefined++;
        LOG_DEBUG("The taxon = %d is undefined in the database",taxid);
        return ReadInfo::noAnnotation;
    }
    return taxid;
}

int TaxonomyBuilder::distance( uint32_t a , uint32_t b ) const
{
    if (a == ReadInfo::noAnnotation || b == ReadInfo::noAnnotation )
        return maxDegree;

    const std::vector< uint32_t > aPath = getButtomUpAncestry( a );
    try
    {
        uint32_t bBranch = 0 ;
        while (b != ReadInfo::noAnnotation)
        {
            auto findIt = std::find( aPath.cbegin() , aPath.cend() , b );
            if ( findIt != aPath.cend( ))
                return std::distance( aPath.cbegin() , findIt ) + bBranch;
            b = _data->standardMap.at( b );
            ++bBranch;
        }
    }catch( const std::out_of_range & )
    {
        return maxDegree;
        LOG_DEBUG("A taxon is undefined in the database");
    }
    return maxDegree;
}

std::vector<uint32_t> TaxonomyBuilder::getButtomUpAncestry(uint32_t taxon) const
{
    std::vector<uint32_t> path;
    try
    {
        while ( taxon != ReadInfo::noAnnotation )
        {
            path.push_back( taxon );
            taxon = _data->standardMap.at( taxon );
        }
    }catch( const std::out_of_range & )
    {
        //        LOG_DEBUG("The taxon = %d is undefined in the database", taxon );
    }
    return path;
}

uint32_t TaxonomyBuilder::lca( uint32_t a, uint32_t b ) const
{
    if (a == 0 || b == 0)
        return a ? a : b;

    const std::set< uint32_t > aPath = getAncestry( a );
    try
    {
        while (b > 0)
        {
            auto findIt = aPath.find( b );
            if ( findIt != aPath.cend())
                return b;
            b = _data->standardMap.at( b );
        }
    }catch( const std::out_of_range & )
    {
        //        LOG_DEBUG("A taxon is undefined in the database");
    }
    return 1;
}

std::set< uint32_t > TaxonomyBuilder::getAncestry( uint32_t taxon ) const
{
    std::set<uint32_t> path;
    try
    {
        while ( taxon != ReadInfo::noAnnotation )
        {
            path.insert(taxon);
            taxon = _data->standardMap.at( taxon );
        }
    }catch( const std::out_of_range & )
    {
        //        LOG_DEBUG("The taxon = %d is undefined in the database", taxon );
    }
    return path;
}

uint32_t TaxonomyBuilder::resolveTree(
        const std::map<uint32_t, uint32_t> &hitCounts,
        uint32_t numToolsReported, uint32_t minNumAgreed ) const
{
    std::set<uint32_t> maxTaxa;
    uint32_t maxTaxon = 0, maxScore = 0;
    uint32_t threshold =
            static_cast< uint32_t >( floor(0.5*(double)numToolsReported));

    if( minNumAgreed > threshold )
        threshold = ( minNumAgreed-1 );

    for( const std::pair< uint32_t , uint32_t > &hit : hitCounts )
    {
        if( hit.second <= threshold )
            continue;

        uint32_t taxon = hit.first;
        uint32_t node = taxon;
        uint32_t score = 0;
        while ( node != ReadInfo::noAnnotation )
        {
            try
            {
                score += hitCounts.at( node );
                node = _data->standardMap.at( node );
            }catch( const std::out_of_range &e )
            {
                //                LOG_DEBUG("Undefined taxid(%d): %s", node , e.what());
                break;
            }
        }

        if (score > maxScore)
        {
            maxTaxa.clear();
            maxScore = score;
            maxTaxon = taxon;
        }
        else if (score == maxScore)
        {
            if (maxTaxa.empty())
                maxTaxa.insert(maxTaxon);

            maxTaxa.insert(taxon);
        }
    }

    if (! maxTaxa.empty())
    {
        maxTaxon = *maxTaxa.cbegin();
        for ( uint32_t taxid : maxTaxa )
            maxTaxon = lca( maxTaxon, taxid );
    }
    return maxTaxon;
}


std::vector< uint32_t >
TaxonomyBuilder::correctTaxaVector( const std::vector<uint32_t> &inputTaxa ) const
{
    std::vector<uint32_t> correctedTaxa;
    std::transform( inputTaxa.cbegin() , inputTaxa.cend() ,
                    std::inserter( correctedTaxa , std::end( correctedTaxa )) ,
                    [this]( uint32_t taxid ){
        return correctTaxan( taxid );
    } );
    return correctedTaxa;
}

void TaxonomyBuilder::correctTaxa( std::vector<ReadInfo> &reads ) const
{
    for ( ReadInfo &read : reads )
        read.annotation = correctTaxaVector( read.annotation );
}

std::map<uint32_t, uint32_t> TaxonomyBuilder::getParentMapCopy() const
{
    return _data->parentMap;
}

std::map<uint32_t, std::string> TaxonomyBuilder::getRankMapCopy() const
{
    return _data->rankMap;
}

std::map<uint32_t, std::string> TaxonomyBuilder::getNamesMapCopy() const
{
    return _data->namesMap;
}

std::map<uint32_t, uint32_t> TaxonomyBuilder::getStandardMapCopy() const
{
    return _data->standardMap;
}

std::map<uint32_t, uint32_t>
TaxonomyBuilder::buildFullTaxIdMap( const std::string &filename )
{
    std::map<uint32_t, uint32_t> pmap;
    const std::vector< std::string > lines =
            io::getFileLines( filename );
    for( const std::string &line : lines )
    {
        uint32_t nodeId, parentId;
        sscanf( line.c_str() , "%d\t|\t%d", &nodeId, &parentId);
        pmap[nodeId] = parentId;
    }
    pmap[1] = ReadInfo::noAnnotation;
    return pmap;
}

std::map<uint32_t, std::string> TaxonomyBuilder::buildFullRankMap(const std::string &filename)
{
    std::map<uint32_t, std::string> pmap;
    const std::vector< std::string > lines =
            io::getFileLines( filename );
    for( const std::string &line : lines )
    {
        uint32_t nodeId, parentId;
        char rank[100];
        sscanf( line.c_str() , "%d\t|\t%d\t|\t%s", &nodeId, &parentId, rank);
//        std::sscanf(line.c_str(), );
        pmap[nodeId] = rank;
    }

    pmap[1] = Rank::rankLabels.at( ReadInfo::noAnnotation );
    return pmap;
}

std::map<uint32_t, uint32_t>
TaxonomyBuilder::buildStandardTaxidMap(const std::string &filename,
                                       const std::map<uint32_t, uint32_t> &parentMap,
                                       const std::map<uint32_t, std::string> &rankMap )
{
    std::map<uint32_t, uint32_t> pmap;
    const std::vector< std::string > lines =
            io::getFileLines( filename );
    for( const std::string &line : lines )
    {
        uint32_t nodeId, parentId;
        char rank[100];
        sscanf( line.c_str() , "%d\t|\t%d\t|\t%s", &nodeId, &parentId, rank);
        std::string rankString = rank;
        if(isRank( rankString ))
            while(1)
            {
                std::string tempRank = rankMap.at( parentId );
                if(isRank( tempRank ))
                {
                    pmap[nodeId] = parentId;
                    break;
                }
                parentId = parentMap.at( parentId );
            }
    }

    pmap[1] = ReadInfo::noAnnotation;
    return pmap;
}

std::map<uint32_t, std::string>
TaxonomyBuilder::buildTaxnameMap( const std::string &filename )
{
    std::map<uint32_t, std::string> pmap;
    const std::vector< std::string > lines =
            io::getFileLines( filename );
    for( const std::string &line : lines )
    {
        if( line.empty())
            break;
        uint32_t node_id;
        char name[1000];
        sscanf( line.c_str() , "%d\t|\t%s", &node_id, name);
        std::string &nameRef = pmap[ node_id ];
        if( nameRef.empty())
            nameRef = name;
    }
    return pmap;
}

std::map<std::string, uint32_t>
TaxonomyBuilder::buildNameMapTaxid( const std::string &filename )
{
    std::map<std::string, uint32_t> pmap;
    const std::vector< std::string > lines =
            io::getFileLines( filename );
    for( const std::string &line : lines )
    {
        uint32_t node_id;
        char name[1000];
        sscanf( line.c_str() , "%d\t|\t%s", &node_id, name);
        pmap[name] = node_id;
    }
    return pmap;
}

bool TaxonomyBuilder::isRank( const std::string &rank )
{
    return std::any_of( Rank::rankLabels.cbegin() ,
                        Rank::rankLabels.cend() ,
                        [&rank]( const std::string &r) {
        return r == rank;
    });
}
}
