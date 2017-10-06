#include "WevoteRestHandler.h"

namespace wevote
{
namespace rest
{


WevoteRestHandler::WevoteRestHandler( const uri &uri ,
                                      const TaxonomyBuilder &taxonomy )
    : RestHandler( uri ), _taxonomy( taxonomy ) , _classifier( _taxonomy ) ,
      _jobCounter( 0 )
{

}

void WevoteRestHandler::_addRoutes()
{
    const auto wevoteSubmitEnsembleFile = U("/wevote/submit/ensemble");
    _addRoute( Method::POST  ,  wevoteSubmitEnsembleFile ,
               [this]( http_request msg ) { _receiveWevoteEnsemble(msg); });
}

void WevoteRestHandler::_receiveWevoteEnsemble(http_request message)
{
    auto task =
            message.reply(status_codes::OK)
            .then( [this,message](){
        message.extract_json()
                .then([this,message]( web::json::value value )
        {
            WevoteSubmitEnsemble data =
                    io::DeObjectifier::fromObject< WevoteSubmitEnsemble >( value );

            _classifier.classify( data.getReads() , data.getMinNumAgreed() ,
                                  data.getPenalty());

            uint32_t undefined =
                    std::count_if( data.getReads().cbegin() , data.getReads().cend() ,
                                   []( const wevote::ReadInfo &read )
            {
                return read.resolvedTaxon == wevote::ReadInfo::noAnnotation;
            });
                    LOG_INFO("Unresolved taxan=%d/%d",undefined,data.getReads().size());

            data.getStatus().setPercentage( 100.0 );
            data.getStatus().setCode( Status::StatusCode::SUCCESS );

            LOG_DEBUG("Submitting..");
            LOG_DEBUG("serializing classified reads..");
            json::value classified = io::Objectifier::objectFrom( data );
            const RemoteAddress address = data.getResultsRoute();
            _transmitJSON( address , classified );
            LOG_DEBUG("[DONE] serializing classified reads [job:%d] .." , _jobCounter.load());
            _jobCounter++;
            LOG_DEBUG("[DONE] Submiting job:%d..",_jobCounter.load());
        });
    });

    try{
        task.wait();
    } catch(std::exception &e){
        LOG_DEBUG("%s",e.what());
    }
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
            LOG_DEBUG("%s" , USTR( v.serialize()));
        } catch(const http_exception &e){
            LOG_DEBUG("%s", e.what());
        }
    });
    try{
        task.wait();
    } catch(std::exception &e){
        LOG_DEBUG("%s",e.what());
    }
}


}
}


