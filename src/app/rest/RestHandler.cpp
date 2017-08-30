#include "RestHandler.h"

RestHandler::RestHandler()
{
    //ctor
}
RestHandler::RestHandler(utility::string_t url):_listener(url)
{
    LOG_DEBUG("Constructing ..");
    _listener.support(methods::GET, std::bind(&RestHandler::_handleGet, this, std::placeholders::_1));
    _listener.support(methods::PUT, std::bind(&RestHandler::_handlePut, this, std::placeholders::_1));
    _listener.support(methods::POST, std::bind(&RestHandler::_handlePost, this, std::placeholders::_1));
    _listener.support(methods::DEL, std::bind(&RestHandler::_handleDelete, this, std::placeholders::_1));
    _addRootRoutes();
}

RestHandler::~RestHandler()
{
    //dtor
    close().wait();
}

void RestHandler::start()
{
    _addRoutes();
    open().wait();
}

void RestHandler::_addRoutes()
{
}

void RestHandler::_addRoute(
        RestHandler::Method method,
        const std::string path,
        RestHandler::HandlerType handler)
{
    _routings[ method ][ _normalizedPath(path) ] = handler;
}


void RestHandler::_route(
        Method method,
        http_request message ) const
{
    try
    {
        LOG_DEBUG("Routing:%s", _normalizedPath( message ).c_str());
        _routings.at( method ).at( _normalizedPath( message ))( message );
    }
    catch(...)
    {
        const auto url = http::uri::decode(message.relative_uri().path());
        LOG_WARNING("Path not supported yet:[%s]!",url.c_str());
    }
}

void RestHandler::_addRootRoutes()
{
    const std::string root = _normalizedPath( std::vector< std::string >());
    HandlerType rootHandler = []( http_request )
    {
        LOG_DEBUG("Default Handler.");
        return;
    };

    _routings[ Method::GET    ][ root ] = rootHandler;
    _routings[ Method::PUT    ][ root ] = rootHandler;
    _routings[ Method::POST   ][ root ] = rootHandler;
    _routings[ Method::DELETE ][ root ] = rootHandler;
}

std::string RestHandler::_normalizedPath(const http_request &message)
{
    auto paths = http::uri::split_path(http::uri::decode(message.relative_uri().path()));
    return _normalizedPath( paths );
}

std::string RestHandler::_normalizedPath(const std::string &url)
{
    auto paths = http::uri::split_path(url);
    return _normalizedPath( paths );
}

std::string RestHandler::_normalizedPath(const std::vector<std::string> &paths)
{
    return wevote::io::join( paths , "|" );
}

void RestHandler::_handleError(pplx::task<void>& t) const
{
    try
    {
        t.get();
    }
    catch(...)
    {
        // Ignore the error, Log it if a logger is available
    }
}


//
// Get Request
//
void RestHandler::_handleGet(http_request message) const
{
    LOG_DEBUG("Handling GET Request..");

    _route( Method::GET , message );

    std::cout <<  message.to_string() << std::endl;

    auto paths = http::uri::split_path(http::uri::decode(message.relative_uri().path()));

    message.relative_uri().path();
    //Dbms* d  = new Dbms();
    //d->connect();

    concurrency::streams::fstream::open_istream(U("static/index.html"), std::ios::in).then([=](concurrency::streams::istream is)
    {
        message.reply(status_codes::OK, is,  U("text/html"))
                .then([](pplx::task<void> t)
        {
            try{
                t.get();
            }
            catch(...){
                //
            }
        });
    }).then([=](pplx::task<void>t)
    {
        try{
            t.get();
        }
        catch(...){
            message.reply(status_codes::InternalError,U("INTERNAL ERROR "));
        }
    });


    LOG_DEBUG("[DONE] Handling GET Request..");

    return ;

}

//
// A POST request
//
void RestHandler::_handlePost(http_request message) const
{
    LOG_DEBUG("Handling POST Request..");

    _route( Method::POST , message );

    auto paths = uri::split_path(uri::decode(message.relative_uri().path()));

    LOG_DEBUG("Normalized Path:%s",wevote::io::join( paths , "|").c_str());

    std::cout <<  message.to_string() << std::endl;

    message.reply(status_codes::OK,message.to_string());

    LOG_DEBUG("[DONE] Handling POST Request..");

    return ;
}

//
// A DELETE request
//
void RestHandler::_handleDelete(http_request message) const
{
    LOG_DEBUG("Handling DELETE Request..");

    _route( Method::DELETE , message );
    std::cout <<  message.to_string() << std::endl;

    std::string rep = U("WRITE YOUR OWN DELETE OPERATION");
    message.reply(status_codes::OK,rep);

    LOG_DEBUG("[DONE] Handling DELETE Request..");

    return ;
}


//
// A PUT request
//
void RestHandler::_handlePut(http_request message) const
{
    LOG_DEBUG("Handling PUT Request..");

    _route( Method::PUT , message );
    std::cout <<  message.to_string() << std::endl;
    std::string rep = U("WRITE YOUR OWN PUT OPERATION");
    message.reply(status_codes::OK,rep);

    LOG_DEBUG("[DONE] Handling PUT Request..");

    return ;
}
