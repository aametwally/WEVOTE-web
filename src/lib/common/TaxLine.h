#ifndef TAXLINE_H
#define TAXLINE_H

#include "headers.hpp"

namespace wevote
{
struct TaxLine {
    uint32_t taxon;
    uint32_t count;
    std::string root;
    std::string superkingdom;
    std::string kingdom;
    std::string phylum;
    std::string clas;
    std::string order;
    std::string family;
    std::string genus;
    std::string species;
    double RA;
};
}


#endif // TAXLINE_H
