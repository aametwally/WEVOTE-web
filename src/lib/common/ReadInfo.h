#ifndef READINFO_H
#define READINFO_H

#include "headers.hpp"
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
        : seqID(U("")),resolvedTaxon(0),
          numToolsAgreed(0),numToolsReported(0),
          numToolsUsed(0) , score(0)
    {}

    static defs::string_t classifiedHeader( bool csv , const std::vector< defs::string_t > &tools )
    {
        defs::stringstream_t ss;
        const defs::string_t delim = (csv)? U(",") : U("\t");
        const auto &headerInOurder = _classifiedHeaderInOrder();
        std::vector< defs::string_t > headerLayout;
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

    defs::string_t toString( bool csv ) const
    {
        defs::stringstream_t ss;
        const defs::string_t delim = (csv)? U(",") : U("\t");
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
    static defs::string_t toString( SeqIt first , SeqIt last ,
                                    const std::vector< defs::string_t > &tools ,
                                    bool csv )
    {
        defs::stringstream_t ss;
        if( csv )
            ss << ReadInfo::classifiedHeader( csv , tools );
        std::for_each( first , last , [csv,&ss]( const ReadInfo &read ){
            ss << read.toString( csv );
        });
        return ss.str();
    }

    template< typename LineIt >
    static std::pair< std::vector< ReadInfo > ,  std::vector< defs::string_t >>
    parseUnclassifiedReads( LineIt firstIt , LineIt lastIt , defs::string_t delim = U(",") )
    {
        std::vector< ReadInfo > reads;
        std::vector< defs::string_t > tools;
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
                tools.push_back(U("ALG") + io::toString( i ));
        }

        std::for_each( firstIt , lastIt , [&reads,delim]( const defs::string_t  &line){
            const std::vector< defs::string_t  > tokens = io::split( line , delim );
            ReadInfo read;
            read.seqID = tokens.front();
            std::transform( tokens.begin()+1 , tokens.end() ,
                            std::inserter( read.annotation , read.annotation.end()) ,
                            []( const defs::string_t &t )
            {
                return std::stoi( t );
            });
            reads.push_back( read );
        });
        return std::make_pair< std::vector< ReadInfo > , std::vector< defs::string_t > >(
                    std::move( reads ) , std::move( tools  ));
    }

    template< typename LineIt >
    static std::pair< std::vector< ReadInfo > ,  std::vector< defs::string_t >>
    parseClassifiedReads( LineIt firstIt , LineIt lastIt , defs::string_t delim = U(",") )
    {
        const auto minFieldsCount = static_cast< size_t >( Meta::Offset );
        auto validateInput = [&]()
        {
            const auto tokens = io::split( *firstIt , delim );
            const size_t count = tokens.size();
            return count >= minFieldsCount &&
                    std::all_of( firstIt , lastIt ,
                                 [count,&delim]( const defs::string_t &line )
            {
                const auto _ = io::split( line , delim );
                return _.size() == count;
            });
        };
        WEVOTE_ASSERT( validateInput() , "Inconsistent input file!");

        std::vector< defs::string_t > tools;

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
                tools.push_back(U("ALG") + io::toString< defs::string_t >( i ));
        }

        std::vector< ReadInfo > classifiedReads;
        std::for_each( firstIt , lastIt ,
                       [&classifiedReads,&delim]( const defs::string_t &line )
        {
            const std::vector< defs::string_t > tokens =  io::split( line , delim );
            auto tokensIt = tokens.begin();
            ReadInfo classifiedRead;
            classifiedRead.seqID = *tokensIt++;
            classifiedRead.numToolsUsed = std::stoi( *(tokensIt++));
            classifiedRead.numToolsReported = std::stoi( *(tokensIt++));
            classifiedRead.numToolsAgreed = std::stoi( *(tokensIt++));
            classifiedRead.score = std::stod( *(tokensIt++));
            std::vector< defs::string_t > annotations(tokensIt , std::prev( tokens.end()));
            std::transform( annotations.cbegin() , annotations.cend() ,
                            std::inserter( classifiedRead.annotation ,
                                           classifiedRead.annotation.end()),
                            []( const defs::string_t &annStr ){
                return std::stoi( annStr );
            });
            classifiedRead.resolvedTaxon = std::stoi( tokens.back());
            classifiedReads.push_back( classifiedRead );
        });
        return std::make_pair< std::vector< ReadInfo > , std::vector< defs::string_t > >(
                    std::move( classifiedReads ) , std::move( tools  ));
    }

    static bool isHeader( const defs::string_t &line , defs::string_t delim )
    {
        const auto tokens = io::split( line , delim );
        return tokens.front() == _meta( Meta::SeqId );
    }

    static std::vector< defs::string_t >
    extractToolsFromUnclassifiedHeader( const defs::string_t &header , defs::string_t delim = U(","))
    {
        const auto tokens = io::split( header , delim );
        return std::vector< defs::string_t >( tokens.cbegin() + 1 ,
                                              tokens.cend());
    }

    static std::vector< defs::string_t >
    extractToolsFromClassifiedHeader( const defs::string_t &header , defs::string_t delim = U(","))
    {
        const auto tokens = io::split( header , delim );
        const auto headerSize = tokens.size();
        const auto toolsOffset = static_cast< std::size_t >( Meta::Votes );
        const auto toolsCount = headerSize - static_cast< std::size_t >( Meta::Offset ) + 1;
        return std::vector< defs::string_t >( tokens.cbegin() + toolsOffset ,
                                              tokens.cbegin() + toolsOffset + toolsCount );
    }


    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        properties.objectify( _meta( Meta::SeqId ) , seqID );
        properties.objectify( _meta( Meta::NumToolsUsed ) , numToolsUsed );
        properties.objectify( _meta( Meta::NumToolsReported  ) , numToolsReported );
        properties.objectify( _meta( Meta::NumToolsAgreed  ) , numToolsAgreed );
        properties.objectify( _meta( Meta::Score  ) , score );
        properties.objectify( _meta( Meta::Votes  ) , annotation.cbegin() , annotation.cend());
        properties.objectify( _meta( Meta::ResolvedTaxon  ) , resolvedTaxon );
    }

    defs::string_t seqID;
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
        properties.deObjectify( _meta( Meta::SeqId ) , seqID );
        properties.deObjectify( _meta( Meta::NumToolsUsed ) , numToolsUsed );
        properties.deObjectify( _meta( Meta::NumToolsReported  ) , numToolsReported );
        properties.deObjectify( _meta( Meta::NumToolsAgreed  ) , numToolsAgreed );
        properties.deObjectify( _meta( Meta::Score  ) , score );
        properties.deObjectifyArray( _meta( Meta::Votes  ) , annotation );
        properties.deObjectify( _meta( Meta::ResolvedTaxon  ) , resolvedTaxon );
    }

    static const std::map< Meta , defs::string_t> &_metaMap()
    {
        static const std::map< Meta , defs::string_t > mmap
        {
            { Meta::NumToolsAgreed , U("numToolsAgreed") } ,
            { Meta::NumToolsReported , U("numToolsReported") } ,
            { Meta::NumToolsUsed , U("numToolsUsed") } ,
            { Meta::ResolvedTaxon , U("resolvedTaxon") } ,
            { Meta::Score , U("score") } ,
            { Meta::SeqId , U("seqId") } ,
            { Meta::Votes , U("votes") }
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
