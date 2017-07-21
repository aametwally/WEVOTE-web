#define CATCH_CONFIG_MAIN  // This tells Catch to provide a main()

#include "tests.h"
#include "catch.hpp"
#include "helpers.hpp"
#include "create_db.hpp"
#include "TaxonomyBuilder.h"

TEST_CASE("Basic Utilities")
{
    SECTION("JOIN: joining string items with separator.")
    {
        REQUIRE( wevote::io::join({"item1","item2","item3"},",") ==
                 "item1,item2,item3");
        REQUIRE( wevote::io::join({"apple","banana"},"-") ==
                 "apple-banana");
        REQUIRE( wevote::io::join({"hello"} , "&") == "hello");

        REQUIRE( wevote::io::join({},",") == "");
    }

    SECTION("Set Based Equality: check the contents "
            "equality of two containers regardless the order of elements.")
    {
        using namespace test_utils;
        using V = std::vector< int >;
        REQUIRE( setBasedEquality( V{1,3,2} , V{3,1,2} ));
        REQUIRE( setBasedEquality( V{3,3,3,1} , V{1,3,1} , false ));
        REQUIRE(!setBasedEquality( V{3,2} , V{3,4} ));
    }

    SECTION("Split String with string delimeter")
    {
        using S = std::string;
        using V = std::vector< S >;
        REQUIRE( wevote::io::split( "AACCCA#-#GTTTGA" , "#-#") ==
                 V({"AACCCA","GTTTGA"}) );

        REQUIRE( wevote::io::split( "AACCCA -> GTTTGA" , " -> ") ==
                 V({"AACCCA","GTTTGA"}) );
    }
}

const std::string namesFilePath = TAXONOMY_NAMES_FILE;
const std::string nodesFilePath = TAXONOMY_NODES_FILE;
const wevote::TaxonomyBuilder taxonomy( nodesFilePath , namesFilePath );
const std::map< uint32_t , uint32_t > parentMapLagacy =
        build_full_taxid_map( nodesFilePath );
const std::map< uint32_t , std::string > rankMapLagacy =
        build_full_rank_map( nodesFilePath );

const std::map< uint32_t , uint32_t > standardMapLagacy =
        build_standard_taxid_map( nodesFilePath , parentMapLagacy , rankMapLagacy );


TEST_CASE("Taxonomy Construction")
{
    SECTION("Parent Map Construction.")
    {
        const std::map< uint32_t , uint32_t > parentMap =
                taxonomy.getParentMapCopy();
        REQUIRE( parentMapLagacy == parentMap );
    }
    SECTION("Rank Map Construction.")
    {
        const std::map< uint32_t , std::string > rankMap =
                taxonomy.getRankMapCopy();
        REQUIRE( rankMapLagacy == rankMap );
    }
    SECTION("Names Map Construction.")
    {
        const std::map< uint32_t , std::string > namesMapLagecy =
                build_taxname_map( namesFilePath );
        const std::map< uint32_t , std::string > namesMap =
                taxonomy.getNamesMapCopy();
        CAPTURE( namesMapLagecy.size());
        CAPTURE( namesMap.size());



        REQUIRE( namesMapLagecy == namesMap );
        REQUIRE(std::equal( namesMapLagecy.cbegin() , namesMapLagecy.cend() ,
                            namesMap.cbegin() , namesMap.cend() ,
                            []( const std::pair< uint32_t , std::string > &p1 ,
                            const std::pair< uint32_t , std::string > &p2 ){
                    return p1.first == p2.first && p1.second == p2.second;
                }));

    }
    SECTION("Standard Map Construction.")
    {
        const std::map< uint32_t , uint32_t > standardMap
                = taxonomy.getStandardMapCopy();
        REQUIRE( standardMapLagacy == standardMap );
    }
}

