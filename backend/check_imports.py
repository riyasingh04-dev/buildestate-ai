import sys
print(f"Python version: {sys.version}")
print(f"Python path: {sys.path}")
try:
    import xgboost
    print(f"xgboost version: {xgboost.__version__}")
except ImportError as e:
    print(f"Failed to import xgboost: {e}")

try:
    import shap
    print(f"shap version: {shap.__version__}")
except ImportError as e:
    print(f"Failed to import shap: {e}")
