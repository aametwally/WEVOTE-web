#include "headers.hpp"
#include "helpers.hpp"
#include "WevoteClassifier.h"
#include "TaxonomyBuilder.h"

#include "CommandLineParser.hpp"

#define DEFAULT_NUM_THREADS 1
#define DEFAULT_SCORE 0
#define DEFAULT_MIN_NUM_AGREED 0
#define DEFAULT_PERNALTY 2


struct WevoteParameters
{
    bool verbose;
    std::string query;
    std::string prefix;
    std::string taxonomyDB;
    uint32_t score;
    int threads;
    int penalty;
    uint32_t minNumAgreed;
    std::string toString() const
    {
        std::stringstream stream;
        stream << "[verbose:" << verbose << "]"
               << "[input:" << query << "]"
               << "[prefix:" << prefix << "]"
               << "[taxonomyDB:" << taxonomyDB << "]"
               << "[score:" << score << "]"
               << "[threads:" << threads << "]"
               << "[penalty:" << penalty << "]"
               << "[minNumAgreed:" << minNumAgreed << "]";
        return stream.str();
    }
    WevoteParameters()
        : threads{1}, penalty{2}, minNumAgreed{0}, score{0}, verbose{false}
    {}
};

const std::list< QCommandLineOption > commandLineOptions =
{
    {
        QStringList() << "i" << "input-file",
        "Input ensemble file produced by the used algorithms."  ,
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
    },
    {
        QStringList() << "n" <<  "threads",
        "Num of threads." ,
        "threads" ,
        QString::number( DEFAULT_NUM_THREADS )
    },
    {
        QStringList() << "k" <<  "penalty",
        "Penalty." ,
        "penalty",
        QString::number( DEFAULT_PERNALTY )
    },
    {
        QStringList() << "a" <<  "min-num-agreed",
        "Minimum number of tools agreed tools on WEVOTE decision." ,
        "min-num-agreed",
        QString::number( DEFAULT_MIN_NUM_AGREED )
    },
    {
        QStringList() << "s" <<  "score",
        "Score threshold." ,
        "score",
        QString::number( DEFAULT_SCORE )
    },
    {
        QStringList() << "v" <<  "verbose",
        "Enable verbose mode." ,
        "verbose",
        QString::number( 1 )
    }
};

auto extractFunction = []( const QCommandLineParser &parser ,
        ParsingResults<WevoteParameters> &results)
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
    results.parameters.verbose =
            static_cast< bool >(parser.value("verbose").toShort());
    results.parameters.query =
            parser.value("input-file").toStdString();
    results.parameters.taxonomyDB =
            parser.value("taxonomy-db-path").toStdString();
    results.parameters.prefix =
            parser.value("output-prefix").toStdString();
    results.parameters.penalty =
            parser.value("penalty").toInt();
    results.parameters.score =
            parser.value("score").toUInt();
    results.parameters.threads =
            parser.value("threads").toInt();
    results.parameters.minNumAgreed =
            parser.value("min-num-agreed").toUInt();
};

int main(int argc, char *argv[])
{
    QCoreApplication a( argc , argv );
    CommandLineParser cmdLineParser( a , commandLineOptions ,
                                     std::string(argv[0]) + " help" );
    ParsingResults<WevoteParameters> parsingResults;
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
    const std::string outputDetails=
            param.prefix + "_WEVOTE_Details.txt";

    LOG_INFO("NodesFilename=%s", nodesFilename);
    LOG_INFO("NamesFilename=%s", namesFilename);

    /// Read CSV formated input file
    LOG_INFO("Loading reads..");
    std::vector< wevote::ReadInfo > reads = wevote::io::getReads( param.query );
    LOG_INFO("[DONE] Loading reads..");

    /// Build taxonomy trees
    LOG_INFO("Building Taxonomy..");
    wevote::TaxonomyBuilder taxonomy( nodesFilename , namesFilename );
    LOG_INFO("[DONE] Building Taxonomy..");

    wevote::WevoteClassifier wevoteClassifier( taxonomy );
    wevoteClassifier.classify( reads , param.minNumAgreed ,
                               param.penalty , param.threads );

    /// Output.
    wevote::io::writeReads( reads , outputDetails );
    return a.exec();
}
