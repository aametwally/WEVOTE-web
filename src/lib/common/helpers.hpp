#include "headers.hpp"
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

template< typename SeqIt >
std::vector< std::string > asStringsVector( SeqIt firstIt , SeqIt lastIt )
{
    std::vector< std::string > stringified;
    std::transform( firstIt , lastIt ,
                    std::inserter( stringified , std::begin( stringified )) ,
                    std::to_string );
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
        while (std::getline(strstr,word, ','))
        {
            wevote::ReadInfo read;
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

std::map< uint32_t , TaxLine > readWevoteFile( const std::string &filename )
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
            taxon = correctTaxan(taxon);
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

    myfile << "taxon" << "," << "count" << "," << "superkingdom" << "," << "kingdom" << "," << "phylum" << "," << "class" << "," << "order" << "," << "family" << ","<< "genus" << "," << "species" << "\n";
    for( const std::pair< uint32_t , wevote::TaxLine > &p : abundance)
        myfile << p.second.taxon << ","
               << p.second.count << ","
               << p.second.superkingdom << ","
               << p.second.kingdom << ","
               << p.second.phylum << ","
               << p.second.clas << ","
               << p.second.order << ","
               << p.second.family << ","
               << p.second.genus << ","
               << p.second.species << "\n";
    myfile.close();
}
}




}