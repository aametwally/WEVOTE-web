#ifndef RESTHANDLER_H
#define RESTHANDLER_H

#include <QObject>

#include "cpprest/http_listener.h"
#include "cpprest/http_msg.h"
#include "cpprest/http_client.h"

#include "stdafx.h"

#include "Logger.h"
#include "helpers.hpp"
#include "WevoteRestMessages.hpp"

using namespace web;
using namespace http;
using namespace utility;
using namespace http::experimental::listener;

class RestHandler : public QObject
{
    Q_OBJECT
protected:
    enum class Method {
        GET,
        PUT,
        POST,
        DEL
    };
    using HandlerType = std::function<void(http_request)>;


public:
    WEVOTE_DLL RestHandler( const http::uri &uri);
    WEVOTE_DLL ~RestHandler();
    WEVOTE_DLL void start();
    pplx::task<void> open() { return _listener.open(); }
    pplx::task<void> close() { return _listener.close(); }
    WEVOTE_DLL static http::uri asURI( const RemoteAddress &address );
    WEVOTE_DLL static http::uri asURI( const std::string hostname ,
                                       int port ,
                                       const std::string relativePath );
    WEVOTE_DLL void addClient(const http::uri &uri);
    WEVOTE_DLL void addClient(const RemoteAddress &address);
protected:
    virtual void _addRoutes();
    void _addRoute(Method method , const string_t path , HandlerType handler );
    http::client::http_client &_getClient( const RemoteAddress &address );
private:
    RestHandler();
    void _route(Method method, http_request message) const;
    void _addRootRoutes();
    static utility::string_t _normalizedPath(const http_request &message);
    static utility::string_t _normalizedPath(const string_t &url);
    static utility::string_t _normalizedPath(const std::vector<string_t> &paths);
    void _handleError(pplx::task<void> &t) const;
    void _handleGet(http_request message) const;
    void _handlePost(http_request message) const;
    void _handleDelete(http_request message) const;
    void _handlePut(http_request message) const;


    std::map< Method , std::map< utility::string_t , HandlerType >> _routings;
    std::map< http::uri , http::client::http_client > _clients;
    experimental::listener::http_listener _listener;
};

#endif // RESTHANDLER_H
