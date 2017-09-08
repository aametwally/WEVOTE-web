#include "WevoteRestHandler.h"

namespace wevote
{
namespace rest
{


WevoteRestHandler::WevoteRestHandler(utility::string_t url)
    : RestHandler( url )
{
    static auto _ = qRegisterMetaType<WevoteSubmitEnsemble>("WevoteSubmitEnsemble");
    connect( this , SIGNAL(doneClassification_SIGNAL(WevoteSubmitEnsemble)) ,
             this , SLOT(doneClassification_SLOT(WevoteSubmitEnsemble)));
}

void WevoteRestHandler::doneClassification_SLOT(WevoteSubmitEnsemble classified)
{
    LOG_DEBUG("serializing classified reads..");
    json::value data = io::Objectifier::objectFrom( classified );
    const defs::string_t address =
            io::convertOrReturn<defs::string_t>(
                classified.getResultsRoute().getHost() +
            classified.getResultsRoute().getPort()) ;

    const defs::string_t relativePath =
            io::convertOrReturn<defs::string_t>(
                classified.getResultsRoute().getRelativePath());

    auto _client = http::client::http_client(
                http::uri_builder(address).append_path(relativePath).to_uri());

    utility::istream_t s;
    s << data;
    _client.request( methods::GET , "" ,  s ).wait();

    LOG_DEBUG("[DONE] serializing classified reads..");
}

void WevoteRestHandler::_addRoutes()
{
    const auto wevoteSubmitEnsembleFile = U("/wevote/submit/ensemble");
    _addRoute( Method::POST  ,  wevoteSubmitEnsembleFile ,
               [this]( http_request msg ) { _submitWevoteEnsemble(msg); });
}

void WevoteRestHandler::_submitWevoteEnsemble(http_request message)
{
    const std::string s = "Submitting..";
    LOG_DEBUG("%ws",s.c_str());
    message.extract_json()
            .then([this,message]( web::json::value value )
    {
        WevoteSubmitEnsemble data = io::DeObjectifier::fromObject< WevoteSubmitEnsemble >( value );
        LOG_DEBUG("%ws",message.request_uri().to_string().c_str());
        LOG_DEBUG("%ws",message.get_remote_address().c_str());

        for( const std::pair< utility::string_t , utility::string_t > &p : message.headers())
            LOG_DEBUG("[%ws:%ws]",p.first.c_str(),p.second.c_str());

        Q_EMIT doneClassification_SIGNAL( data );
    });
    LOG_DEBUG("[DONE] Submiting..");
}

}
}


