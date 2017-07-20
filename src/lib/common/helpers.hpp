#include "headers.hpp"
#include "ReadInfo.h"
#include "TaxLine.h"
#include "Logger.h"


namespace wevote
{
namespace io
{

template< typename SeqIt >
std::string join( SeqIt first , SeqIt last , const std::string &sep )
{
    auto binaryJoinString = [sep]( const std::string &a , const std::string &b ) -> std::string
    {
        return  a + ((a.length() > 0) ? sep : "") +  b ;
    };
    return std::accumulate( first , last ,
                            std::string() , binaryJoinString  );
}

template< typename Container = std::vector< std::string >>
std::string join( const Container &container ,
                  const std::string &sep )
{
    return join( container.cbegin() , container.cend() , sep );
}

template< typename T >
std::string toString( T value )
{
    return std::to_string( value );
}

template< typename SeqIt >
std::vector< std::string > asStringsVector( SeqIt firstIt , SeqIt lastIt )
{
    std::vector< std::string > stringified;
    std::transform( firstIt , lastIt ,
                    std::inserter( stringified , std::end( stringified )) ,
                    toString< typename SeqIt::value_type > );
    return stringified;
}

std::vector< ReadInfo >
getReads( const std::string &filename )
{
    std::vector<wevote::ReadInfo> reads;
    std::ifstream file ( filename );
    std::string line = "";
    if (!file.is_open())
        LOG_ERROR("Error opening file:%s",filename);

    while (std::getline(file, line))
    {
        std::stringstream strstr(line);
        std::string word = "";
        int col=0;
        int value=0;
        wevote::ReadInfo read;
        while (std::getline(strstr,word, ','))
        {
            if(col++==0)
                read.seqID=word;
            else
            {
                value=atoi(word.c_str());
                read.annotation.push_back(value);
            }
        }
        reads.push_back(read);
    }
    return reads;
}

void writeReads( const std::vector< ReadInfo > &reads ,
                 const std::string &fileName )
{
    /// Export the detailed output in txt format
    std::ofstream myfile;
    myfile.open (fileName.c_str());
    if (!myfile.is_open())
        LOG_ERROR("Error opening Output file:%s",fileName);

    for ( const wevote::ReadInfo &read : reads )
        myfile << read.seqID << "\t"
               << read.numToolsUsed << "\t"
               << read.numToolsReported << "\t"
               << read.numToolsAgreed<<"\t"
               << read.score << "\t"
               << wevote::io::join(
                      wevote::io::asStringsVector( read.annotation.cbegin() ,
                                                   read.annotation.cend()) , "\t") << "\t"
               << read.resolvedTaxon << "\n";

    myfile.close();
}

template< typename CorrectTaxanFun >
std::map< uint32_t , TaxLine > readWevoteFile(
        const std::string &filename ,
        CorrectTaxanFun correctTaxan )
{
    std::map< uint32_t , TaxLine > taxonAnnotateMap;

    std::ifstream file (filename);
    std::string line = "";

    if (!file.is_open())
        LOG_ERROR("Error opening file:%s",filename.c_str());

    int q=0;
    while (std::getline(file, line))
    {
        q++;
        std::stringstream strstr(line);
        std::string word = "";

        // column:0
        std::getline(strstr,word, ',');
        uint32_t taxon = atoi(word.c_str());
        if( taxon == ReadInfo::noAnnotation )
        {
            LOG_DEBUG("Taxon 0 presents in line = %d",q);
            taxon = correctTaxan( taxon );
        }
        // column:1
        std::getline(strstr,word, ',');
        uint32_t count = atoi(word.c_str());

        if ( taxonAnnotateMap.find(taxon) == taxonAnnotateMap.end() )
        {
            taxonAnnotateMap[taxon].count = count;
            taxonAnnotateMap[taxon].taxon = taxon;
        } else {
            taxonAnnotateMap[taxon].count += count;
        }
    }
    return taxonAnnotateMap;
}

void writeAbundance( const std::map< uint32_t , TaxLine > &abundance ,
                     const std::string &filename )
{
    std::ofstream myfile;
    myfile.open (filename.c_str());
    if (!myfile.is_open())
        LOG_ERROR("Error opening Output file: %s", filename.c_str());

    myfile << "taxon" << ","
           << "count" << ","
           << join( Rank::rankLabels.cbegin() + 1 ,
                    Rank::rankLabels.cend() , ",") << "\n";

    for( const std::pair< uint32_t , wevote::TaxLine > &p : abundance)
        myfile << p.second.taxon << ","
               << p.second.count << ","
               << join( p.second.line.cbegin() + 1 ,
                        p.second.line.cend() , ", ") << "\n";
    myfile.close();
}
}




}
