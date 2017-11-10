#ifndef _HOME_ASEM_GP_WEVOTE_SRC_APP_WEVOTESCRIPTHANDLER_H
#define _HOME_ASEM_GP_WEVOTE_SRC_APP_WEVOTESCRIPTHANDLER_H

#ifndef _HOME_ASEM_GP_WEVOTE_SRC_APP_WEVOTESCRIPTHANDLER_H
#define _HOME_ASEM_GP_WEVOTE_SRC_APP_WEVOTESCRIPTHANDLER_H

#ifndef _HOME_ASEM_GP_WEVOTE_SRC_APP__HOME_ASEM_GP_WEVOTE_SRC_APP_WEVOTESCRIPTHANDLER_H
#define _HOME_ASEM_GP_WEVOTE_SRC_APP__HOME_ASEM_GP_WEVOTE_SRC_APP_WEVOTESCRIPTHANDLER_H

// Qt
#include <QCoreApplication>
#include <QDir>
#include <QFile>

// local lib
#include"ReadInfo.h"
#include ""headers.hpp"

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
    static std::atomic_uin // namespace wevote
#_HOME_ASEM_GP_WEVOTE_HOME_ASEM_GP_WEVOTE_SRC_APP_WEVOTESCRIPTHANDLER_H
