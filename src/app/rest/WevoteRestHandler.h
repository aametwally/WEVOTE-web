#ifndef WEVOTERESTHANDLER_H
#define WEVOTERESTHANDLER_H

// Qt
#include <QCoreApplication>


// cpprest
#include "cpprest/json.h"
#include "cpprest/http_client.h"

// local app
#include "RestHandler.h"
#include "WevoteRestMessages.hpp"
#include "WevoteScriptHandler.h"

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
    void _wevoteClassifier( http_request message );
    void _fullPipeline( http_request message );
    void _generateProfile( http_request message );

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
