#ifndef TAXON_H
#define TAXON_H

#include "headers.hpp"

namespace wevote
{
struct Taxon{
    uint32_t taxonID;
    std::string rank;
    std::string name;
    uint32_t occurrence;
    double abundance;
};
} // namespace wevote

#endif // TAXON_H
