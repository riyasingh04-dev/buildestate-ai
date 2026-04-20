from typing import Optional, Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")
U = TypeVar("U")

class RunnableSerializable(BaseModel, Generic[T, U]):
    pass

class Chain(RunnableSerializable[dict[str, Any], dict[str, Any]]):
    x: Optional[dict[str, Any]]

try:
    print(Chain.model_fields)
except Exception as e:
    import traceback
    traceback.print_exc()
