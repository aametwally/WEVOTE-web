#ifndef MYSERVICE_H
#define MYSERVICE_H

#include <QCoreApplication>
#include <QObject>
#include "qtservice.h"
#include "Logger.h"

class MyService : public QtService<QCoreApplication>
{
public:
    /**
     * @brief MyService
     * @param argc
     * @param argv
     */
    MyService( int argc , char **argv );

    void start() Q_DECL_OVERRIDE;

    void pause() Q_DECL_OVERRIDE;

    void resume() Q_DECL_OVERRIDE;

    void stop(bool& successfullyStopped) Q_DECL_OVERRIDE;


    ~MyService();
};

#endif // MYSERVICE_H
