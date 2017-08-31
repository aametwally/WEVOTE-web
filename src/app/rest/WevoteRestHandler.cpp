#include "WevoteRestHandler.h"
#include <sstream>

namespace wevote
{
namespace web
{


WevoteRestHandler::WevoteRestHandler(utility::string_t url)
    : RestHandler( url )
{
}

void WevoteRestHandler::_addRoutes()
{
    const std::string wevoteSubmitEnsembleFile = "/wevote/submit/ensemble";
    _addRoute( Method::POST  ,  wevoteSubmitEnsembleFile ,
               [this]( http_request msg ) { _submitWevoteEnsemble(msg); });
}

void WevoteRestHandler::_submitWevoteEnsemble(http_request message)
{
    LOG_DEBUG("Submiting..");
    message.extract_json()
            .then([=](json::value value)
    {
        WevoteSubmitEnsemble data = io::DeObjectifier::fromObject< WevoteSubmitEnsemble >( value );
        json::value jsonData = io::Objectifier::objectFrom( data );
        std::cout << jsonData.serialize() << std::endl;
    })
            .wait();
    LOG_DEBUG("[DONE] Submiting..");

}


}
}
