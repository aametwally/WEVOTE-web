#include <QDir>
#include <QFile>

#include "headers.hpp"
#include "helpers.hpp"
#include "WevoteClassifier.h"
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
    if( !parser.isSet("input-file") ||
            !QFile::exists( parser.value("input-file")))
    {
        results.success = CommandLineResult::CommandLineError;
        results.errorMessage = "Input file is not specified or "
                               "does not exists.";
        return;
    }
    if( !parser.isSet("taxonomy-db-path"))
    {
        results.success = CommandLineResult::CommandLineError;
        results.errorMessage = "Taxonomy file is not specified.";
        return;
    }
    QDir taxonomyDBPath( parser.value("taxonomy-db-path"));
    if( !taxonomyDBPath.exists())
    {
        results.success = CommandLineResult::CommandLineError;
        results.errorMessage = "Taxonomy provided dir does not exist.";
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
            QDir( QString::fromStdString( param.taxonomyDB ))
            .filePath("nodes.dmp").toStdString();

    const std::string namesFilename=
            QDir( QString::fromStdString( param.taxonomyDB ))
            .filePath("names.dmp").toStdString();

    const std::string outputProfile=
            param.prefix + "_Abundance.csv";


    /// Build taxonomy trees
    const wevote::TaxonomyBuilder taxonomy( nodesFilename , namesFilename );

    /// Read WEVOTE output file
    std::map< uint32_t , wevote::TaxLine > taxonAnnotateMap =
            wevote::WevoteClassifier::readResults( param.query ,
                                                   taxonomy );


    wevote::TaxonomyLineAnnotator annotator( taxonomy );
    annotator.annotateTaxonomyLines( taxonAnnotateMap );

    /// Export taxonomy and relative abundance to txt file
    wevote::TaxonomyLineAnnotator::writeResults( taxonAnnotateMap , outputProfile );

    return EXIT_SUCCESS;
}
