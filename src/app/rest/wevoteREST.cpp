#include <iostream>
#include <QCoreApplication>
#include <QObject>
#include <QFile>

#include "stdafx.h"
#include "WevoteRestHandler.h"
#include "CommandLineParser.hpp"

#define DEFAULT_HOST "http://127.0.0.1"
#define DEFAULT_PORT "34568"

struct WevoteRestParameters
{
    bool verbose;
    std::string host;
    std::string port;
    std::string toString() const
    {
        std::stringstream stream;
        stream << "[host:" << host << "]"
               << "[input:" << port << "]"
               << "[verbose:" << verbose << "]";
        return stream.str();
    }
    WevoteRestParameters()
        : host{ DEFAULT_HOST } , port{ DEFAULT_PORT } , verbose{false}
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
        QString( DEFAULT_PORT )
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
            parser.value("port").toStdString();
};

int main(int argc, char *argv[])
{
    QCoreApplication a( argc , argv );
    CommandLineParser cmdLineParser( a , commandLineOptions ,
                                     std::string(argv[0]) + " help" );
    ParsingResults<WevoteRestParameters> parsingResults;
    cmdLineParser.process();
    cmdLineParser.tokenize( extractFunction , parsingResults );

    utility::string_t port = utility::conversions::to_string_t(
                parsingResults.parameters.port );
    utility::string_t host = utility::conversions::to_string_t(
                parsingResults.parameters.host );
    const std::vector< utility::string_t > address{ host , port };
    const utility::string_t fullAddress =  wevote::io::join( address , U(':'));
    uri_builder uri( fullAddress );
    auto addr = uri.to_uri().to_string();

    wevote::rest::WevoteRestHandler httpHandler(addr);
    httpHandler.start();

    LOG_INFO("Listening for requests at:%ws", addr.c_str());
    LOG_INFO("Press ctrl+C to exit.");
    return a.exec();
}
