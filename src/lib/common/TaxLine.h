#ifndef TAXLINE_H
#define TAXLINE_H

#include "headers.hpp"
#include "Rank.h"

namespace wevote
{

struct TaxLine {
    uint32_t taxon;
    uint32_t count;
    std::array< std::string , RANKS_SIZE > line;
    double RA;
};
}


#endif // TAXLINE_H
