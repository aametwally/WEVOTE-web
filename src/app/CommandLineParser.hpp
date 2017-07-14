#ifndef COMMANDLINEPARSER_H
#define COMMANDLINEPARSER_H

#include <memory>
#include <QCommandLineParser>

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
        _parser.reset( new QCommandLineParser());
        _parser->setApplicationDescription( helpDescription );
        _parser->addHelpOption();
        _parser->setSingleDashWordOptionMode(
                        QCommandLineParser::ParseAsLongOptions );
        auto qOptions = QList::fromStdList( options );
        _parser->addOptions( qOptions );
    }

    void process()
    {
        _parser->process( _app );
    }

    template< typename ExtractFunction ,  typename ParsingResults >
    void tokenize( ExtractFunction extractFunction , ParsingResults &results ) const
    {
        extractFunction( *_parser , results );
    }

protected:
    const QCoreApplication &_app ;
    std::unique_ptr< QCommandLineParser > _parser ;

};

#endif // COMMANDLINEPARSER_H
