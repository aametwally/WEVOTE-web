#ifndef TESTS_H
#define TESTS_H

#include "headers.hpp"
#include "helpers.hpp"
#include "create_db.hpp"
#include "TaxonomyBuilder.h"

extern map<uint32_t, uint32_t> parentMap;
extern map<uint32_t, string> rankMap;
extern map<uint32_t, uint32_t> standardMap;
extern map<uint32_t, string> namesMap;

#define TAXONOMY_DIRECTORY "/projects/data/taxonomy"
#define TAXONOMY_NAMES_FILE std::string( TAXONOMY_DIRECTORY ) + "/names.dmp"
#define TAXONOMY_NODES_FILE std::string( TAXONOMY_DIRECTORY ) + "/nodes.dmp"

namespace test_utils
{
    auto getFileLines( const std::string &filePath )
    {
        std::ifstream f( filePath );
        std::vector< std::string > lines;
        std::string line;
        if( f )
            while( std::getline( f , line ))
                lines.push_back( line );
        else std::cout << "Failed to open file:" << filePath ;
        return lines;
    }


    template< typename Container1 , typename Container2 ,
              typename Elem = typename Container1::value_type >
    bool setBasedEquality( const Container1 &a , const Container2 &b ,
                           bool checkSize = true )
    {
        if( checkSize && a.size() != b.size())
            return false;

        std::set< Elem > setA( std::begin( a ) , std::end( a ));
        std::set< Elem > setB( std::begin( b ) , std::end( b ));
        return setA == setB;
    }

}
#endif // TESTS_H
