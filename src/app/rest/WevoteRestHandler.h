#ifndef WEVOTERESTHANDLER_H
#define WEVOTERESTHANDLER_H

#include "RestHandler.h"
#include "WevoteRestMessages.hpp"
#include "cpprest/json.h"
#include "cpprest/http_client.h"

#include "TaxonomyBuilder.h"
#include "WevoteClassifier.h"

namespace wevote
{
namespace rest
{
class WevoteRestHandler : public RestHandler
{
    Q_OBJECT
public:
    WEVOTE_DLL explicit WevoteRestHandler( const http::uri &uri ,
                                           const TaxonomyBuilder &taxonomy );

private:
    WevoteRestHandler();

Q_SIGNALS:
    void doneClassification_SIGNAL( WevoteSubmitEnsemble classified );

private:
Q_SLOT void doneClassification_SLOT( WevoteSubmitEnsemble classified );

protected:
    void _addRoutes() override;
private:
    void _receiveWevoteEnsemble(http_request message);
    void _transmitJSON( const RemoteAddress &address,
                        const json::value &data );
private:
    const TaxonomyBuilder &_taxonomy;
    const WevoteClassifier _classifier;
    std::atomic_int64_t _jobCounter;
};

}
}

#endif // WEVOTERESTHANDLER_H
