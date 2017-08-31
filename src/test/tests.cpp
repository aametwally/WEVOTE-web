#define CATCH_CONFIG_MAIN  // This tells Catch to provide a main()

#include "tests.h"
#include "catch.hpp"
#include "lagacy/src/create_db.hpp"
#include "lagacy/src/helpers.hpp"
#include "helpers.hpp"
#include "TaxonomyBuilder.h"
#include "WevoteClassifier.h"

namespace Catch
{

template< typename ReadType >
std::string _toString( const ReadType &read )
{
    std::stringstream stream;
    stream << "[seqID:" << read.seqID << "]"
           << "[annotation:" << wevote::io::join( wevote::io::asStringsVector( read.annotation ) , "," ) << "]"
           << "[resolvedTaxon:" << read.resolvedTaxon << "]"
           << "[numToolsAgreed:" << read.numToolsAgreed << "]"
           << "[numToolsReported:" << read.numToolsReported << "]"
           << "[numToolsUsed:" << read.numToolsUsed << "]"
           << "[score:" << read.score << "]";
    return stream.str();
}

std::string toString( const wevote::ReadInfo &read )
{
    return _toString( read );
}
std::string toString( const readsInfo &read )
{
    return _toString( read );
}

}
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

const std::string namesFilePath = TEST_TAXONOMY_NAMES_FILE;
const std::string nodesFilePath = TEST_TAXONOMY_NODES_FILE;
const wevote::TaxonomyBuilder taxonomy( nodesFilePath , namesFilePath );

std::map< uint32_t , uint32_t > parentMapLagacy =
        build_full_taxid_map( nodesFilePath );
std::map< uint32_t , std::string > rankMapLagacy =
        build_full_rank_map( nodesFilePath );

std::map< uint32_t , uint32_t > standardMapLagacy =
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



/// Read CSV formated input file
vector<readsInfo> Reads;
readsInfo OneRead;
uint32_t numToolsUsed;
uint32_t numReads;
uint32_t minNumAgreed=0;
int penalty=2;
static void lagacyPreprocessReads()
{
    Reads.clear();
    ifstream file ( TEST_ENSEMBLE_CSV_FILE );
    string line = "";
    int it=0;

    if (!file.is_open())
    {
        cout << "Error opening file:" << TEST_ENSEMBLE_CSV_FILE  <<"\n";
        exit(1);
    }

    while (getline(file, line))
    {
        stringstream strstr(line);
        string word = "";
        it=0;
        int value=0;
        (OneRead.annotation).clear();

        while (getline(strstr,word, ','))
        {
            if(it==0)
                OneRead.seqID=word;
            else
            {
                value=atoi(word.c_str());
                (OneRead.annotation).push_back(value);
            }
            it++;
        }
        Reads.push_back(OneRead);
    }

    numToolsUsed=(Reads[0].annotation).size();
    numReads= Reads.size();


    for (uint32_t i=0 ; i<Reads.size() ; i++)
    {
        Reads[i].numToolsUsed=numToolsUsed;
    }

    /// Correct TaxonID for the not standard ranks
    uint32_t undefined = 0;
    correctTaxa(Reads , parentMapLagacy , rankMapLagacy , undefined );

    /// Count number of tools that identified each sequences
    uint32_t count=0;
    for (uint32_t i=0 ; i<Reads.size() ; i++)
    {
        count=0;
        for (uint32_t j=0 ; j<(Reads[i].annotation).size() ; j++)
        {

            if (Reads[i].annotation[j] && 1)
                count++;
        }
        Reads[i].numToolsReported=count;
    }
}


void lagacyClassification()
{
    /// WEVOTE algorithm
    map<uint32_t, uint32_t> hit_counts;
    set<uint32_t> parents;
    std::set<uint32_t>::iterator set_iterator;
    std::map<uint32_t, uint32_t>::iterator iterator_name;
    uint32_t SavedTax_2[2];
    uint32_t n=0;

    double start = omp_get_wtime();
    omp_set_num_threads(5);
    cout << "Min Number of Agreed= "<< minNumAgreed << "\n";

#pragma omp parallel for private (hit_counts, parents, set_iterator, iterator_name, SavedTax_2, n)
    for (uint32_t i=0 ; i<Reads.size() ;i++)
    {
        if (Reads[i].numToolsReported == 0)
        {
            Reads[i].resolvedTaxon=0;
            Reads[i].numToolsAgreed=numToolsUsed;
            Reads[i].score=1;
            continue;
        }
        else if(Reads[i].numToolsReported == 1 && minNumAgreed<=1)
        {
            Reads[i].resolvedTaxon=0;
            for (uint32_t j=0 ; j<numToolsUsed ; j++)
            {
                Reads[i].resolvedTaxon += Reads[i].annotation[j];
            }
            Reads[i].numToolsAgreed=1;
            if(Reads[i].numToolsAgreed==Reads[i].numToolsReported)
            {
                Reads[i].score=(double)Reads[i].numToolsAgreed / (double)Reads[i].numToolsUsed;
            }
            else
            {
                Reads[i].score=((double)Reads[i].numToolsAgreed / (double)Reads[i].numToolsUsed) - (1/penalty*((double)Reads[i].numToolsUsed));
            }
            continue;
        }
        else if(Reads[i].numToolsReported==2 && minNumAgreed<=2)
        {
            n=0;

            for (uint32_t j=0 ; j<numToolsUsed ; j++)
            {
                if(Reads[i].annotation[j])
                {
                    SavedTax_2[n]=Reads[i].annotation[j];
                    n++;
                }
            }

            Reads[i].resolvedTaxon=lca(SavedTax_2[0], SavedTax_2[1],standardMapLagacy);
            Reads[i].numToolsAgreed=2;
            if(Reads[i].numToolsAgreed==Reads[i].numToolsReported)
            {
                Reads[i].score=(double)Reads[i].numToolsAgreed / (double)Reads[i].numToolsUsed;
            }
            else
            {
                Reads[i].score=(double)Reads[i].numToolsReported / (double)(Reads[i].numToolsUsed * Reads[i].numToolsAgreed);
            }
            continue;
        }
        else if(Reads[i].numToolsReported>=3)
        {
            hit_counts.clear();
            for (uint32_t j=0 ; j<numToolsUsed ; j++)
            {
                parents=get_ancestry(Reads[i].annotation[j],standardMapLagacy);
                for(set_iterator = parents.begin(); set_iterator != parents.end(); set_iterator++)
                {
                    hit_counts[*set_iterator]++;
                }
            }

            /// Resolve tree for each sequence to get WEVOTE annotation
            Reads[i].resolvedTaxon=resolve_tree(hit_counts, Reads[i].numToolsReported, minNumAgreed ,
                                                standardMapLagacy );
            Reads[i].numToolsAgreed=hit_counts[Reads[i].resolvedTaxon];

            if(Reads[i].numToolsAgreed==Reads[i].numToolsReported)
            {
                Reads[i].score=(double)Reads[i].numToolsAgreed / (double)Reads[i].numToolsUsed;
            }
            else
            {
                Reads[i].score=((double)Reads[i].numToolsAgreed / (double)(Reads[i].numToolsUsed)) - (1/ (penalty * ((double)Reads[i].numToolsUsed)));
            }
        }
        else
        {
            Reads[i].resolvedTaxon=0;
            Reads[i].numToolsAgreed=0;
            Reads[i].score=0;
            continue;
        }
    }
    double end = omp_get_wtime();
    double total=end-start;
    cout << "WEVOTE classification executed in= " << total << "\n";
}

wevote::WevoteClassifier classifier( taxonomy );
std::pair< std::vector< wevote::ReadInfo > ,  std::vector< std::string >>
reads = wevote::WevoteClassifier::getUnclassifiedReads( TEST_ENSEMBLE_CSV_FILE );
static void preprocessReads()
{
    classifier.preprocessReads( reads.first );
}


TEST_CASE("Reads Preprocessing and Wevote Classification")
{

    lagacyPreprocessReads();
    preprocessReads();
    wevote::ReadInfo mismatch = reads.first.front();
    readsInfo mismatchLagacy = Reads.front();
    int mismatchCounter = 0;
    auto comp =
            [&]( const wevote::ReadInfo &read ,
            const readsInfo &lagacyRead ){
        bool eq = read.annotation == lagacyRead.annotation &&
                read.numToolsAgreed == lagacyRead.numToolsAgreed &&
                read.numToolsReported == lagacyRead.numToolsReported &&
                read.numToolsUsed == lagacyRead.numToolsUsed &&
                read.resolvedTaxon == lagacyRead.resolvedTaxon &&
                read.seqID == read.seqID;
        if( !eq )
        {
            mismatchCounter++;
            mismatch = read;
            mismatchLagacy = lagacyRead;
        }
        return eq;
    };

    SECTION("Preprocessing Reads")
    {
        mismatchCounter = 0;
        CAPTURE( reads.first.size());
        CAPTURE( Reads.size());
        CAPTURE( mismatch );
        CAPTURE( mismatchLagacy );
        REQUIRE( std::equal( reads.first.cbegin() , reads.first.cend(),
                             Reads.cbegin() , Reads.cend() , comp  ));
    }

    SECTION("Classification")
    {
        mismatchCounter = 0;
        lagacyClassification();
        classifier.classify( reads.first , minNumAgreed , penalty );
        CAPTURE( reads.first.size());
        CAPTURE( Reads.size());
        CAPTURE( mismatch );
        CAPTURE( mismatchLagacy );
        CAPTURE( mismatchCounter );
        CAPTURE( reads.first.size());
        REQUIRE( std::equal( reads.first.cbegin() , reads.first.cend(),
                             Reads.cbegin() , Reads.cend() , comp  ));
    }
}
