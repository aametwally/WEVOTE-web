#ifndef WEVOTERESTMESSAGES_HPP
#define WEVOTERESTMESSAGES_HPP

#include <atomic>

#include <QMetaEnum>

#include "WevoteJSON.hpp"
#include "ReadInfo.h"
#include "Serializable.hpp"

class Status : public Serializable< Status >
{
    Q_GADGET
protected:
    friend class Serializable< Status >;
public:

    enum class StatusCode
    {
        NOT_STARTED = 0,
        IN_PROGRESS,
        SUCCESS ,
        FAILURE
    };

    Q_ENUM( StatusCode )

    Status( const Status &other )
    {
        setPercentage( other.getPercentage());
        setCode( other.getCode());
    }
    Status()
        : _code( StatusCode::NOT_STARTED ), _percentage( 0 ) {}

    Status &operator=( const Status &other )
    {
        setPercentage( other.getPercentage());
        setCode( other.getCode());
        return *this;
    }

    void setCode( StatusCode status )
    {
        _code.store( status );
        _message = _metaEnum().valueToKey( static_cast< int >( status ));
    }

    StatusCode getCode() const volatile
    {
        return _code.load();
    }

    const std::string &getMessage() const
    {
        return _message;
    }

    void setPercentage( float percentage )
    {
        _percentage.store( percentage );
    }
    float getPercentage() const volatile
    {
        return _percentage.load();
    }

    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        auto meta = _meta< defs::char_t , Meta >;
        const int code = _metaEnum().value( static_cast< int >( getCode()));
        const std::string message( _metaEnum().valueToKey( code ));
        properties.objectify( meta( Meta::StatusCode ) , code );
        properties.objectify( meta( Meta::StatusMessage ) , message );
        properties.objectify( meta( Meta::Percentage  ) , static_cast< float >( getPercentage()) );
    }
protected:
    enum class Meta
    {
        StatusCode ,
        StatusMessage,
        Percentage
    };

    static const QMetaEnum &_metaEnum()
    {
        static auto meta = QMetaEnum::fromType<StatusCode>();
        return meta;
    }

    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        auto meta = _meta< defs::char_t , Meta >;
        int code = 0;
        float percentage;
        properties.deObjectify( meta( Meta::StatusCode  ) , code );
        properties.deObjectify( meta( Meta::Percentage  ) , percentage );
        setCode( static_cast< StatusCode >( code ));
        setPercentage( percentage );
    }

    static const std::map< Meta , std::string > &_metaMap()
    {
        static const std::map< Meta , std::string > m {
            { Meta::StatusCode , "code" } ,
            { Meta::StatusMessage , "message" },
            { Meta::Percentage , "percentage" }
        };
        return m;
    }

private:
    std::atomic< StatusCode > _code;
    std::atomic< float > _percentage;
    std::string _message;
};

class RemoteAddress : public Serializable<RemoteAddress>
{
private:
    friend class Serializable< RemoteAddress > ;
public:
    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        auto meta = _meta< defs::char_t , Meta >;
        properties.objectify( meta( Meta::HostAddress ) , _hostAddress );
        properties.objectify( meta( Meta::PortNumber ) , _portNumber );
        properties.objectify( meta( Meta::RelativePath ) , _relativePath );
    }

    const std::string &getHost() const
    {
        return _hostAddress;
    }
    int getPort() const
    {
        return _portNumber;
    }
    const std::string &getRelativePath() const
    {
        return _relativePath;
    }
private:
    enum class Meta
    {
        HostAddress,
        PortNumber,
        RelativePath
    };

    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        auto meta = _meta< defs::char_t , Meta >;
        properties.deObjectify( meta( Meta::HostAddress ) , _hostAddress );
        properties.deObjectify( meta( Meta::PortNumber ) , _portNumber );
        properties.deObjectify( meta( Meta::RelativePath ) , _relativePath );
    }

    static const std::map< Meta , std::string > &_metaMap()
    {
        static const std::map< Meta , std::string > m {
            { Meta::HostAddress , "host" } ,
            { Meta::PortNumber , "port" } ,
            { Meta::RelativePath , "relativePath" }
        };
        return m;
    }
private:
    std::string _hostAddress;
    int _portNumber;
    std::string _relativePath;
};

class WevoteSubmitEnsemble : public Serializable< WevoteSubmitEnsemble >
{
protected:
    friend class Serializable< WevoteSubmitEnsemble >;
public:
    WevoteSubmitEnsemble()
        : _d( new Data ){}

    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        auto meta = _meta< defs::char_t , Meta >;
        properties.objectify( meta( Meta::JobID ) , _d->jobID );
        properties.objectify( meta( Meta::ResultsRoute) , _d->resultsRoute );
        properties.objectify( meta( Meta::Status ) , _d->status );
        properties.objectify( meta( Meta::Reads ) , _d->reads.cbegin() , _d->reads.cend() );
        properties.objectify( meta( Meta::Score  ) , _d->score );
        properties.objectify( meta( Meta::Penalty  ) , _d->penalty );
        properties.objectify( meta( Meta::MinNumAgreed  ) , _d->minNumAgreed );
    }

    const RemoteAddress &getResultsRoute() const
    {
        return _d->resultsRoute;
    }

    std::vector< wevote::ReadInfo > &getReads()
    {
        return _d->reads;
    }

    Status &getStatus()
    {
        return _d->status;
    }

    double getScore() const
    {
        return _d->score;
    }

    double getPenalty() const
    {
        return _d->penalty;
    }

    double getMinNumAgreed() const
    {
        return _d->minNumAgreed;
    }
private:
    enum class Meta
    {
        JobID ,
        ResultsRoute,
        Status ,
        Reads ,
        Score ,
        Penalty ,
        MinNumAgreed
    };

    struct Data
    {
        std::string jobID;
        RemoteAddress resultsRoute;
        Status status;
        std::vector< wevote::ReadInfo > reads;
        double score;
        double penalty;
        double minNumAgreed;
    };

    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        auto meta = _meta< defs::char_t , Meta >;
        properties.deObjectify( meta( Meta::JobID ) , _d->jobID );
        properties.deObjectify( meta( Meta::ResultsRoute) , _d->resultsRoute );
        properties.deObjectify( meta( Meta::Status ) , _d->status );
        properties.deObjectifyArray( meta( Meta::Reads ) , _d->reads );
        properties.deObjectify( meta( Meta::Score  ) , _d->score );
        properties.deObjectify( meta( Meta::Penalty  ) , _d->penalty );
        properties.deObjectify( meta( Meta::MinNumAgreed  ) , _d->minNumAgreed );
    }

    static const std::map< Meta , std::string > &_metaMap()
    {
        static const std::map< Meta , std::string > m {
            { Meta::JobID , "jobID" } ,
            { Meta::ResultsRoute , "resultsRoute"},
            { Meta::Status , "status" } ,
            { Meta::Reads , "reads" } ,
            { Meta::Score , "score" } ,
            { Meta::Penalty , "penalty" } ,
            { Meta::MinNumAgreed , "minNumAgreed"}
        };
        return m;
    }

    std::shared_ptr< Data > _d;
};


#endif // WEVOTERESTMESSAGES_HPP
