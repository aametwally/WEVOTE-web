#include "headers.hpp"
#include "helpers.hpp"
#include "TaxonomyLineAnnotator.h"
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
    CommandLineParser cmdLineParser( a , commandLineOptions ,
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
    const wevote::TaxonomyBuilder taxonomy( nodesFilename , namesFilename );

    auto taxanCorrector = [&]( uint32_t taxid ){
        return taxonomy.correctTaxan( taxid );
    };

    /// Read WEVOTE output file
    std::map< uint32_t , wevote::TaxLine > taxonAnnotateMap =
            wevote::io::readWevoteFile( param.query , taxanCorrector );


    wevote::TaxonomyLineAnnotator annotator( taxonomy );
    annotator.annotateTaxonomyLines( taxonAnnotateMap );

    /// Export taxonomy and relative abundance to txt file
    wevote::io::writeAbundance( taxonAnnotateMap , outputProfile );
}
