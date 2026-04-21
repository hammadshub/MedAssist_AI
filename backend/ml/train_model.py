"""
MedAssist AI - ML Model Training Script (Real Data Pipeline)

Reads the preprocessed clean `dataset.csv` and `symptom_columns.json`, 
trains a Random Forest classifier, evaluates it, and exports model.pkl.

Usage:
    python ml/train_model.py
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Seed for reproducibility 
np.random.seed(42)

# Directory of this script 
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def train_and_export():
    print("=" * 60)
    print("  MedAssist AI - Model Training (Real Data)")
    print("=" * 60)

    dataset_path = os.path.join(SCRIPT_DIR, "dataset.csv")
    columns_path = os.path.join(SCRIPT_DIR, "symptom_columns.json")
    
    if not os.path.exists(dataset_path) or not os.path.exists(columns_path):
        print("❌ Error: Missing preprocessed data!")
        print("Please run `python preprocess_data.py` first.")
        return

    # 1. Load dataset & columns
    print("\n[1/4] Loading pre-processed dataset...")
    df = pd.read_csv(dataset_path)
    
    with open(columns_path, "r") as f:
        SYMPTOM_COLUMNS = json.load(f)
        
    print(f"  -> Loaded {len(df)} samples")
    print(f"  -> Diagnosing {len(df['disease'].unique())} unique diseases")

    # 2. Prepare features & labels
    print("\n[2/4] Preparing features...")
    X = df[SYMPTOM_COLUMNS].values
    y = df["disease"].values

    # 3. Split
    print("\n[3/4] Splitting train/test (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4. Train
    print("\n[4/4] Training Random Forest classifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # 5. Evaluate
    print("\n[5/5] Evaluating model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n  > Test Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
    
    classification = classification_report(y_test, y_pred, zero_division=0)
    # the classification report is very long for 41 diseases, print first chunk of lines
    lines = classification.split('\n')
    print("\n  Classification Report (Snippet):")
    print("\n".join(lines[:15]))
    print("  ... (truncated)")

    # Export
    model_path = os.path.join(SCRIPT_DIR, "model.pkl")
    joblib.dump(model, model_path)

    print(f"\n  -> Model saved to {model_path}")
    print("\n" + "=" * 60)
    print("  Training complete! MedAssist AI is upgraded.")
    print("=" * 60)

if __name__ == "__main__":
    train_and_export()
