# backend/app/db/base.py

"""
SQLAlchemy Base and metadata for declarative models.
This Base should be used for all ORM model definitions
and for Alembic autogeneration.
"""

from sqlalchemy.orm import declarative_base

# Declarative base class for ORM models
Base = declarative_base()

# Expose metadata for migrations and schema generation
metadata = Base.metadata

__all__ = ["Base", "metadata"]
