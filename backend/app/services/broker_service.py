##Takes property scores → calculates broker performance → assigns rank (Elite/Good/Average)
from sqlalchemy.orm import Session#Used for database sessions(Used to interact with database (query, update, commit))
from sqlalchemy import func#Used for aggregate functions like avg, count, etc.
from app.models.user import User#Used to interact with users (brokers) in the database
from app.models.property import Property#Used to interact with properties in the database

class BrokerService:#This service contains methods to calculate broker scores and ranks based on the performance of their listed properties. It includes methods to update broker ranks and retrieve brokers by rank.

    @staticmethod
    def update_broker_ranks(db: Session):
        # We only care about users with the 'builder' role (brokers)
        brokers = db.query(User).filter(User.role == "builder").all()#fetch all users with role 'builder' (brokers) from the database

        for broker in brokers:#process one broker at a time to calculate their score and rank
            # Get all approved properties for this broker
            #Only properties belonging to this broker,Only approved properties
            properties = db.query(Property).filter(
                Property.builder_id == broker.id,
                Property.admin_status == "approved"
            ).all()
#If broker has no listings:Score = 0,Rank = "New", continue → skip rest and go to next broker
            if not properties:
                broker.broker_score = 0.0
                broker.broker_rank = "New"
                continue

            # Calculate average score
            total_score = sum([p.property_score for p in properties])#Sum of all property scores for this broker (total performance of their listings)
            avg_score = total_score / len(properties)#Average score across all their properties (overall quality of their listings)
            
            broker.broker_score = round(avg_score, 1)#Update broker's average score (rounded to 1 decimal place for cleaner display)

            # Ranking logic
            if avg_score >= 9.0:
                broker.broker_rank = "Elite"
            elif avg_score >= 7.0:
                broker.broker_rank = "Good"
            else:
                broker.broker_rank = "Average"

        db.commit()

    @staticmethod
    def get_brokers_by_rank(db: Session, rank: str = None):#This method retrieves brokers from the database, optionally filtering by a specific rank (Elite, Good, Average). It returns a list of brokers ordered by their broker_score in descending order (highest score first).
        query = db.query(User).filter(User.role == "builder")#Start with all users who are builders (brokers)
        if rank:
            query = query.filter(User.broker_rank == rank)
        return query.order_by(User.broker_score.desc()).all()
