#ifndef WEVOTERESTHANDLER_H
#define WEVOTERESTHANDLER_H

#include "RestHandler.h"
#include "WevoteRestMessages.hpp"
#include "cpprest/json.h"

namespace wevote
{
namespace rest
{
class WevoteRestHandler : public RestHandler
{
public:
    WEVOTE_DLL explicit WevoteRestHandler( utility::string_t url );
protected:
    void _addRoutes() override;
private:
    void _submitWevoteEnsemble(http_request message);
};

}
}

#endif // WEVOTERESTHANDLER_H
