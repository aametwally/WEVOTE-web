#ifndef WEVOTERESTHANDLER_H
#define WEVOTERESTHANDLER_H

#include "RestHandler.h"
#include "WevoteRestMessages.hpp"
#include "cpprest/json.h"
#include "cpprest/http_client.h"

namespace wevote
{
namespace rest
{
class WevoteRestHandler : public RestHandler
{
    Q_OBJECT
public:
    WEVOTE_DLL explicit WevoteRestHandler( utility::string_t url );
private:
    WevoteRestHandler();

Q_SIGNALS:
    void doneClassification_SIGNAL( WevoteSubmitEnsemble classified );

private:
Q_SLOT void doneClassification_SLOT( WevoteSubmitEnsemble classified );

protected:
    void _addRoutes() override;
private:
    void _submitWevoteEnsemble(http_request message);
};

}
}

#endif // WEVOTERESTHANDLER_H
