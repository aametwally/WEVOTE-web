#include "WevoteRestHandler.h"

namespace wevote
{
namespace rest
{


WevoteRestHandler::WevoteRestHandler( const uri &uri )
    : RestHandler( uri )
{
    static auto _ = qRegisterMetaType<WevoteSubmitEnsemble>("WevoteSubmitEnsemble");
    connect( this , SIGNAL(doneClassification_SIGNAL(WevoteSubmitEnsemble)) ,
             this , SLOT(doneClassification_SLOT(WevoteSubmitEnsemble)));
}



void WevoteRestHandler::doneClassification_SLOT(WevoteSubmitEnsemble classified)
{
    LOG_DEBUG("serializing classified reads..");
    json::value data = io::Objectifier::objectFrom( classified );
    const RemoteAddress address = classified.getResultsRoute();
    _transmitJSON( address , data );
    LOG_DEBUG("[DONE] serializing classified reads..");
}

void WevoteRestHandler::_addRoutes()
{
    const auto wevoteSubmitEnsembleFile = U("/wevote/submit/ensemble");
    _addRoute( Method::POST  ,  wevoteSubmitEnsembleFile ,
               [this]( http_request msg ) { _receiveWevoteEnsemble(msg); });
}

void WevoteRestHandler::_receiveWevoteEnsemble(http_request message)
{
    const std::string s = "Submitting..";
    LOG_DEBUG("%s", USTR(s));
    message.extract_json()
            .then([this,message]( web::json::value value )
    {
        WevoteSubmitEnsemble data = io::DeObjectifier::fromObject< WevoteSubmitEnsemble >( value );
        LOG_DEBUG("%s",USTR(message.request_uri().to_string()));
        LOG_DEBUG("%s",USTR(message.get_remote_address()));

        for( const std::pair< utility::string_t , utility::string_t > &p : message.headers())
            LOG_DEBUG("[%s:%s]",USTR(p.first),USTR(p.second));

        Q_EMIT doneClassification_SIGNAL( data );
    });
    LOG_DEBUG("[DONE] Submiting..");
}

void WevoteRestHandler::_transmitJSON( const RemoteAddress &address,
                                       const json::value &data )
{

    http::http_request request( methods::POST );
    request.set_body( data );

    pplx::task<void> task = _getClient( address ).request(request)
            .then([](http_response response)-> pplx::task<json::value>{
                    return response.extract_json();
                ;})
            .then([](pplx::task<json::value> previousTask){
                try{
                    const json::value & v = previousTask.get();
                    ucout << v.serialize() << std::endl;
                } catch(const http_exception &e){
                    std::cout<<e.what()<<std::endl;
                }
            });
    try{
        task.wait();
    } catch(std::exception &e){
        std::cout<<e.what()<<std::endl;
    }
}


}
}


