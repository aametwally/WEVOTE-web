#include "TaxonomyBuilder.h"

namespace wevote
{

struct PrivateData
{
    PrivateData( const std::string &nodesFilename  ,
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
      _data( new PrivateData( nodesFilename  , namesFilename ))
{

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
        return {""};
    }
}

std::string TaxonomyBuilder::getTaxName(uint32_t taxid) const
{
    try{
        return _data->namesMap.at( taxid );
    } catch( const std::out_of_range & )
    {
        return {""};
    }
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
        std::string rank = _data->rankMap.at(taxid);
        while (!isRank( rank ) )
        {
            taxid = _data->parentMap.at( taxid );
            if( taxid < 1 )
                return ReadInfo::noAnnotation;
            else
                rank= _data->rankMap.at( taxid );
        }
    }catch( const std::out_of_range & )
    {
        _undefined++;
        LOG_DEBUG("The taxon = %d is undefined in the database",taxid);
        return ReadInfo::noAnnotation;
    }
    return taxid;
}

uint32_t TaxonomyBuilder::lca( uint32_t a, uint32_t b ) const
{
    if (a == 0 || b == 0)
        return a ? a : b;

    std::set<uint32_t> aPath;
    try
    {
        while (a > 0)
        {
            aPath.insert(a);
            a = _data->standardMap.at( a );
        }
        while (b > 0)
        {
            if (aPath.count(b) > 0)
                return b;
            b = _data->standardMap.at( b );
        }
    }catch( const std::out_of_range & )
    {
        LOG_DEBUG("A taxon is undefined in the database");
    }
    return 1;
}

std::set<uint32_t> TaxonomyBuilder::getAncestry( uint32_t taxon ) const
{
    std::set<uint32_t> path;
    try
    {
        while (taxon > 0)
        {
            path.insert(taxon);
            taxon = _data->standardMap.at( taxon );
        }
    }catch( const std::out_of_range & )
    {
        LOG_DEBUG("The taxon = %d is undefined in the database", taxon );
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
        while ( node > 0 )
        {
            try
            {
                score += hitCounts.at( node );
                node = _data->standardMap.at( node );
            }catch( const std::out_of_range &e )
            {
                LOG_DEBUG("Undefined taxid(%d): %s", node , e.what());
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
                    std::inserter( correctedTaxa , std::begin( correctedTaxa )) ,
                    [this]( uint32_t taxid ){
        return correctTaxan( taxid );
    } );
    return correctedTaxa;
}

std::vector<ReadInfo>
TaxonomyBuilder::correctTaxa( const std::vector<ReadInfo> &seq) const
{
    std::vector<ReadInfo> reads = seq;
    for ( ReadInfo &read : reads )
        read.annotation = correctTaxaVector( read.annotation );
    return reads;
}

std::map<uint32_t, uint32_t>
TaxonomyBuilder::buildFullTaxIdMap(const std::string &filename)
{
    std::map<uint32_t, uint32_t> pmap;
    uint32_t nodeId, parentId;
    std::string line;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & std::ifstream::failbit)
        LOG_ERROR("Error opening %s", filename.c_str());

    while (ifs.good())
    {
        std::getline(ifs, line);

        if (line.empty())
            break;

        sscanf(line.c_str(), "%d\t|\t%d", &nodeId, &parentId);
        pmap[nodeId] = parentId;
    }
    pmap[1] = 0;
    return pmap;
}

std::map<uint32_t, std::string>
TaxonomyBuilder::buildFullRankMap(const std::string &filename)
{
    std::map<uint32_t, std::string> pmap;
    uint32_t nodeId, parentId;
    char rank[100];
    std::string line;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & std::ifstream::failbit)
    {
        LOG_ERROR("Error opening %s", filename.c_str());
    }
    while (ifs.good())
    {
        std::getline(ifs, line);

        if (line.empty())
            break;

        std::sscanf(line.c_str(), "%d\t|\t%d\t|\t%s", &nodeId, &parentId, rank);
        pmap[nodeId] = rank;
    }
    pmap[1] = "root";
    return pmap;
}

std::map<uint32_t, uint32_t>
TaxonomyBuilder::buildStandardTaxidMap(
        const std::string &filename,
        const std::map<uint32_t, uint32_t> &parentMap,
        const std::map<uint32_t, std::string> &rankMap )
{
    std::map<uint32_t, uint32_t> pmap;

    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & std::ifstream::failbit)
        LOG_ERROR("Error opening %s", filename.c_str());

    while (ifs.good())
    {
        std::string line;
        uint32_t nodeId, parentId;
        char rank[100];

        std::getline(ifs, line);
        if (line.empty())
            break;

        std::sscanf(line.c_str(), "%d\t|\t%d\t|\t%s", &nodeId, &parentId, rank);
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
    uint32_t node_id;
    char name[1000];
    std::string line;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & std::ifstream::failbit)
        LOG_ERROR("Error opening %s", filename.c_str());

    while (ifs.good())
    {
        std::getline(ifs, line);
        if (line.empty())
            break;
        sscanf(line.c_str(), "%d\t|\t%s", &node_id, name);
        pmap[node_id] = name;
    }
    return pmap;
}

std::map<std::string, uint32_t>
TaxonomyBuilder::buildNameMapTaxid( const std::string &filename )
{
    std::map<std::string, uint32_t> pmap;
    uint32_t node_id;
    char name[1000];
    std::string line;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & std::ifstream::failbit)
        LOG_ERROR("Error opening %s", filename.c_str());

    while (ifs.good())
    {
        std::getline(ifs, line);
        if (line.empty())
            break;
        sscanf(line.c_str(), "%d\t|\t%s", &node_id, name);
        pmap[name] = node_id;
    }
    return pmap;
}

bool TaxonomyBuilder::isRank( const std::string &rank )
{
    return rank=="root" || rank == "superkingdom" ||
            rank == "kingdom" || rank== "phylum" ||
            rank == "class" || rank == "order" ||
            rank == "family" || rank == "genus" ||
            rank == "species";
}
}
