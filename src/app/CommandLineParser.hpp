#ifndef COMMANDLINEPARSER_H
#define COMMANDLINEPARSER_H

#include <memory>
#include <QCommandLineParser>

enum class CommandLineResult
{
    CommandLineOk ,
    CommandLineError
};

template< typename Parameters >
struct ParsingResults
{
    CommandLineResult success;
    std::string errorMessage;
    Parameters parameters;
    ParsingResults()
        : success( CommandLineResult::CommandLineOk ),
          errorMessage("")
    {}
};


class CommandLineParser
{
public:
    CommandLineParser( const QCoreApplication &app ,
                       const std::list< QCommandLineOption > &options ,
                       std::string helpDescription )
        : _app( app )
    {
        _parser.setApplicationDescription( QString::fromStdString( helpDescription ));
        _parser.addHelpOption();
        _parser.setSingleDashWordOptionMode(
                        QCommandLineParser::ParseAsLongOptions );
        auto qOptions = QList< QCommandLineOption >::fromStdList( options );
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
