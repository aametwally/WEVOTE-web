#include "WevoteScriptHandler.h"
#include "config.h"

namespace wevote
{
std::atomic_uint WevoteScriptHandler::_jobCounter{0};

struct WevoteScriptArguments
{
    WevoteScriptArguments(
            const std::string &queryFile ,
            const std::string &outPrefix ,
            unsigned int threads ,
            const std::vector< std::string > & /*algorithms*/ )
        : _queryFile( queryFile ) ,
          _outPrefix( outPrefix ) ,
          _threads( threads ) ,
          _algorithms( algorithms )
    {

    }

    std::string getCommandLineArguments() const
    {
        std::stringstream arguments;
        arguments << " --input " << _queryFile
                  << " --output " << _outPrefix
                  << " --threads " << std::to_string( _threads );

        std::for_each( _algorithms.cbegin() , _algorithms.cend() ,
                       [&arguments]( const std::string &algorithm ){
            std::string algorithmLowerCase = algorithm;
            std::transform(algorithmLowerCase.begin(), algorithmLowerCase.end(),
                           algorithmLowerCase.begin(), ::tolower);
            if( std::find( wevote::config::algorithms.cbegin() ,
                           wevote::config::algorithms.cend() ,
                           algorithmLowerCase ) != wevote::config::algorithms.cend())
                arguments << " --" + algorithmLowerCase;
        });
        return arguments.str();
    }

    bool validateArguments() const
    {
        return true;
    }

private:
    const std::string _queryFile;
    const std::string _outPrefix;
    const unsigned int _threads;
    const std::vector< std::string > _algorithms;
};

WevoteScriptHandler::WevoteScriptHandler()
= default;

std::vector< ReadInfo >
WevoteScriptHandler::execute( const std::vector< std::string > &sequences,
                              const std::vector< std::string > &algorithms ) const
{
    const std::string id = std::to_string( _getId());
    const std::string seperator = "/";
    const std::string executableDirectory =
            qApp->applicationDirPath().toStdString();
    const std::string pipelineScript =
            executableDirectory + seperator + WEVOTE_PIPELINE_SCRIPT_NAME;
    const std::string queryFile =
            executableDirectory + seperator +  id  + "_query.fa";
    const std::string outPrefix =
            executableDirectory + seperator +  id  + "_out";
    const std::string outputFile =
            outPrefix + seperator +  id  + "_out_ensemble.csv";
    const unsigned int threadsCount =
            (std::thread::hardware_concurrency() < 2 )?
                DEFAULT_THREADS_COUNT : std::thread::hardware_concurrency();
    LOG_INFO("Threads count=%d", threadsCount );

    io::flushStringToFile( io::join( sequences , "\n" ) , queryFile );

    WevoteScriptArguments arguments( queryFile , outPrefix , threadsCount , algorithms );
    const std::string cmd = pipelineScript + arguments.getCommandLineArguments();

    LOG_DEBUG("Executing:%s",cmd.c_str());
    if( arguments.validateArguments() && std::system( cmd.c_str()) == EXIT_SUCCESS )
    {
        QFile::remove( QString::fromStdString( queryFile ));
        const std::vector< std::string > unclassifiedReads = io::getFileLines( outputFile );
        auto reads = ReadInfo::parseUnclassifiedReads( unclassifiedReads.cbegin() , unclassifiedReads.cend());
        QFile::remove( QString::fromStdString( outputFile ));
        LOG_DEBUG("[DONE] Executing:%s", cmd.c_str());
        return std::move( reads.first );
    }
    else
    {
        QFile::remove( QString::fromStdString( queryFile ));
        LOG_DEBUG("Failure executing command:%s", cmd.c_str());
        return {};
    }
}

uint WevoteScriptHandler::_getId()
{
    return _jobCounter++;
}

}  // namespace wevote
