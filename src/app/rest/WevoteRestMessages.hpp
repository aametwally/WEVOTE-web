#ifndef WEVOTERESTMESSAGES_HPP
#define WEVOTERESTMESSAGES_HPP

#include <atomic>

#include <QMetaEnum>
#include "WevoteJSON.hpp"
#include "ReadInfo.h"
#include "Serializable.hpp"

class WevoteSubmitEnsembleStatus : public Serializable< WevoteSubmitEnsembleStatus >
{
protected:
    friend class Serializable< WevoteSubmitEnsembleStatus >;
public:
    enum class Status
    {
        NOT_STARTED = 0,
        IN_PROGRESS,
        SUCCESS ,
        FAILURE
    };

    WevoteSubmitEnsembleStatus( const WevoteSubmitEnsembleStatus &other )
    {
        setPercentage( other.getPercentage());
        setStatus( other.getStatus());
    }
    WevoteSubmitEnsembleStatus()
        : _status( Status::NOT_STARTED ), _percentage( 0 ) {}

    WevoteSubmitEnsembleStatus &operator=( const WevoteSubmitEnsembleStatus &other )
    {
        setPercentage( other.getPercentage());
        setStatus( other.getStatus());
        return *this;
    }

    void setStatus( Status status )
    {
        _status.store( status );
    }
    Status getStatus() const volatile
    {
        return _status.load();
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
        properties.objectify( meta( Meta::Status ) , static_cast< int >( getStatus()) );
        properties.objectify( meta( Meta::Percentage  ) , static_cast< float >( getPercentage()) );
    }
protected:
    enum class Meta
    {
        Status ,
        Percentage
    };

    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        auto meta = _meta< defs::char_t , Meta >;
        int s;
        float p;
        properties.deObjectify( meta( Meta::Status  ) , s );
        properties.deObjectify( meta( Meta::Percentage  ) , p );
        _status.store( static_cast< Status >( s ));
        _percentage.store( p );
    }

    static const std::map< Meta , std::string > &_metaMap()
    {
        static const std::map< Meta , std::string > m {
            { Meta::Status , "status" } ,
            { Meta::Percentage , "percentage" }
        };
        return m;
    }

private:
    std::atomic< Status > _status;
    std::atomic< float > _percentage;
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
        properties.objectify( meta( Meta::Status ) , _d->status );
        properties.objectify( meta( Meta::Reads ) , _d->reads.cbegin() , _d->reads.cend() );
        properties.objectify( meta( Meta::Score  ) , _d->score );
        properties.objectify( meta( Meta::Penalty  ) , _d->penalty );
        properties.objectify( meta( Meta::MinNumAgreed  ) , _d->minNumAgreed );
    }

private:
    enum class Meta
    {
        JobID ,
        Status ,
        Reads ,
        Score ,
        Penalty ,
        MinNumAgreed
    };

    struct Data
    {
        std::string jobID;
        WevoteSubmitEnsembleStatus status;
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
