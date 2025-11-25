"""
Script para recriar o preprocessor que expande 48 features RIASEC em 398 features.
Importa FeatureExpander do modulo app.main para evitar erros de pickle.
"""
import sys
import joblib
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import numpy as np

# Importa FeatureExpander do modulo app (garante que a classe esteja disponivel)
from app.main import FeatureExpander

# Cria as colunas RIASEC
riasec_columns = []
for letter in ['R', 'I', 'A', 'S', 'E', 'C']:
    for num in range(1, 9):
        riasec_columns.append(f'{letter}{num}')

print(f"Colunas RIASEC: {len(riasec_columns)} features")

# Cria um DataFrame dummy para fit
dummy_data = pd.DataFrame(
    np.random.randn(100, 48),
    columns=riasec_columns
)

# Cria o pipeline
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('expander', FeatureExpander())
])

# Fit e testa
pipeline.fit(dummy_data)
transformed = pipeline.transform(dummy_data)

print(f"Shape apos transformacao: {transformed.shape}")
print(f"Features esperadas: 398, recebidas: {transformed.shape[1]}")

if transformed.shape[1] == 398:
    print("\nOtimo! Salvando preprocessor...")
    joblib.dump(pipeline, "app/assets/preprocessor_riasec_lean.joblib")
    print("Preprocessor salvo com sucesso!")
else:
    print(f"\nATENCAO: Shape = {transformed.shape[1]} (esperado 398)")


    # Se for diferente, voce pode precisar de outra transformacao
