#include <iostream>
#include <QCoreApplication>
#include <QObject>
#include "stdafx.h"
#include "WevoteRestHandler.h"


int main(int argc, char *argv[])
{
    QCoreApplication a( argc , argv );

    utility::string_t port = U("34568");
    if(argc == 2)
    {
        port = utility::conversions::to_string_t( argv[1] );
    }
    utility::string_t address = U("http://127.0.0.1:");
    address.append(port);
    uri_builder uri(address);
    auto addr = uri.to_uri().to_string();

    wevote::rest::WevoteRestHandler httpHandler(addr);
    httpHandler.start();

    LOG_INFO("Listening for requests at:%s", addr.c_str());
    LOG_INFO("Press ctrl+C to exit.");
    return a.exec();
}
