#include "create_db.hpp"

namespace wevote
{
/// Build parent map: take taxon, get parent taxon
std::map<uint32_t, uint32_t> build_full_taxid_map(
        const std::string &filename)
{
    std::map<uint32_t, uint32_t> pmap;
    uint32_t node_id, parent_id;
    std::string line;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & ifstream::failbit)
    {
        LOG_ERROR("Error opening %s", filename.c_str());
    }

    while (ifs.good())
    {
        std::getline(ifs, line);

        if (line.empty())
            break;

        std::sscanf(line.c_str(), "%d\t|\t%d", &node_id, &parent_id);
        pmap[node_id] = parent_id;
    }
    pmap[1] = 0;
    return pmap;
}


/// Build rank map: take taxID, get rank
std::map<uint32_t, std::string> build_full_rank_map(const std::string &filename)
{
    std::map<uint32_t, std::string> pmap;
    uint32_t node_id, parent_id;
    char rank[100];
    std::string line;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & ifstream::failbit)
    {
        LOG_ERROR("Error opening %s", filename.c_str());
    }
    while (ifs.good())
    {
        std::getline(ifs, line);

        if (line.empty())
            break;

        std::sscanf(line.c_str(), "%d\t|\t%d\t|\t%s", &node_id, &parent_id, rank);
        pmap[node_id] = rank;
    }
    pmap[1] = "root";
    return pmap;
}



/// Build standard parent map: take taxon, get standard parent taxon
std::map<uint32_t, uint32_t> build_standard_taxid_map(
        const std::string &filename,
        const std::map<uint32_t, uint32_t> &parentMap,
        const std::map<uint32_t, std::string> &rankMap )
{
    std::map<uint32_t, uint32_t> pmap;
    uint32_t node_id, parent_id;
    char rank[100];
    std::string rankString;
    std::string line, tempRank;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & ifstream::failbit)
    {
        LOG_ERROR("Error opening %s", filename.c_str());
    }

    while (ifs.good())
    {
        std::getline(ifs, line);
        if (line.empty())
            break;
        std::sscanf(line.c_str(), "%d\t|\t%d\t|\t%s", &node_id, &parent_id, rank);
        rankString=rank;

        if(rankString=="superkingdom" || rankString=="kingdom" || rankString=="phylum" || rankString=="class" || rankString=="order" || rankString=="family" || rankString=="genus" || rankString=="species")
        {
            while(1)
            {
                tempRank=rankMap[parent_id];
                if(tempRank=="root" || tempRank=="superkingdom" || tempRank=="kingdom" || tempRank=="phylum" || tempRank=="class" || tempRank=="order" || tempRank=="family" || tempRank=="genus" || tempRank=="species")
                {
                    pmap[node_id] = parent_id;
                    break;
                }
                parent_id=parentMap[parent_id];
            }
        }
    }
    pmap[1] = 0;
    return pmap;
}




/// Build name map: take taxon, get name
std::map<uint32_t, std::string> build_taxname_map(
        const std::string &filename )
{
    std::map<uint32_t, std::string> pmap;
    uint32_t node_id;
    char name[1000];
    std::string line;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & ifstream::failbit)
    {
        LOG_ERROR("Error opening %s", filename.c_str());
    }
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


/// Build reverse name map: take name, get taxon
std::map< std::string, uint32_t> build_name_map_taxid(
        const std::string &filename )
{
    std::map<std::string, uint32_t> pmap;
    uint32_t node_id;
    char name[1000];
    std::string line;
    std::ifstream ifs(filename.c_str());
    if (ifs.rdstate() & ifstream::failbit)
    {
        LOG_ERROR("Error opening %s", filename.c_str());
    }
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
}
