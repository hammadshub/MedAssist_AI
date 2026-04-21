import os
import json
import pandas as pd
import numpy as np

# Set directories
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DATA_PATH = os.path.join(SCRIPT_DIR, "kaggle_data", "dataset.csv")
CLEAN_DATA_PATH = os.path.join(SCRIPT_DIR, "dataset.csv")
COLUMNS_PATH = os.path.join(SCRIPT_DIR, "symptom_columns.json")

def process():
    print("=" * 60)
    print("  MedAssist AI - Kaggle Data Preprocessor")
    print("=" * 60)
    
    if not os.path.exists(RAW_DATA_PATH):
        print(f"❌ Error: Cannot find raw data at {RAW_DATA_PATH}")
        return
        
    print("[1/4] Loading raw Kaggle dataset...")
    df = pd.read_csv(RAW_DATA_PATH)
    
    # 1. Get all symptom columns (Symptom_1, Symptom_2, etc.)
    symptom_cols = [col for col in df.columns if str(col).startswith('Symptom')]
    
    # 2. Extract unique symptoms across the entire dataset
    print("[2/4] Extracting unique symptoms...")
    all_symptoms = []
    for col in symptom_cols:
        for val in df[col].dropna().unique():
            # Clean text: lowercase, remove leading/trailing spaces, replace internal spaces with underscores
            clean_sym = str(val).strip().lower().replace(" ", "_")
            if clean_sym and clean_sym != 'nan':
                all_symptoms.append(clean_sym)
                
    unique_symptoms = sorted(list(set(all_symptoms)))
    print(f"  -> Found {len(unique_symptoms)} unique symptoms.")
    
    # 3. Create the binary (one-hot encoded) dataset
    print("[3/4] Transforming records into binary format (1s and 0s)...")
    clean_data = []
    
    for index, row in df.iterrows():
        disease = str(row['Disease']).strip()
        
        # Initialize all symptoms to 0
        patient_record = {sym: 0 for sym in unique_symptoms}
        
        # Populate patient's actual symptoms with 1
        for col in symptom_cols:
            val = row[col]
            if pd.notna(val):
                clean_sym = str(val).strip().lower().replace(" ", "_")
                if clean_sym in patient_record:
                    patient_record[clean_sym] = 1
                    
        # Add the disease label at the end
        patient_record['disease'] = disease
        clean_data.append(patient_record)
        
    final_df = pd.DataFrame(clean_data)
    
    # 4. Save to outputs
    print("[4/4] Saving output files...")
    final_df.to_csv(CLEAN_DATA_PATH, index=False)
    
    with open(COLUMNS_PATH, "w") as f:
        json.dump(unique_symptoms, f, indent=2)
        
    print(f"  > Preprocessing Complete!")
    print(f"  -> Dataset shape: {final_df.shape[0]} patients, {final_df.shape[1]} columns")
    print(f"  -> Saved to {CLEAN_DATA_PATH}")
    print("=" * 60)

if __name__ == "__main__":
    process()
