#include "Rank.h"

namespace wevote
{

const std::array< defs::string_t , RANKS_SIZE > Rank::rankLabels
= {
    RANK_ROOT , RANK_SUPERKINGDOM , RANK_KINGDOM , RANK_PHYLUM ,
    RANK_CLASS , RANK_ORDER , RANK_FAMILY , RANK_GENUS , RANK_SPECIES
};

const std::unordered_map< defs::string_t , RankID > Rank::rankID
 {
    {RANK_ROOT         ,RankID::Root        } ,
    {RANK_SUPERKINGDOM ,RankID::Superkingdom} ,
    {RANK_KINGDOM      ,RankID::Kingdom     } ,
    {RANK_PHYLUM       ,RankID::Phylum      } ,
    {RANK_CLASS        ,RankID::Class       } ,
    {RANK_ORDER        ,RankID::Order       } ,
    {RANK_FAMILY       ,RankID::Family      } ,
    {RANK_GENUS        ,RankID::Genus       } ,
    {RANK_SPECIES      ,RankID::Species     }
};
}
