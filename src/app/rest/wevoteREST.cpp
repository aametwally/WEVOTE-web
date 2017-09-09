#include <iostream>
#include <QCoreApplication>
#include <QObject>
#include <QFile>

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
    std::string toString() const
    {
        std::stringstream stream;
        stream << "[host:" << host << "]"
               << "[port:" << port << "]"
               << "[whost:" << wevoteCentralHost << "]"
               << "[wport:" << wevoteCentralPort << "]"
               << "[wrelpath:" << wevoteRelativePath << "]"
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
        QStringList() << "v" <<  "verbose",
        "Enable verbose mode." ,
        "verbose",
        QString::number( 1 )
    }
};

auto extractFunction = []( const QCommandLineParser &parser ,
        ParsingResults<WevoteRestParameters> &results)
{
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
};

int main(int argc, char *argv[])
{
    QCoreApplication a( argc , argv );
    CommandLineParser cmdLineParser( a , commandLineOptions ,
                                     std::string(argv[0]) + " help" );
    ParsingResults<WevoteRestParameters> parsingResults;
    cmdLineParser.process();
    cmdLineParser.tokenize( extractFunction , parsingResults );

    using namespace wevote;
    http::uri_builder uriBuilder;
    uriBuilder.set_scheme( U("http"));
    uriBuilder.set_host( io::convertOrReturn< defs::string_t >(
                             parsingResults.parameters.host ));
    uriBuilder.set_port( parsingResults.parameters.port );
    rest::WevoteRestHandler httpHandler( uriBuilder.to_uri());

    const http::uri wevoteURI = wevote::rest::WevoteRestHandler::asURI(
                parsingResults.parameters.wevoteCentralHost ,
                parsingResults.parameters.wevoteCentralPort ,
                parsingResults.parameters.wevoteRelativePath );
    httpHandler.addClient( wevoteURI );
    httpHandler.start();

    LOG_INFO("Listening for requests at:%s", USTR(uriBuilder.to_string()));
    LOG_INFO("Press ctrl+C to exit.");
    return a.exec();
}
