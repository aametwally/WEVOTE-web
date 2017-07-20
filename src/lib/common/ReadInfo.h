#ifndef READINFO_H
#define READINFO_H

#include "headers.hpp"

#define NO_ANNOTATIOIN 0


namespace wevote
{
struct ReadInfo{
    std::string seqID;
    std::vector<uint32_t> annotation;
    uint32_t resolvedTaxon;
    uint32_t numToolsAgreed;
    uint32_t numToolsReported;
    uint32_t numToolsUsed;
    double score;
    WEVOTE_DLL static bool isAnnotation( uint32_t taxid );
    WEVOTE_DLL static const uint32_t noAnnotation;
};

}
#endif // READINFO_H