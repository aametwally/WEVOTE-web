#ifndef COMMANDLINEPARSER_H
#define COMMANDLINEPARSER_H

#include <memory>
#include <QCommandLineParser>

template< typename Parameters >
struct ParsingResults
{
    CommandLineParser::CommandLineResult success;
    std::string errorMessage;
    Parameters parameters;
    ParsingResults()
        : success( CommandLineParser::CommandLineResult::CommandLineOk ),
          errorMessage("")
    {}
};

class CommandLineParser
{

public:

    enum class CommandLineResult
    {
        CommandLineOk ,
        CommandLineError
    };

    CommandLineParser( const QCoreApplication &app ,
                       const std::list< QCommandLineOption > &options ,
                       std::string helpDescription )
        : _app( app )
    {
        _parser.setApplicationDescription( helpDescription );
        _parser.addHelpOption();
        _parser.setSingleDashWordOptionMode(
                        QCommandLineParser::ParseAsLongOptions );
        auto qOptions = QList::fromStdList( options );
        _parser.addOptions( qOptions );
    }

    void process()
    {
        _parser.process( _app );
    }

    template< typename ExtractFunction ,  typename ParsingResults_T >
    void tokenize( ExtractFunction extractFunction , ParsingResults_T &results ) const
    {
        extractFunction( _parser , results );
    }

protected:
    const QCoreApplication &_app ;
    QCommandLineParser _parser ;

};

#endif // COMMANDLINEPARSER_H
