#include "MyService.h"

MyService::MyService(int argc, char **argv)
    : QtService<QCoreApplication>( argc , argv , "XYZMYService")
{
    try {
        setServiceDescription("This is my xyz myservice.");
        setServiceFlags( QtServiceBase::CanBeSuspended );
    } catch( const std::exception &e  )
    {
        LOG_ERROR("An unknown error in the constructor. %s", e.what());
    }

    LOG_DEBUG("Service constructed.");
}

void MyService::start()
{
    try {
        QCoreApplication *app = application();
        LOG_DEBUG("Service Location:%s",
                  app->applicationDirPath().toStdString().c_str());
    }  catch( const std::exception &e  )
    {
        LOG_ERROR("An unknown error. %s", e.what());
    }

    LOG_DEBUG("Service started.");
}

void MyService::pause()
{
    try {

    }  catch( const std::exception &e  )
    {
        LOG_ERROR("An unknown error. %s", e.what());
    }

    LOG_DEBUG("Service paused.");
}

void MyService::resume()
{
    try {

    } catch( const std::exception &e  )
    {
        LOG_ERROR("An unknown error. %s", e.what());
    }

    LOG_DEBUG("Service resumed.");
}

void MyService::stop(bool &successfullyStopped)
{
    try {


    }  catch( const std::exception &e  )
    {
        LOG_ERROR("An unknown error. %s", e.what());
    }

    LOG_DEBUG("Service stopped.");
}

MyService::~MyService()
{
    try {

    }  catch( const std::exception &e  )
    {
        LOG_ERROR("An unknown error. %s", e.what());
    }
}
