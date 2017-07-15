#include "headers.hpp"
#include "helpers.hpp"
#include "TaxonomyBuilder.h"
#include "Logger.h"
#include "CommandLineParser.hpp"

#define DEFAULT_ABUNDANCE_METHOD "total"

struct AbundanceParameters
{
    std::string query;
    std::string prefix;
    std::string taxonomyDB;
    std::string toString() const
    {
        std::stringstream stream;
        stream << "[input:" << query << "]"
               << "[prefix:" << prefix << "]"
               << "[taxonomyDB:" << taxonomyDB << "]";
        return stream.str();
    }
};


const std::list< QCommandLineOption > commandLineOptions =
{
    {
        QStringList() << "i" << "input-file",
        "Input file produced by wevote algorithm."  ,
        "input-file"
    },
    {
        QStringList() << "d" <<  "taxonomy-db-path",
        "The path of the taxonomy database file." ,
        "taxonomy-db-path"
    },
    {
        QStringList() << "p" <<  "output-prefix",
        "OutputFile Prefix" ,
        "output-prefix"
    }
};

auto extractFunction = []( const QCommandLineParser &parser ,
        ParsingResults<AbundanceParameters> &results)
{
    /// parse commandline arguments
    if( !parser.isSet("input-file"))
    {
        results.success = CommandLineResult::CommandLineError;
        results.errorMessage = "Input file is not specified.";
        return;
    }
    if( !parser.isSet("taxonomy-db-path"))
    {
        results.success = CommandLineResult::CommandLineError;
        results.errorMessage = "Taxonomy file is not specified.";
        return;
    }
    if( !parser.isSet("output-prefix"))
    {
        results.success = CommandLineResult::CommandLineError;
        results.errorMessage = "Output prefix is not specified.";
        return;
    }

    results.parameters.query =
            parser.value("input-file").toStdString();
    results.parameters.taxonomyDB =
            parser.value("taxonomy-db-path").toStdString();
    results.parameters.prefix =
            parser.value("output-prefix").toStdString();
};


int main(int argc, char *argv[])
{	
    QCoreApplication a( argc , argv );
    auto cmdLineParser =
            CommandLineParser( a , commandLineOptions ,
                               std::string(argv[0]) + " help" );
    ParsingResults<AbundanceParameters> parsingResults;
    cmdLineParser.process();
    cmdLineParser.tokenize( extractFunction , parsingResults );

    if( parsingResults.success == CommandLineResult::CommandLineError )
        LOG_ERROR("Command line error: %s", parsingResults.errorMessage.c_str());
    else
        LOG_DEBUG("parameters: %s", parsingResults.parameters.toString().c_str());

    const auto &param = parsingResults.parameters;

    const std::string nodesFilename=
            param.taxonomyDB+"/nodes_wevote.dmp";
    const std::string namesFilename=
            param.taxonomyDB+"/names_wevote.dmp";
    const std::string outputProfile=
            param.prefix + "_Abundance.csv";


    /// Build taxonomy trees
    const wevote::TaxonomyBuilder taxonomy =
            wevote::TaxonomyBuilder( nodesFilename , namesFilename );


    /// Read WEVOTE output file
    const std::map< uint32_t , wevote::TaxLine > taxonAnnotateMap =
            wevote::io::readWevoteFile( param.query ,
                                        [&]( uint32_t taxid ){
            return taxonomy.correctTaxan( taxid );
});


    LOG_INFO("Total #reads have Taxon 0 = %d",  taxonAnnotateMap[0].count );

    uint32_t totalCounts=
            std::accumulate( taxonAnnotateMap.cbegin() , taxonAnnotateMap.cend() ,
                             0 , []( int c , const std::pair< uint32_t , wevote::TaxLine > &p ){
        return c + p.second.count;
    });
    LOG_INFO("Total # reads = %d", totalCounts );

    for( std::pair< uint32_t , wevote::TaxLine > &p : taxonAnnotateMap )
    {
        p.second.RA = ((double)p.second.count/(double)totalCounts)*100;
        uint32_t taxon = p.first;
        while(taxon != wevote::ReadInfo::noAnnotation)
        {
            const std::string rank = taxonomy.getRank(taxon);
            const std::string name = taxonomy.getTaxName( taxon );

            if(rank == "species")
            {
                p.second.species = name;
            }
            else if (rank == "genus")
            {
                p.second.genus = name;
            }
            else if (rank == "family")
            {
                p.second.family = name;
            }
            else if (rank == "order")
            {
                p.second.order = name;
            }
            else if (rank == "class")
            {
                p.second.clas = name;
            }
            else if (rank == "phylum")
            {
                p.second.phylum = name;
            }
            else if (rank == "kingdom")
            {
                p.second.kingdom = name;
            }
            else if (rank == "superkingdom")
            {
                p.second.superkingdom = name;
            }
            else if (rank == "root")
            {
                p.second.root = name;
            }

            taxon = taxonomy.getStandardParent( taxon );
        }
    }

    /// Export taxonomy and relative abundance to txt file
    wevote::io::writeAbundance( taxonAnnotateMap , outputProfile );
}
