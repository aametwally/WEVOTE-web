#include "headers.hpp"
#include "Logger.h"

extern std::map<uint32_t, uint32_t> parentMap;
extern std::map<uint32_t, std::string> rankMap;
extern std::map<uint32_t, uint32_t> standardMap;
extern std::map<uint32_t, std::string> namesMap;

namespace wevote
{
std::map<uint32_t, uint32_t> build_full_taxid_map(
        const std::string &filename);

std::map<uint32_t, std::string> build_full_rank_map(
        const std::string &filename);

std::map<uint32_t, uint32_t> build_standard_taxid_map(
        const std::string &filename,
        const std::map<uint32_t, uint32_t> &parentMap,
        const std::map<uint32_t, std::string> &rankMap);

std::map<uint32_t, std::string> build_taxname_map(
        const std::string &filename);
}
