#ifndef RANK_H
#define RANK_H

#include "headers.hpp"

#define RANK_ROOT           U("root")
#define RANK_SUPERKINGDOM   U("superkingdom")
#define RANK_KINGDOM        U("kingdom")
#define RANK_PHYLUM         U("phylum")
#define RANK_CLASS          U("class")
#define RANK_ORDER          U("order")
#define RANK_FAMILY         U("family")
#define RANK_GENUS          U("genus")
#define RANK_SPECIES        U("species")
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
    static const std::array< defs::string_t , RANKS_SIZE > rankLabels;
    static const std::unordered_map< defs::string_t , RankID > rankID;
};


}

#endif // RANK_H
