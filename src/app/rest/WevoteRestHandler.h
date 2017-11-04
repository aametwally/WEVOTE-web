#ifndef WEVOTERESTHANDLER_H
#define WEVOTERESTHANDLER_H

// Qt
#include <QCoreApplication>
#include <QDir>
#include <QFile>

// cpprest
#include "cpprest/json.h"
#include "cpprest/http_client.h"

// local app
#include "config.h"
#include "RestHandler.h"
#include "WevoteRestMessages.hpp"

// local lib
#include "TaxonomyBuilder.h"
#include "WevoteClassifier.h"

namespace wevote
{
namespace rest
{
class WevoteRestHandler : public RestHandler
{
public:
    WEVOTE_DLL explicit WevoteRestHandler( const http::uri &uri ,
                                           const TaxonomyBuilder &taxonomy );

private:
    WevoteRestHandler();

protected:
    void _addRoutes() override;
private:
    void _receiveEnsembleClassifiedSequences( http_request message );
    void _receiveUnclassifiedSequences( http_request message );
    void _receiveClassifiedSequences( http_request message );

    std::vector< ReadInfo > _fullpipeline( const WevoteSubmitEnsemble &submission );
    void _transmitJSON( const WevoteSubmitEnsemble &data );

    uint _getId();
private:
    const TaxonomyBuilder &_taxonomy;
    const WevoteClassifier _classifier;
    static std::atomic_uint _jobCounter;
};

}
}

#endif // WEVOTERESTHANDLER_H
