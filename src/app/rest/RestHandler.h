#ifndef RESTHANDLER_H
#define RESTHANDLER_H

#include "cpprest/http_listener.h"
#include "cpprest/http_msg.h"

#include "stdafx.h"

#include "Logger.h"
#include "helpers.hpp"

using namespace web;
using namespace http;
using namespace utility;
using namespace http::experimental::listener;

class RestHandler
{
protected:
    enum class Method {
        GET,
        PUT,
        POST,
        DELETE
    };
    using HandlerType = std::function<void(http_request)>;


public:
    RestHandler(utility::string_t url);
    ~RestHandler();
    void start();
    pplx::task<void> open() { return _listener.open(); }
    pplx::task<void> close() { return _listener.close(); }
protected:
    virtual void _addRoutes();
    void _addRoute( Method method , const std::string path , HandlerType handler );
private:
    RestHandler();
    void _route(Method method, http_request message) const;
    void _addRootRoutes();
    static std::string _normalizedPath(const http_request &message);
    static std::string _normalizedPath(const std::string &url);
    static std::string _normalizedPath(const std::vector<std::string> &paths);
    void _handleError(pplx::task<void> &t) const;
    void _handleGet(http_request message) const;
    void _handlePost(http_request message) const;
    void _handleDelete(http_request message) const;
    void _handlePut(http_request message) const;


    std::map< Method , std::map< std::string , HandlerType >> _routings;
    experimental::listener::http_listener _listener;
};

#endif // RESTHANDLER_H
