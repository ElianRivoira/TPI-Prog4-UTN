"""Registro de modelos.

Importar este módulo registra todas las tablas en SQLModel.metadata y deja cargadas todas las
clases, para que SQLAlchemy pueda resolver las relaciones declaradas entre módulos por nombre.
Lo importan main.py y el seed antes de crear las tablas.
"""

from app.modules.usuarios.models import Usuario

__all__ = ["Usuario"]
