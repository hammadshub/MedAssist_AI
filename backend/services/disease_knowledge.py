"""
Extensive Medical Knowledge Base for all 41 Kaggle dataset diseases.
Used to fall back to highly accurate, specific Lab Tests and Specialists 
when the database leaves these fields blank.
"""

KNOWLEDGE_BASE = {
    "(vertigo) Paroymsal  Positional Vertigo": {"lab_tests": "Dix-Hallpike maneuver, Electronystagmography (ENG), MRI of the head to rule out other causes.", "specialist": "Otolaryngologist (ENT) / Neurologist"},
    "AIDS": {"lab_tests": "HIV antibody test, P24 antigen test, CD4+ T-cell count, HIV viral load.", "specialist": "Infectious Disease Specialist"},
    "Acne": {"lab_tests": "Usually diagnosed clinically. Hormone level tests (Testosterone, DHEAS) if hormonal imbalance suspected.", "specialist": "Dermatologist"},
    "Alcoholic hepatitis": {"lab_tests": "Liver function tests (ALT, AST, Bilirubin), CBC, Ultrasound of the liver, Liver biopsy.", "specialist": "Hepatologist / Gastroenterologist"},
    "Allergy": {"lab_tests": "Skin Prick Test, IgE blood test (RAST), Patch testing.", "specialist": "Allergist / Immunologist"},
    "Arthritis": {"lab_tests": "Rheumatoid Factor (RF), Anti-CCP, ESR, CRP, Joint X-rays.", "specialist": "Rheumatologist / Orthopedist"},
    "Bronchial Asthma": {"lab_tests": "Spirometry, Peak Flow Measurement, Allergy testing, Methacholine challenge.", "specialist": "Pulmonologist / Allergist"},
    "Cervical spondylosis": {"lab_tests": "Neck X-ray, MRI of the cervical spine, CT myelogram, Electromyography (EMG).", "specialist": "Orthopedic Surgeon / Neurologist"},
    "Chicken pox": {"lab_tests": "Usually diagnosed clinically. PCR for Varicella-Zoster Virus (VZV), Tzanck smear.", "specialist": "General Physician / Pediatrician"},
    "Chronic cholestasis": {"lab_tests": "Alkaline Phosphatase (ALP), Bilirubin, Ultrasound of the biliary tract, MRCP.", "specialist": "Hepatologist / Gastroenterologist"},
    "Common Cold": {"lab_tests": "Diagnosed clinically. Throat swab/PCR if flu or COVID-19 needs to be ruled out.", "specialist": "General Physician"},
    "Dengue": {"lab_tests": "Dengue NS1 Antigen, Dengue IgM/IgG Antibodies, CBC (monitoring platelets).", "specialist": "Infectious Disease Specialist / General Physician"},
    "Diabetes": {"lab_tests": "Fasting blood glucose, HbA1c, Oral glucose tolerance test.", "specialist": "Endocrinologist"},
    "Dimorphic hemmorhoids(piles)": {"lab_tests": "Visual inspection, Digital rectal exam, Anoscopy, Sigmoidoscopy.", "specialist": "Proctologist / Gastroenterologist"},
    "Drug Reaction": {"lab_tests": "Skin biopsy, Patch testing, IgE and Eosinophil counts.", "specialist": "Allergist / Dermatologist"},
    "Fungal infection": {"lab_tests": "KOH prep/smear, Fungal culture, Wood's lamp examination.", "specialist": "Dermatologist"},
    "GERD": {"lab_tests": "Upper GI endoscopy, Esophageal pH monitoring, Barium swallow.", "specialist": "Gastroenterologist"},
    "Gastroenteritis": {"lab_tests": "Stool culture, CBC, Electrolyte panel.", "specialist": "Gastroenterologist / General Physician"},
    "Heart attack": {"lab_tests": "ECG/EKG, Cardiac enzymes (Troponin), Coronary angiography.", "specialist": "Cardiologist"},
    "Hepatitis B": {"lab_tests": "HBsAg, Anti-HBc, Anti-HBs, HBV DNA viral load, Liver function tests.", "specialist": "Hepatologist / Infectious Disease Specialist"},
    "Hepatitis C": {"lab_tests": "Anti-HCV antibodies, HCV RNA viral load, Genotype testing, Liver function tests.", "specialist": "Hepatologist / Infectious Disease Specialist"},
    "Hepatitis D": {"lab_tests": "Anti-HDV antibodies, HDV RNA, concurrent testing for Hepatitis B.", "specialist": "Hepatologist"},
    "Hepatitis E": {"lab_tests": "Anti-HEV IgM and IgG antibodies, HEV RNA test, LFTs.", "specialist": "Hepatologist"},
    "Hypertension": {"lab_tests": "Serial blood pressure monitoring, Lipid panel, Renal function (Creatinine, BUN), ECG.", "specialist": "Cardiologist / Internal Medicine"},
    "Hyperthyroidism": {"lab_tests": "TSH, Free T4, Free T3, Radioactive iodine uptake, Thyroid scan.", "specialist": "Endocrinologist"},
    "Hypoglycemia": {"lab_tests": "Fasting blood glucose, C-peptide, Insulin levels.", "specialist": "Endocrinologist"},
    "Hypothyroidism": {"lab_tests": "TSH, Free T4, Thyroid autoantibodies (Anti-TPO).", "specialist": "Endocrinologist"},
    "Impetigo": {"lab_tests": "Diagnosed clinically. Bacterial culture of the sores if resistant to treatment.", "specialist": "Dermatologist / Pediatrician"},
    "Jaundice": {"lab_tests": "Total and direct Bilirubin, Liver Function Tests (LFTs), CBC, Abdominal Ultrasound.", "specialist": "Hepatologist / Gastroenterologist"},
    "Malaria": {"lab_tests": "Peripheral blood smear (thick and thin), Rapid Diagnostic Tests (RDTs), PCR.", "specialist": "Infectious Disease Specialist"},
    "Migraine": {"lab_tests": "Diagnosed clinically. MRI or CT scan to rule out other neurological issues.", "specialist": "Neurologist"},
    "Osteoarthristis": {"lab_tests": "Joint X-ray, MRI, Joint fluid analysis (to rule out gout/infection).", "specialist": "Rheumatologist / Orthopedist"},
    "Paralysis (brain hemorrhage)": {"lab_tests": "Head CT scan, MRI of the brain, CT Angiography.", "specialist": "Neurologist / Neurosurgeon"},
    "Peptic ulcer diseae": {"lab_tests": "H. pylori test (breath/stool), Upper endoscopy, CBC.", "specialist": "Gastroenterologist"},
    "Pneumonia": {"lab_tests": "Chest X-ray, Sputum culture, CBC, Pulse oximetry.", "specialist": "Pulmonologist"},
    "Psoriasis": {"lab_tests": "Diagnosed clinically. Skin biopsy in atypical cases.", "specialist": "Dermatologist"},
    "Tuberculosis": {"lab_tests": "Chest X-ray, Sputum AFB smear and culture, GeneXpert MTB/RIF, Tuberculin Skin Test (PPD).", "specialist": "Pulmonologist / Infectious Disease Specialist"},
    "Typhoid": {"lab_tests": "Blood culture, Widal test, TyphiDot, Stool and urine culture.", "specialist": "General Physician / Infectious Disease Specialist"},
    "Urinary tract infection": {"lab_tests": "Urinalysis, Urine culture and sensitivity.", "specialist": "Urologist / General Physician"},
    "Varicose veins": {"lab_tests": "Venous Doppler ultrasound of the legs.", "specialist": "Vascular Surgeon / Phlebologist"},
    "hepatitis A": {"lab_tests": "Anti-HAV IgM antibodies, Liver function tests (Elevated ALT/AST).", "specialist": "Hepatologist / General Physician"}
}
