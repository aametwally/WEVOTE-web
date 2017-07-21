#ifndef READINFO_H
#define READINFO_H

#include "headers.hpp"

#define NO_ANNOTATIOIN 0


namespace wevote
{
struct ReadInfo{
    ReadInfo()
        : seqID({""}),resolvedTaxon{0},
          numToolsAgreed{0},numToolsReported{0},
          numToolsUsed{0} , score{0}
    {}
    std::string seqID;
    std::vector<uint32_t> annotation;
    uint32_t resolvedTaxon;
    uint32_t numToolsAgreed;
    uint32_t numToolsReported;
    uint32_t numToolsUsed;
    double score;
    WEVOTE_DLL static bool isAnnotation( uint32_t taxid );
    WEVOTE_DLL static constexpr uint32_t noAnnotation = NO_ANNOTATIOIN;
};

}
#endif // READINFO_H
