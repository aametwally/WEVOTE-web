#include "ReadInfo.h"

namespace wevote
{
//constexpr uint32_t ReadInfo::noAnnotation = NO_ANNOTATIOIN;

bool ReadInfo::isAnnotation( uint32_t taxid )
{
    return taxid != noAnnotation;
}

} // namespace wevote
