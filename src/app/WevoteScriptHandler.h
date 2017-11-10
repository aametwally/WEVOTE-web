#ifndef WEVOTESCRIPTHANDLER_H
#define WEVOTESCRIPTHANDLER_H

// Qt
#include <QCoreApplication>
#include <QDir>
#include <QFile>

// local lib
#include"ReadInfo.h"
#include "headers.hpp"

// local app
#include "config.h"


namespace wevote
{

struct WevoteScriptArguments;
class WevoteScriptHandler
{
public:
    WevoteScriptHandler();
    std::vector< ReadInfo > execute( const std::vector< std::string > &inputSequences ,
                                     const std::vector< std::string > &algorithms ) const;
protected:
    static uint _getId() ;

private:
    static std::atomic_uint _jobCounter;

};
} // namepsace wevote
#endif // WEVOTESCRIPTHANDLER_H
