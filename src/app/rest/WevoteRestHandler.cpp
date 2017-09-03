#include "WevoteRestHandler.h"

namespace wevote
{
namespace rest
{


WevoteRestHandler::WevoteRestHandler(utility::string_t url)
    : RestHandler( url )
{
}

void WevoteRestHandler::_addRoutes()
{
    const auto wevoteSubmitEnsembleFile = U("/wevote/submit/ensemble");
    _addRoute( Method::POST  ,  wevoteSubmitEnsembleFile ,
               [this]( http_request msg ) { _submitWevoteEnsemble(msg); });
}

void WevoteRestHandler::_submitWevoteEnsemble(http_request message)
{
    LOG_DEBUG("Submiting..");
    message.extract_json()
            .then([]( web::json::value value )
    {
        WevoteSubmitEnsemble data = io::DeObjectifier::fromObject< WevoteSubmitEnsemble >( value );
        json::value jsonData = io::Objectifier::objectFrom( data );
        ucout << jsonData.serialize();
    })
    .wait();
    LOG_DEBUG("[DONE] Submiting..");
}

}
}


