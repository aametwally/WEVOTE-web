#ifndef READINFO_H
#define READINFO_H

#include "Logger.h"
#include "helpers.hpp"
#include "Serializable.hpp"
#define NO_ANNOTATIOIN 0


namespace wevote
{
struct ReadInfo : public Serializable< ReadInfo >
{
protected:
    friend class Serializable< ReadInfo >;
public:
    enum class Meta {
        SeqId = 0 ,
        ResolvedTaxon ,
        Votes ,
        NumToolsAgreed ,
        NumToolsReported ,
        NumToolsUsed ,
        Score ,
        Offset
    };

    ReadInfo()
        : seqID(""),resolvedTaxon(0),
          numToolsAgreed(0),numToolsReported(0),
          numToolsUsed(0) , score(0)
    {}

    static std::string classifiedHeader( bool csv , const std::vector< std::string > &tools )
    {
        std::stringstream ss;
        const std::string delim = (csv)? "," : "\t";
        const auto &headerInOurder = _classifiedHeaderInOrder();
        std::vector< std::string > headerLayout;
        for( Meta m : headerInOurder )
        {
            if( m == Meta::Votes )
                headerLayout.insert( headerLayout.cend() , tools.cbegin() , tools.cend());
            else
                headerLayout.push_back( _meta( m ));
        }
        ss << io::join( headerLayout , delim ) << std::endl;
        return ss.str();
    }

    std::string toString( bool csv ) const
    {
        std::stringstream ss;
        const std::string delim = (csv)? "," : "\t";
        ss << seqID << delim
           << numToolsUsed << delim
           << numToolsReported << delim
           << numToolsAgreed<< delim
           << score << delim
           << io::join(
                  io::asStringsVector( annotation.cbegin() ,
                                       annotation.cend()) , delim) << delim
           << resolvedTaxon << "\n";
        return ss.str();
    }

    template< typename SeqIt >
    static std::string toString( SeqIt first , SeqIt last ,
                                    const std::vector< std::string > &tools ,
                                    bool csv )
    {
        std::stringstream ss;
        if( csv )
            ss << ReadInfo::classifiedHeader( csv , tools );
        std::for_each( first , last , [csv,&ss]( const ReadInfo &read ){
            ss << read.toString( csv );
        });
        return ss.str();
    }

    template< typename LineIt >
    static std::pair< std::vector< ReadInfo > ,  std::vector< std::string >>
    parseUnclassifiedReads( LineIt firstIt , LineIt lastIt , std::string delim = "," )
    {
        std::vector< ReadInfo > reads;
        std::vector< std::string > tools;
        if( isHeader(*firstIt , delim ))
        {
            tools = extractToolsFromUnclassifiedHeader( *firstIt , delim );
            std::advance( firstIt , 1 );
        }
        else
        {
            const auto tokens = io::split( *firstIt , delim );
            const int toolsCount = tokens.size() - 1;
            for( auto i = 0 ; i < toolsCount ; i++ )
                tools.push_back( "ALG" + io::toString<std::string>( i ));
        }

        std::for_each( firstIt , lastIt , [&reads,delim]( const std::string  &line){
            const std::vector< std::string  > tokens = io::split( line , delim );
            ReadInfo read;
            read.seqID = tokens.front();
            std::transform( tokens.begin()+1 , tokens.end() ,
                            std::inserter( read.annotation , read.annotation.end()) ,
                            []( const std::string &t )
            {
                return std::stoi( t );
            });
            reads.push_back( read );
        });
        return std::make_pair< std::vector< ReadInfo > , std::vector< std::string > >(
                    std::move( reads ) , std::move( tools  ));
    }

    template< typename LineIt >
    static std::pair< std::vector< ReadInfo > ,  std::vector< std::string >>
    parseClassifiedReads( LineIt firstIt , LineIt lastIt , std::string delim = "," )
    {
        const auto minFieldsCount = static_cast< size_t >( Meta::Offset );
        auto validateInput = [&]()
        {
            const auto tokens = io::split( *firstIt , delim );
            const size_t count = tokens.size();
            return count >= minFieldsCount &&
                    std::all_of( firstIt , lastIt ,
                                 [count,&delim]( const std::string &line )
            {
                const auto _ = io::split( line , delim );
                return _.size() == count;
            });
        };
        WEVOTE_ASSERT( validateInput() , "Inconsistent input file!");

        std::vector< std::string > tools;

        // Skip header.
        if( isHeader(*firstIt , delim ))
        {
            tools = extractToolsFromClassifiedHeader( *firstIt , delim );
            std::advance( firstIt , 1 );
        }
        else
        {
            const auto tokens = io::split( *firstIt , delim );
            const auto toolsCount = tokens.size() - static_cast< std::size_t >( Meta::Offset ) + 1;
            for( auto i = 0 ; i < toolsCount ; i++ )
                tools.push_back( "ALG"  + io::toString< std::string >( i ));
        }

        std::vector< ReadInfo > classifiedReads;
        std::for_each( firstIt , lastIt ,
                       [&classifiedReads,&delim]( const std::string &line )
        {
            const std::vector< std::string > tokens =  io::split( line , delim );
            auto tokensIt = tokens.begin();
            ReadInfo classifiedRead;
            classifiedRead.seqID = *tokensIt++;
            classifiedRead.numToolsUsed = std::stoi( *(tokensIt++));
            classifiedRead.numToolsReported = std::stoi( *(tokensIt++));
            classifiedRead.numToolsAgreed = std::stoi( *(tokensIt++));
            classifiedRead.score = std::stod( *(tokensIt++));
            std::vector< std::string > annotations(tokensIt , std::prev( tokens.end()));
            std::transform( annotations.cbegin() , annotations.cend() ,
                            std::inserter( classifiedRead.annotation ,
                                           classifiedRead.annotation.end()),
                            []( const std::string &annStr ){
                return std::stoi( annStr );
            });
            classifiedRead.resolvedTaxon = std::stoi( tokens.back());
            classifiedReads.push_back( classifiedRead );
        });
        return std::make_pair< std::vector< ReadInfo > , std::vector< std::string > >(
                    std::move( classifiedReads ) , std::move( tools  ));
    }

    static bool isHeader( const std::string &line , std::string delim )
    {
        const auto tokens = io::split( line , delim );
        return tokens.front() == _meta( Meta::SeqId );
    }

    static std::vector< std::string >
    extractToolsFromUnclassifiedHeader( const std::string &header , std::string delim = ",")
    {
        const auto tokens = io::split( header , delim );
        return std::vector< std::string >( tokens.cbegin() + 1 ,
                                              tokens.cend());
    }

    static std::vector< std::string >
    extractToolsFromClassifiedHeader( const std::string &header , std::string delim = ",")
    {
        const auto tokens = io::split( header , delim );
        const auto headerSize = tokens.size();
        const auto toolsOffset = static_cast< std::size_t >( Meta::Votes );
        const auto toolsCount = headerSize - static_cast< std::size_t >( Meta::Offset ) + 1;
        return std::vector< std::string >( tokens.cbegin() + toolsOffset ,
                                              tokens.cbegin() + toolsOffset + toolsCount );
    }


    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        auto meta = _meta< defs::char_t , Meta >;
        properties.objectify( meta( Meta::SeqId ) , seqID );
        properties.objectify( meta( Meta::NumToolsUsed ) , numToolsUsed );
        properties.objectify( meta( Meta::NumToolsReported  ) , numToolsReported );
        properties.objectify( meta( Meta::NumToolsAgreed  ) , numToolsAgreed );
        properties.objectify( meta( Meta::Score  ) , score );
        properties.objectify( meta( Meta::Votes  ) , annotation.cbegin() , annotation.cend());
        properties.objectify( meta( Meta::ResolvedTaxon  ) , resolvedTaxon );
    }

    std::string seqID;
    std::vector<uint32_t> annotation;
    uint32_t resolvedTaxon;
    uint32_t numToolsAgreed;
    uint32_t numToolsReported;
    uint32_t numToolsUsed;
    double score;
    WEVOTE_DLL static bool isAnnotation( uint32_t taxid );
    WEVOTE_DLL static constexpr uint32_t noAnnotation = NO_ANNOTATIOIN;

protected:
    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        auto meta = _meta< defs::char_t , Meta >;
        properties.deObjectify( meta( Meta::SeqId ) , seqID );
        properties.deObjectify( meta( Meta::NumToolsUsed ) , numToolsUsed );
        properties.deObjectify( meta( Meta::NumToolsReported  ) , numToolsReported );
        properties.deObjectify( meta( Meta::NumToolsAgreed  ) , numToolsAgreed );
        properties.deObjectify( meta( Meta::Score  ) , score );
        properties.deObjectifyArray( meta( Meta::Votes  ) , annotation );
        properties.deObjectify( meta( Meta::ResolvedTaxon  ) , resolvedTaxon );
    }

    static const std::map< Meta , std::string> &_metaMap()
    {
        static const std::map< Meta , std::string > mmap
        {
            { Meta::NumToolsAgreed , "numToolsAgreed" } ,
            { Meta::NumToolsReported , "numToolsReported" } ,
            { Meta::NumToolsUsed , "numToolsUsed" } ,
            { Meta::ResolvedTaxon , "resolvedTaxon" } ,
            { Meta::Score , "score" } ,
            { Meta::SeqId , "seqId" } ,
            { Meta::Votes , "votes" }
        };
        return mmap;
    }

    template< std::size_t size = static_cast< size_t >( Meta::Offset ) >
    static constexpr std::array< Meta , size > _classifiedHeaderInOrder()
    {
        return
        {
            Meta::SeqId , Meta::NumToolsUsed , Meta::NumToolsReported , Meta::NumToolsAgreed ,
                    Meta::Score , Meta::Votes , Meta::ResolvedTaxon
        };
    }

    template< std::size_t size = 2 >
    static constexpr std::array< Meta , size > _unClassifiedHeaderInOrder()
    {
        constexpr std::array< Meta , size > h
        {
            Meta::SeqId , Meta::Votes
        };
        return h;
    }


};

}
#endif // READINFO_H
