#include "headers.hpp"



uint32_t correctTaxan(uint32_t tempTax, map<uint32_t, uint32_t> &parentMap, map<uint32_t, string> &rankMap, uint32_t &undefined);
void correctTaxa(vector<readsInfo> &seq,
                 map<uint32_t, uint32_t> &parentMap ,
                 map<uint32_t, string> &rankMap ,
                 uint32_t &undefined);
uint32_t lca(uint32_t a, uint32_t b, map<uint32_t, uint32_t> &standardMap);
set<uint32_t> get_ancestry(uint32_t taxon, map<uint32_t, uint32_t> standardMap);
uint32_t resolve_tree(map<uint32_t, uint32_t> &hit_counts, uint32_t numToolsReported, uint32_t minNumAgreed, map<uint32_t, uint32_t> &standardMap);
map<string, uint32_t> build_name_map_taxid(string filename);
uint32_t getTaxonID(string name);


void correctTaxa_vecTaxa(vector<uint32_t> &InputTaxa, map<uint32_t, uint32_t> &parentMap, map<uint32_t, string> &rankMap, uint32_t &undefined);
