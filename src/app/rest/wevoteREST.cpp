#include <iostream>
#include <QCoreApplication>
#include <QObject>
#include <QFile>
#include <QDir>

#include "stdafx.h"
#include "WevoteRestHandler.h"
#include "CommandLineParser.hpp"

#define DEFAULT_HOST "127.0.0.1"
#define DEFAULT_PORT 34568
#define DEFAULT_CENTRAL_WEVOTE_HOST "127.0.0.1"
#define DEFAULT_CENTRAL_WEVOTE_PORT 3000
#define DEFAULT_CENTRAL_WEVOTE_RPATH "/experiment/classification"
struct WevoteRestParameters
{
    bool verbose;
    std::string host;
    int port;
    std::string wevoteCentralHost;
    int wevoteCentralPort;
    std::string wevoteRelativePath;
    std::string taxonomyDB;
    std::string toString() const
    {
        std::stringstream stream;
        stream << "[host:" << host << "]"
               << "[port:" << port << "]"
               << "[whost:" << wevoteCentralHost << "]"
               << "[wport:" << wevoteCentralPort << "]"
               << "[wrelpath:" << wevoteRelativePath << "]"
               << "[taxonomy-db:" << taxonomyDB << "]"
               << "[verbose:" << verbose << "]";
        return stream.str();
    }
    WevoteRestParameters()
        : host{ DEFAULT_HOST } , port{ DEFAULT_PORT } ,
          wevoteCentralHost{ DEFAULT_CENTRAL_WEVOTE_HOST } ,
          wevoteCentralPort{ DEFAULT_CENTRAL_WEVOTE_PORT } ,
          wevoteRelativePath{ DEFAULT_CENTRAL_WEVOTE_RPATH },
          verbose{false}
    {}
};

const std::list< QCommandLineOption > commandLineOptions =
{
    {
        QStringList() << "H" << "host",
        "host where application is served."  ,
        "host" ,
        QString( DEFAULT_HOST )
    },
    {
        QStringList() << "P" <<  "port",
        "The port (i.e socket number) selected for the application." ,
        "port" ,
        QString::number( DEFAULT_PORT )
    },
    {
        QStringList() << "W" << "wevote-host",
        "host where central wevote server served."  ,
        "wevote-host" ,
        QString( DEFAULT_CENTRAL_WEVOTE_HOST )
    },
    {
        QStringList() << "R" <<  "wevote-port",
        "The port (i.e socket number) selected for the central wevote server." ,
        "port" ,
        QString::number( DEFAULT_CENTRAL_WEVOTE_PORT )
    },
    {
        QStringList() << "A" <<  "wevote-path",
        "The relative path used to submit wevote results." ,
        "wevote-path" ,
        QString( DEFAULT_CENTRAL_WEVOTE_RPATH )
    },
    {
        QStringList() << "d" <<  "taxonomy-db-path",
        "The path of the taxonomy database file." ,
        "taxonomy-db-path"
    },
    {
        QStringList() << "v" <<  "verbose",
        "Enable verbose mode." ,
        "verbose",
        QString::number( 1 )
    }
};

auto extractFunction = []( const QCommandLineParser &parser ,
        ParsingResults<WevoteRestParameters> &results)
{
    QDir taxonomyDBPath( parser.value("taxonomy-db-path"));
    if( !taxonomyDBPath.exists())
    {
        results.success = CommandLineResult::CommandLineError;
        results.errorMessage = "Taxonomy provided dir does not exist.";
        return;
    }
    results.parameters.verbose =
            static_cast< bool >(parser.value("verbose").toShort());
    results.parameters.host =
            parser.value("host").toStdString();
    results.parameters.port =
            parser.value("port").toInt();
    results.parameters.wevoteCentralHost =
            parser.value("wevote-host").toStdString();
    results.parameters.wevoteCentralPort =
            parser.value("wevote-port").toInt();
    results.parameters.wevoteRelativePath =
            parser.value("wevote-path").toStdString();
    results.parameters.taxonomyDB =
            parser.value("taxonomy-db-path").toStdString();
};

int main(int argc, char *argv[])
{
    QCoreApplication a( argc , argv );
    CommandLineParser cmdLineParser( a , commandLineOptions ,
                                     std::string(argv[0]) + " help" );
    ParsingResults<WevoteRestParameters> parsingResults;
    cmdLineParser.process();
    cmdLineParser.tokenize( extractFunction , parsingResults );
    const WevoteRestParameters &param = parsingResults.parameters;

    using namespace wevote;
    const std::string nodesFilename=
            QDir( QString::fromStdString( param.taxonomyDB ))
            .filePath("nodes.dmp").toStdString();

    const std::string namesFilename=
            QDir( QString::fromStdString( param.taxonomyDB ))
            .filePath("names.dmp").toStdString();

    LOG_INFO("Loading Taxonomy..");
    const TaxonomyBuilder taxonomy( nodesFilename , namesFilename );
    LOG_INFO("[DONE] Loading Taxonomy..");

    http::uri_builder uriBuilder;
    uriBuilder.set_scheme( U("http"));
    uriBuilder.set_host( io::convertOrReturn< defs::string_t >( param.host ));
    uriBuilder.set_port( param.port );
    rest::WevoteRestHandler httpHandler( uriBuilder.to_uri() , taxonomy );

    const http::uri wevoteURI = wevote::rest::WevoteRestHandler::asURI(
                param.wevoteCentralHost , param.wevoteCentralPort ,
                param.wevoteRelativePath );
    httpHandler.addClient( wevoteURI );
    httpHandler.start();

    LOG_INFO("Listening for requests at:%s", USTR(uriBuilder.to_string()));
    LOG_INFO("Press ctrl+C to exit.");
    return a.exec();
}
