#ifndef RANK_H
#define RANK_H

#include "headers.hpp"

#define RANK_ROOT "root"
#define RANK_SUPERKINGDOM "superkingdom"
#define RANK_KINGDOM "kingdom"
#define RANK_PHYLUM "phylum"
#define RANK_CLASS "class"
#define RANK_ORDER "order"
#define RANK_FAMILY "family"
#define RANK_GENUS "genus"
#define RANK_SPECIES "species"
#define RANKS_SIZE 9

namespace wevote
{

enum class RankID : size_t{
    Root = 0 ,
    Superkingdom,
    Kingdom,
    Phylum ,
    Class ,
    Order ,
    Family ,
    Genus ,
    Species
};

struct Rank
{
    static const std::array< std::string , RANKS_SIZE > rankLabels;
    static const std::unordered_map< std::string , RankID > rankID;
};


}

#endif // RANK_H
