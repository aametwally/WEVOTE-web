#include "TaxonomyBuilder.h"

namespace wevote
{
TaxonomyBuilder::TaxonomyBuilder( const std::string &nodesFilename  ,
                                  const std::string &namesFilename )
    : _undefined( 0 ),
      _parentMap( buildFullTaxIdMap( filename )),
      _rankMap( buildFullRankMap( nodesFilename )),
      _namesMap( buildTaxnameMap( namesFilename ))
{
    _standardMap = buildStandardTaxidMap( nodesFilename, _parentMap, _rankMap);
}

uint32_t TaxonomyBuilder::correctTaxan( uint32_t taxid ) const
{
    std::string rank = _rankMap[taxid];

    if ( taxid == 0 )
        return ReadInfo::noAnnotation;

    else if ( rank == "")
    {
        _undefined++;
        LOG_DEBUG("The taxon = %d is undefined in the database",taxid);
        return ReadInfo::noAnnotation;
    }
    while (!isRank( rank ) )
    {
        taxid = _parentMap[taxid];
        if( taxid < 1 )
            return ReadInfo::noAnnotation;
        else
            rank= _rankMap[taxid];
    }

    return taxid;
}

uint32_t TaxonomyBuilder::lca( uint32_t a, uint32_t b ) const
{
    if (a == 0 || b == 0)
        return a ? a : b;

    std::set<uint32_t> aPath;
    while (a > 0)
    {
        aPath.insert(a);
        a = _standardMap[a];
    }
    while (b > 0)
    {
        if (aPath.count(b) > 0)
            return b;
        b = _standardMap[b];
    }
    return 1;
}

std::set<uint32_t> TaxonomyBuilder::getAncestry(uint32_t taxon) const
{
    std::set<uint32_t> path;
    path.clear();
    while (taxon > 0)
    {
        path.insert(taxon);
        taxon = _standardMap[taxon];
    }
    return path;
}

uint32_t TaxonomyBuilder::resolveTree(
        const std::map<uint32_t, uint32_t> &hitCounts,
        uint32_t numToolsReported, uint32_t minNumAgreed ) const
{
    std::set<uint32_t> maxTaxa;
    uint32_t maxTaxon = 0, maxScore = 0;
    auto it = hitCounts.cbegin();
    uint32_t threshold=floor(0.5*(double)numToolsReported);

    if(minNumAgreed > threshold)
        threshold=(minNumAgreed-1);

    while (it != hitCounts.end())
    {
        if(it->second <= threshold)
        {
            it++;
            continue;
        }

        uint32_t taxon = it->first;
        uint32_t node = taxon;
        uint32_t score = 0;
        while (node > 0)
        {
            score += hitCounts[node];
            node = standardMap[node];
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

        it++;
    }

    if (! maxTaxa.empty())
    {
        std::set<uint32_t>::iterator sit = maxTaxa.begin();
        maxTaxon = *sit;

        for (sit++; sit != maxTaxa.end(); sit++)
            maxTaxon = lca(maxTaxon, *sit);
    }
    return maxTaxon;
}


std::vector< uint32_t >
TaxonomyBuilder::correctTaxaVector( const std::vector<uint32_t> &inputTaxa ) const
{
    decltype(inputTaxa) correctedTaxa;
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

        std::sscanf(line.c_str(), "%d\t|\t%d", &nodeId, &parentId);
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
TaxonomyBuilder::buildStandardTaxidMap(const std::string &filename, const std::map<uint32_t, uint32_t> &parentMap, const std::map<uint32_t, std::string> &rankMap)
{
    std::map<uint32_t, uint32_t> pmap;
    uint32_t nodeId, parentId;
    char rank[100];
    std::string rankString;
    std::string line, tempRank;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & std::ifstream::failbit)
        LOG_ERROR("Error opening %s", filename.c_str());


    while (ifs.good())
    {
        std::getline(ifs, line);
        if (line.empty())
            break;
        std::sscanf(line.c_str(), "%d\t|\t%d\t|\t%s", &nodeId, &parentId, rank);
        rankString=rank;

        if(isRank( tempRank ))
            while(1)
            {
                tempRank=rankMap[parentId];
                if(isRank( tempRank ))
                {
                    pmap[nodeId] = parentId;
                    break;
                }
                parentId=parentMap[parentId];
            }
    }
    pmap[1] = 0;
    return pmap;
}

std::map<uint32_t, std::string>
TaxonomyBuilder::buildTaxnameMap(const std::string &filename)
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

bool TaxonomyBuilder::isRank(const std::string &rank)
{
    return rank=="root" || rank == "superkingdom" ||
            rank == "kingdom" || rank== "phylum" ||
            rank == "class" || rank == "order" ||
            rank == "family" || rank == "genus" ||
            rank == "species";
}
}
