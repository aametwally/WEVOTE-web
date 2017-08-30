#ifndef READINFO_H
#define READINFO_H

#include "headers.hpp"
#include "helpers.hpp"

#define NO_ANNOTATIOIN 0


namespace wevote
{
struct ReadInfo{

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
        : seqID({""}),resolvedTaxon(0),
          numToolsAgreed(0),numToolsReported(0),
          numToolsUsed(0) , score(0)
    {}

    static std::string header( bool csv , const std::vector<std::string> &tools )
    {
        std::stringstream ss;
        const std::string delim = (csv)? "," : "\t";
        ss << _meta( Meta::SeqId ) << delim
           << _meta( Meta::NumToolsUsed ) << delim
           << _meta( Meta::NumToolsReported ) << delim
           << _meta( Meta::NumToolsAgreed ) << delim
           << _meta( Meta::Score ) << delim
           << io::join( tools , delim ) << delim
           << _meta( Meta::ResolvedTaxon ) << "\n";
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
    static std::string toString( SeqIt first , SeqIt last , bool csv )
    {
        std::vector< std::string > tools;
        for( auto i = 0 ; i < first->numToolsUsed ; i++ )
            tools.push_back( std::string("tool#") + std::to_string(i));

        std::stringstream ss;
        if( csv )
            ss << ReadInfo::header( csv , tools );
        std::for_each( first , last , [csv,&ss]( const ReadInfo &read ){
            ss << read.toString( csv );
        });
        return ss.str();
    }

    template< typename LineIt >
    static std::vector< ReadInfo > parseUnclassifiedReads( LineIt firstIt , LineIt lastIt , std::string delim = "," )
    {
        std::vector< ReadInfo > reads;
        if( isHeader(*firstIt , delim ))
            std::advance( firstIt , 1 );

        std::for_each( firstIt , lastIt , [&reads,delim]( const std::string &line){
            const std::vector< std::string > tokens = io::split( line , delim );
            ReadInfo read;
            read.seqID = tokens.front();
            std::transform( tokens.begin()+1 , tokens.end() ,
                            std::inserter( read.annotation , read.annotation.end()) ,
                            []( const std::string &t )
            {
                return atoi( t.c_str());
            });
            reads.push_back( read );
        });
        return reads;
    }

    template< typename LineIt >
    static std::vector< ReadInfo > parseClassifiedReads( LineIt firstIt , LineIt lastIt , std::string delim = ',' )
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

        // Skip header.
        if( isHeader( *firstIt , delim ))
            std::advance( firstIt , 1 );
        std::vector< ReadInfo > classifiedReads;
        std::for_each( firstIt , lastIt ,
                       [&classifiedReads,&delim]( const std::string &line )
        {
            const std::vector< std::string > tokens =  io::split( line , delim );
            auto tokensIt = tokens.begin();
            ReadInfo classifiedRead;
            classifiedRead.seqID = *tokensIt++;
            classifiedRead.numToolsUsed = atoi( (tokensIt++)->c_str());
            classifiedRead.numToolsReported = atoi( (tokensIt++)->c_str());
            classifiedRead.numToolsAgreed = atoi( (tokensIt++)->c_str());
            classifiedRead.score = atof( (tokensIt++)->c_str());
            std::vector< std::string > annotations(tokensIt , std::prev( tokens.end()));
            std::transform( annotations.cbegin() , annotations.cend() ,
                            std::inserter( classifiedRead.annotation ,
                                           classifiedRead.annotation.end()),
                            []( const std::string &annStr ){
                return atoi( annStr.c_str());
            });
            classifiedRead.resolvedTaxon = atoi( tokens.back().c_str());
            classifiedReads.push_back( classifiedRead );
        });
        return classifiedReads;
    }

    static bool isHeader( const std::string &line , std::string delim )
    {
        const auto tokens = io::split( line , delim );
        return tokens.front() == _meta( Meta::SeqId );
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

    template< typename DeObjectifier >
    static ReadInfo fromObject( const DeObjectifier &properties )
    {
        ReadInfo ri;
        ri._populateFromObject( properties );
        return ri;
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

private:


    static std::string _meta( Meta m )
    {
        return _metaMap().at( m );
    }

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

    static const std::map< Meta , std::string > &_metaMap()
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

};

}
#endif // READINFO_H
