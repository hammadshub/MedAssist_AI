-- =====================================================
-- MedAssist AI – Seed Data
-- Run AFTER schema.sql to populate diseases, symptoms,
-- disease-symptom mappings, red-flag rules, and
-- recommendations.
-- =====================================================

USE medassist_db;


-- ═════════════════════════════════════════════════════
-- DISEASES (15)
-- ═════════════════════════════════════════════════════

INSERT INTO diseases (name, category, description) VALUES
('Gastritis',                       'Gastrointestinal',        'Inflammation of the stomach lining causing pain, nausea, and indigestion.'),
('Peptic Ulcer Disease',            'Gastrointestinal',        'Open sores on the inner lining of the stomach or upper small intestine.'),
('Irritable Bowel Syndrome (IBS)',  'Gastrointestinal',        'Chronic condition affecting the large intestine with cramping, bloating, and altered bowel habits.'),
('Gastroenteritis',                 'Gastrointestinal',        'Inflammation of the stomach and intestines, often caused by infection.'),
('Food Poisoning',                  'Gastrointestinal',        'Illness caused by consuming contaminated food or beverages.'),
('Acid Reflux (GERD)',              'Gastrointestinal',        'Chronic acid reflux where stomach acid flows back into the esophagus.'),
('Chronic Constipation',            'Gastrointestinal',        'Persistent difficulty in passing stool or infrequent bowel movements.'),
('Coronary Artery Disease',         'Cardiovascular',          'Narrowing of coronary arteries reducing blood flow to the heart.'),
('Hypertension',                    'Cardiovascular',          'Persistently elevated blood pressure increasing cardiovascular risk.'),
('Angina',                          'Cardiovascular',          'Chest pain caused by reduced blood flow to the heart muscle.'),
('Influenza',                       'Infectious',              'Viral respiratory infection causing fever, body aches, and fatigue.'),
('Pneumonia',                       'Infectious',              'Lung infection causing inflammation and fluid in the air sacs.'),
('Type 2 Diabetes',                 'Metabolic',               'Metabolic disorder with impaired insulin utilization leading to high blood sugar.'),
('Migraine',                        'Neurological',            'Severe recurring headaches often accompanied by sensory disturbances.'),
('Generalized Anxiety Disorder',    'Neurological/Psychological', 'Persistent excessive worry and anxiety affecting daily functioning.');


-- ═════════════════════════════════════════════════════
-- SYMPTOMS (~45 canonical symptoms)
-- ═════════════════════════════════════════════════════

INSERT INTO symptoms (name, aliases) VALUES
('abdominal_pain',        'stomach pain, belly pain, tummy pain, stomach ache, abdominal cramp'),
('nausea',                'feeling nauseous, feel sick, queasy'),
('vomiting',              'throwing up, puking, vomit'),
('bloating',              'bloated, gas, flatulence'),
('diarrhea',              'loose stool, loose motion, watery stool, runny stool'),
('constipation',          'hard stool, difficulty passing stool, infrequent bowel movement'),
('heartburn',             'acid reflux, burning chest, regurgitation, chest burning'),
('loss_of_appetite',      'no appetite, not hungry, poor appetite'),
('weight_loss',           'losing weight, unintentional weight loss'),
('blood_in_stool',        'bloody stool, rectal bleeding'),
('black_stool',           'tarry stool, dark stool'),
('vomiting_blood',        'blood vomit'),
('rigid_abdomen',         'abdominal rigidity, hard abdomen'),
('dehydration',           'severe dehydration, dry mouth'),
('indigestion',           'upset stomach'),
('difficulty_swallowing', 'trouble swallowing'),
('chest_pain',            'pain in chest'),
('chest_tightness',       'tight chest, pressure in chest'),
('sweating',              'cold sweat, excessive sweating'),
('shortness_of_breath',   'breathlessness, difficulty breathing, hard to breathe'),
('palpitations',          'heart racing, rapid heartbeat, irregular heartbeat'),
('high_blood_pressure',   'elevated blood pressure, hypertension'),
('dizziness',             'dizzy, lightheaded'),
('fainting',              'faint, passed out, loss of consciousness'),
('pain_left_arm',         'left arm pain, pain radiating to left arm'),
('jaw_pain',              'pain in jaw, pain radiating to jaw'),
('cough',                 'dry cough, persistent cough'),
('productive_cough',      'coughing mucus, cough with phlegm'),
('fever',                 'temperature'),
('high_fever',            'very high temperature'),
('chills',                ''),
('body_ache',             'body pain, muscle pain, muscle ache'),
('sore_throat',           'throat pain'),
('runny_nose',            'nasal congestion, stuffy nose'),
('sneezing',              ''),
('fatigue',               'tired, tiredness, exhaustion, weakness'),
('rapid_breathing',       'fast breathing'),
('cyanosis',              'bluish lips, blue lips, bluish fingertips'),
('frequent_urination',    'urinating frequently'),
('excessive_thirst',      'always thirsty, increased thirst'),
('blurred_vision',        'blurry vision'),
('slow_healing',          'wounds not healing'),
('numbness_tingling',     'numbness, tingling, pins and needles'),
('increased_hunger',      'always hungry'),
('fruity_breath',         'fruity smelling breath'),
('confusion',             'confused, disoriented'),
('headache',              'head pain'),
('severe_headache',       'worst headache, throbbing headache, migraine'),
('light_sensitivity',     'sensitivity to light, photophobia'),
('sound_sensitivity',     'sensitivity to sound'),
('aura',                  'visual aura'),
('anxiety',               'feeling anxious, nervousness, worry, excessive worry'),
('restlessness',          'restless'),
('irritability',          'irritable'),
('sleep_disturbance',     'insomnia, trouble sleeping'),
('difficulty_concentrating', 'poor concentration'),
('muscle_tension',        'tense muscles'),
('panic',                 'panic attack'),
('vision_loss',           '');


-- ═════════════════════════════════════════════════════
-- DISEASE ↔ SYMPTOM MAPPINGS
-- ═════════════════════════════════════════════════════

-- Helper: map disease name + symptom name to IDs
-- We use subqueries for clarity

-- Gastritis
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Gastritis'), (SELECT id FROM symptoms WHERE name='abdominal_pain'), 1.0),
((SELECT id FROM diseases WHERE name='Gastritis'), (SELECT id FROM symptoms WHERE name='nausea'), 0.9),
((SELECT id FROM diseases WHERE name='Gastritis'), (SELECT id FROM symptoms WHERE name='vomiting'), 0.7),
((SELECT id FROM diseases WHERE name='Gastritis'), (SELECT id FROM symptoms WHERE name='bloating'), 0.8),
((SELECT id FROM diseases WHERE name='Gastritis'), (SELECT id FROM symptoms WHERE name='loss_of_appetite'), 0.7),
((SELECT id FROM diseases WHERE name='Gastritis'), (SELECT id FROM symptoms WHERE name='indigestion'), 0.9),
((SELECT id FROM diseases WHERE name='Gastritis'), (SELECT id FROM symptoms WHERE name='heartburn'), 0.6);

-- Peptic Ulcer Disease
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'), (SELECT id FROM symptoms WHERE name='abdominal_pain'), 1.0),
((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'), (SELECT id FROM symptoms WHERE name='nausea'), 0.8),
((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'), (SELECT id FROM symptoms WHERE name='vomiting'), 0.6),
((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'), (SELECT id FROM symptoms WHERE name='bloating'), 0.7),
((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'), (SELECT id FROM symptoms WHERE name='heartburn'), 0.8),
((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'), (SELECT id FROM symptoms WHERE name='loss_of_appetite'), 0.6),
((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'), (SELECT id FROM symptoms WHERE name='weight_loss'), 0.5),
((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'), (SELECT id FROM symptoms WHERE name='blood_in_stool'), 0.4),
((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'), (SELECT id FROM symptoms WHERE name='black_stool'), 0.4);

-- Irritable Bowel Syndrome (IBS)
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Irritable Bowel Syndrome (IBS)'), (SELECT id FROM symptoms WHERE name='abdominal_pain'), 1.0),
((SELECT id FROM diseases WHERE name='Irritable Bowel Syndrome (IBS)'), (SELECT id FROM symptoms WHERE name='bloating'), 0.9),
((SELECT id FROM diseases WHERE name='Irritable Bowel Syndrome (IBS)'), (SELECT id FROM symptoms WHERE name='diarrhea'), 0.8),
((SELECT id FROM diseases WHERE name='Irritable Bowel Syndrome (IBS)'), (SELECT id FROM symptoms WHERE name='constipation'), 0.7),
((SELECT id FROM diseases WHERE name='Irritable Bowel Syndrome (IBS)'), (SELECT id FROM symptoms WHERE name='nausea'), 0.5),
((SELECT id FROM diseases WHERE name='Irritable Bowel Syndrome (IBS)'), (SELECT id FROM symptoms WHERE name='fatigue'), 0.5);

-- Gastroenteritis
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Gastroenteritis'), (SELECT id FROM symptoms WHERE name='diarrhea'), 1.0),
((SELECT id FROM diseases WHERE name='Gastroenteritis'), (SELECT id FROM symptoms WHERE name='vomiting'), 0.9),
((SELECT id FROM diseases WHERE name='Gastroenteritis'), (SELECT id FROM symptoms WHERE name='nausea'), 0.9),
((SELECT id FROM diseases WHERE name='Gastroenteritis'), (SELECT id FROM symptoms WHERE name='abdominal_pain'), 0.8),
((SELECT id FROM diseases WHERE name='Gastroenteritis'), (SELECT id FROM symptoms WHERE name='fever'), 0.7),
((SELECT id FROM diseases WHERE name='Gastroenteritis'), (SELECT id FROM symptoms WHERE name='dehydration'), 0.6),
((SELECT id FROM diseases WHERE name='Gastroenteritis'), (SELECT id FROM symptoms WHERE name='body_ache'), 0.5);

-- Food Poisoning
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Food Poisoning'), (SELECT id FROM symptoms WHERE name='vomiting'), 1.0),
((SELECT id FROM diseases WHERE name='Food Poisoning'), (SELECT id FROM symptoms WHERE name='diarrhea'), 0.9),
((SELECT id FROM diseases WHERE name='Food Poisoning'), (SELECT id FROM symptoms WHERE name='nausea'), 0.9),
((SELECT id FROM diseases WHERE name='Food Poisoning'), (SELECT id FROM symptoms WHERE name='abdominal_pain'), 0.8),
((SELECT id FROM diseases WHERE name='Food Poisoning'), (SELECT id FROM symptoms WHERE name='fever'), 0.6),
((SELECT id FROM diseases WHERE name='Food Poisoning'), (SELECT id FROM symptoms WHERE name='dehydration'), 0.7),
((SELECT id FROM diseases WHERE name='Food Poisoning'), (SELECT id FROM symptoms WHERE name='fatigue'), 0.5);

-- Acid Reflux (GERD)
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Acid Reflux (GERD)'), (SELECT id FROM symptoms WHERE name='heartburn'), 1.0),
((SELECT id FROM diseases WHERE name='Acid Reflux (GERD)'), (SELECT id FROM symptoms WHERE name='chest_pain'), 0.7),
((SELECT id FROM diseases WHERE name='Acid Reflux (GERD)'), (SELECT id FROM symptoms WHERE name='nausea'), 0.6),
((SELECT id FROM diseases WHERE name='Acid Reflux (GERD)'), (SELECT id FROM symptoms WHERE name='difficulty_swallowing'), 0.7),
((SELECT id FROM diseases WHERE name='Acid Reflux (GERD)'), (SELECT id FROM symptoms WHERE name='bloating'), 0.5),
((SELECT id FROM diseases WHERE name='Acid Reflux (GERD)'), (SELECT id FROM symptoms WHERE name='cough'), 0.4);

-- Chronic Constipation
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Chronic Constipation'), (SELECT id FROM symptoms WHERE name='constipation'), 1.0),
((SELECT id FROM diseases WHERE name='Chronic Constipation'), (SELECT id FROM symptoms WHERE name='abdominal_pain'), 0.7),
((SELECT id FROM diseases WHERE name='Chronic Constipation'), (SELECT id FROM symptoms WHERE name='bloating'), 0.8),
((SELECT id FROM diseases WHERE name='Chronic Constipation'), (SELECT id FROM symptoms WHERE name='nausea'), 0.4),
((SELECT id FROM diseases WHERE name='Chronic Constipation'), (SELECT id FROM symptoms WHERE name='loss_of_appetite'), 0.5);

-- Coronary Artery Disease
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Coronary Artery Disease'), (SELECT id FROM symptoms WHERE name='chest_pain'), 1.0),
((SELECT id FROM diseases WHERE name='Coronary Artery Disease'), (SELECT id FROM symptoms WHERE name='shortness_of_breath'), 0.9),
((SELECT id FROM diseases WHERE name='Coronary Artery Disease'), (SELECT id FROM symptoms WHERE name='sweating'), 0.7),
((SELECT id FROM diseases WHERE name='Coronary Artery Disease'), (SELECT id FROM symptoms WHERE name='nausea'), 0.5),
((SELECT id FROM diseases WHERE name='Coronary Artery Disease'), (SELECT id FROM symptoms WHERE name='fatigue'), 0.6),
((SELECT id FROM diseases WHERE name='Coronary Artery Disease'), (SELECT id FROM symptoms WHERE name='dizziness'), 0.6),
((SELECT id FROM diseases WHERE name='Coronary Artery Disease'), (SELECT id FROM symptoms WHERE name='pain_left_arm'), 0.8),
((SELECT id FROM diseases WHERE name='Coronary Artery Disease'), (SELECT id FROM symptoms WHERE name='jaw_pain'), 0.6);

-- Hypertension
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Hypertension'), (SELECT id FROM symptoms WHERE name='headache'), 0.7),
((SELECT id FROM diseases WHERE name='Hypertension'), (SELECT id FROM symptoms WHERE name='dizziness'), 0.8),
((SELECT id FROM diseases WHERE name='Hypertension'), (SELECT id FROM symptoms WHERE name='blurred_vision'), 0.6),
((SELECT id FROM diseases WHERE name='Hypertension'), (SELECT id FROM symptoms WHERE name='chest_pain'), 0.5),
((SELECT id FROM diseases WHERE name='Hypertension'), (SELECT id FROM symptoms WHERE name='shortness_of_breath'), 0.6),
((SELECT id FROM diseases WHERE name='Hypertension'), (SELECT id FROM symptoms WHERE name='fatigue'), 0.5),
((SELECT id FROM diseases WHERE name='Hypertension'), (SELECT id FROM symptoms WHERE name='high_blood_pressure'), 1.0);

-- Angina
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Angina'), (SELECT id FROM symptoms WHERE name='chest_pain'), 1.0),
((SELECT id FROM diseases WHERE name='Angina'), (SELECT id FROM symptoms WHERE name='chest_tightness'), 0.9),
((SELECT id FROM diseases WHERE name='Angina'), (SELECT id FROM symptoms WHERE name='shortness_of_breath'), 0.8),
((SELECT id FROM diseases WHERE name='Angina'), (SELECT id FROM symptoms WHERE name='sweating'), 0.6),
((SELECT id FROM diseases WHERE name='Angina'), (SELECT id FROM symptoms WHERE name='nausea'), 0.5),
((SELECT id FROM diseases WHERE name='Angina'), (SELECT id FROM symptoms WHERE name='dizziness'), 0.5),
((SELECT id FROM diseases WHERE name='Angina'), (SELECT id FROM symptoms WHERE name='fatigue'), 0.6),
((SELECT id FROM diseases WHERE name='Angina'), (SELECT id FROM symptoms WHERE name='pain_left_arm'), 0.7);

-- Influenza
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Influenza'), (SELECT id FROM symptoms WHERE name='fever'), 1.0),
((SELECT id FROM diseases WHERE name='Influenza'), (SELECT id FROM symptoms WHERE name='body_ache'), 0.9),
((SELECT id FROM diseases WHERE name='Influenza'), (SELECT id FROM symptoms WHERE name='fatigue'), 0.8),
((SELECT id FROM diseases WHERE name='Influenza'), (SELECT id FROM symptoms WHERE name='cough'), 0.8),
((SELECT id FROM diseases WHERE name='Influenza'), (SELECT id FROM symptoms WHERE name='sore_throat'), 0.7),
((SELECT id FROM diseases WHERE name='Influenza'), (SELECT id FROM symptoms WHERE name='runny_nose'), 0.7),
((SELECT id FROM diseases WHERE name='Influenza'), (SELECT id FROM symptoms WHERE name='headache'), 0.7),
((SELECT id FROM diseases WHERE name='Influenza'), (SELECT id FROM symptoms WHERE name='chills'), 0.8);

-- Pneumonia
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Pneumonia'), (SELECT id FROM symptoms WHERE name='cough'), 0.9),
((SELECT id FROM diseases WHERE name='Pneumonia'), (SELECT id FROM symptoms WHERE name='productive_cough'), 0.8),
((SELECT id FROM diseases WHERE name='Pneumonia'), (SELECT id FROM symptoms WHERE name='fever'), 0.9),
((SELECT id FROM diseases WHERE name='Pneumonia'), (SELECT id FROM symptoms WHERE name='high_fever'), 0.7),
((SELECT id FROM diseases WHERE name='Pneumonia'), (SELECT id FROM symptoms WHERE name='shortness_of_breath'), 0.9),
((SELECT id FROM diseases WHERE name='Pneumonia'), (SELECT id FROM symptoms WHERE name='chest_pain'), 0.7),
((SELECT id FROM diseases WHERE name='Pneumonia'), (SELECT id FROM symptoms WHERE name='fatigue'), 0.7),
((SELECT id FROM diseases WHERE name='Pneumonia'), (SELECT id FROM symptoms WHERE name='chills'), 0.6),
((SELECT id FROM diseases WHERE name='Pneumonia'), (SELECT id FROM symptoms WHERE name='rapid_breathing'), 0.6);

-- Type 2 Diabetes
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Type 2 Diabetes'), (SELECT id FROM symptoms WHERE name='frequent_urination'), 1.0),
((SELECT id FROM diseases WHERE name='Type 2 Diabetes'), (SELECT id FROM symptoms WHERE name='excessive_thirst'), 0.9),
((SELECT id FROM diseases WHERE name='Type 2 Diabetes'), (SELECT id FROM symptoms WHERE name='fatigue'), 0.8),
((SELECT id FROM diseases WHERE name='Type 2 Diabetes'), (SELECT id FROM symptoms WHERE name='blurred_vision'), 0.7),
((SELECT id FROM diseases WHERE name='Type 2 Diabetes'), (SELECT id FROM symptoms WHERE name='slow_healing'), 0.7),
((SELECT id FROM diseases WHERE name='Type 2 Diabetes'), (SELECT id FROM symptoms WHERE name='numbness_tingling'), 0.6),
((SELECT id FROM diseases WHERE name='Type 2 Diabetes'), (SELECT id FROM symptoms WHERE name='increased_hunger'), 0.7),
((SELECT id FROM diseases WHERE name='Type 2 Diabetes'), (SELECT id FROM symptoms WHERE name='weight_loss'), 0.5);

-- Migraine
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Migraine'), (SELECT id FROM symptoms WHERE name='severe_headache'), 1.0),
((SELECT id FROM diseases WHERE name='Migraine'), (SELECT id FROM symptoms WHERE name='headache'), 0.9),
((SELECT id FROM diseases WHERE name='Migraine'), (SELECT id FROM symptoms WHERE name='nausea'), 0.7),
((SELECT id FROM diseases WHERE name='Migraine'), (SELECT id FROM symptoms WHERE name='vomiting'), 0.5),
((SELECT id FROM diseases WHERE name='Migraine'), (SELECT id FROM symptoms WHERE name='light_sensitivity'), 0.9),
((SELECT id FROM diseases WHERE name='Migraine'), (SELECT id FROM symptoms WHERE name='sound_sensitivity'), 0.7),
((SELECT id FROM diseases WHERE name='Migraine'), (SELECT id FROM symptoms WHERE name='aura'), 0.6),
((SELECT id FROM diseases WHERE name='Migraine'), (SELECT id FROM symptoms WHERE name='dizziness'), 0.4);

-- Generalized Anxiety Disorder
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='anxiety'), 1.0),
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='restlessness'), 0.9),
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='fatigue'), 0.7),
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='muscle_tension'), 0.7),
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='sleep_disturbance'), 0.8),
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='irritability'), 0.7),
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='difficulty_concentrating'), 0.6),
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='palpitations'), 0.5),
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='sweating'), 0.4),
((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'), (SELECT id FROM symptoms WHERE name='panic'), 0.6);


-- ═════════════════════════════════════════════════════
-- RED-FLAG RULES (from ARCHITECTURE.md)
-- ═════════════════════════════════════════════════════

-- Cardiac red flags
INSERT INTO red_flag_rules (name, symptom_combo, category, risk_level, message) VALUES
('Cardiac emergency triad',
 '["chest_pain","sweating","nausea"]',
 'Cardiac', 'EMERGENCY',
 'HIGH RISK – Possible heart attack. Seek emergency care immediately.'),

('Cardiac radiating pain',
 '["chest_pain","pain_left_arm"]',
 'Cardiac', 'EMERGENCY',
 'HIGH RISK – Chest pain radiating to left arm. Seek emergency care immediately.'),

('Cardiac jaw radiation',
 '["chest_pain","jaw_pain"]',
 'Cardiac', 'EMERGENCY',
 'HIGH RISK – Chest pain radiating to jaw. Seek emergency care immediately.'),

('Acute respiratory-cardiac',
 '["shortness_of_breath","chest_tightness"]',
 'Cardiac', 'HIGH',
 'WARNING – Sudden shortness of breath with chest tightness. Seek medical evaluation urgently.');

-- GI red flags
INSERT INTO red_flag_rules (name, symptom_combo, category, risk_level, message) VALUES
('GI bleeding - stool',
 '["blood_in_stool"]',
 'Gastrointestinal', 'URGENT',
 'URGENT – Blood in stool detected. Seek immediate medical attention.'),

('GI bleeding - tarry stool',
 '["black_stool"]',
 'Gastrointestinal', 'URGENT',
 'URGENT – Black/tarry stool may indicate internal bleeding. Seek immediate medical attention.'),

('GI bleeding - vomiting blood',
 '["vomiting_blood"]',
 'Gastrointestinal', 'EMERGENCY',
 'EMERGENCY – Vomiting blood requires immediate emergency care.'),

('Acute abdomen',
 '["abdominal_pain","rigid_abdomen"]',
 'Gastrointestinal', 'EMERGENCY',
 'EMERGENCY – Severe abdominal pain with rigid abdomen. Seek emergency care immediately.'),

('Severe dehydration from vomiting',
 '["vomiting","dehydration"]',
 'Gastrointestinal', 'URGENT',
 'URGENT – Continuous vomiting with dehydration. Seek immediate medical attention.'),

('Fever with abdominal pain',
 '["high_fever","abdominal_pain"]',
 'Gastrointestinal', 'HIGH',
 'WARNING – High fever with abdominal pain. Medical consultation recommended urgently.');

-- Respiratory red flags
INSERT INTO red_flag_rules (name, symptom_combo, category, risk_level, message) VALUES
('Respiratory distress',
 '["shortness_of_breath","rapid_breathing"]',
 'Respiratory', 'EMERGENCY',
 'EMERGENCY – Difficulty breathing with rapid breathing. Seek emergency care.'),

('Cyanosis',
 '["cyanosis"]',
 'Respiratory', 'EMERGENCY',
 'EMERGENCY – Bluish discoloration detected. This may indicate low oxygen. Call emergency services.'),

('Severe pneumonia signs',
 '["high_fever","cough"]',
 'Respiratory', 'HIGH',
 'WARNING – High fever with cough. Possible severe respiratory infection. Seek medical evaluation.');

-- Diabetes red flags
INSERT INTO red_flag_rules (name, symptom_combo, category, risk_level, message) VALUES
('Diabetic ketoacidosis signs',
 '["confusion","excessive_thirst","frequent_urination"]',
 'Metabolic', 'EMERGENCY',
 'EMERGENCY – Signs of diabetic emergency. Immediate blood sugar testing and medical care recommended.'),

('DKA breath sign',
 '["fruity_breath"]',
 'Metabolic', 'URGENT',
 'URGENT – Fruity-smelling breath may indicate diabetic ketoacidosis. Seek immediate care.'),

('Severe metabolic symptoms',
 '["fatigue","blurred_vision"]',
 'Metabolic', 'HIGH',
 'WARNING – Severe weakness with blurred vision. Blood sugar testing recommended.');

-- Neurological red flags
INSERT INTO red_flag_rules (name, symptom_combo, category, risk_level, message) VALUES
('Thunderclap headache',
 '["severe_headache"]',
 'Neurological', 'HIGH',
 'WARNING – Sudden severe headache. Immediate neurological evaluation recommended.'),

('Headache with vision loss',
 '["headache","vision_loss"]',
 'Neurological', 'EMERGENCY',
 'EMERGENCY – Headache with vision loss requires immediate emergency evaluation.'),

('Headache with unconsciousness',
 '["headache","fainting"]',
 'Neurological', 'EMERGENCY',
 'EMERGENCY – Headache with loss of consciousness. Call emergency services immediately.'),

('Anxiety cardiac emergency',
 '["anxiety","chest_pain","fainting"]',
 'Neurological', 'EMERGENCY',
 'EMERGENCY – Severe anxiety with chest pain and fainting. Seek emergency evaluation.');


-- ═════════════════════════════════════════════════════
-- RECOMMENDATIONS (per disease)
-- ═════════════════════════════════════════════════════

INSERT INTO recommendations (disease_id, lab_tests, specialist, lifestyle_tips) VALUES
((SELECT id FROM diseases WHERE name='Gastritis'),
 'Complete Blood Count (CBC), H. pylori breath/stool test, Upper endoscopy',
 'Gastroenterologist',
 'Avoid spicy and acidic foods, reduce alcohol, eat smaller frequent meals, manage stress'),

((SELECT id FROM diseases WHERE name='Peptic Ulcer Disease'),
 'H. pylori test, Upper GI endoscopy, CBC',
 'Gastroenterologist',
 'Avoid NSAIDs, stop smoking, limit alcohol, eat regular meals, reduce stress'),

((SELECT id FROM diseases WHERE name='Irritable Bowel Syndrome (IBS)'),
 'CBC, Stool test, Celiac serology, Colonoscopy (if needed)',
 'Gastroenterologist',
 'Follow a low-FODMAP diet, increase fiber gradually, regular exercise, stress management'),

((SELECT id FROM diseases WHERE name='Gastroenteritis'),
 'Stool culture, CBC, Electrolyte panel',
 'Gastroenterologist / General Physician',
 'Stay hydrated with ORS, rest, eat bland foods (BRAT diet), avoid dairy temporarily'),

((SELECT id FROM diseases WHERE name='Food Poisoning'),
 'Stool culture, CBC, Blood culture (if severe)',
 'General Physician / Emergency Medicine',
 'Drink plenty of fluids, rest, avoid solid food initially, then eat bland foods'),

((SELECT id FROM diseases WHERE name='Acid Reflux (GERD)'),
 'Upper endoscopy, Esophageal pH monitoring, Barium swallow',
 'Gastroenterologist',
 'Elevate head while sleeping, avoid eating 3 hrs before bed, avoid trigger foods, maintain healthy weight'),

((SELECT id FROM diseases WHERE name='Chronic Constipation'),
 'Thyroid function tests, CBC, Colonoscopy (if age >45)',
 'Gastroenterologist',
 'Increase dietary fiber, drink 8+ glasses of water daily, regular physical activity, establish toilet routine'),

((SELECT id FROM diseases WHERE name='Coronary Artery Disease'),
 'Lipid panel, ECG, Stress test, Coronary angiography',
 'Cardiologist',
 'Heart-healthy diet, regular exercise, stop smoking, manage blood pressure and cholesterol'),

((SELECT id FROM diseases WHERE name='Hypertension'),
 'Blood pressure monitoring, Lipid panel, Renal function tests, ECG',
 'Cardiologist / Internal Medicine',
 'Reduce sodium intake, exercise regularly, maintain healthy weight, limit alcohol, manage stress'),

((SELECT id FROM diseases WHERE name='Angina'),
 'ECG, Stress test, Cardiac enzymes (troponin), Coronary angiography',
 'Cardiologist',
 'Avoid physical overexertion, take prescribed medications, stop smoking, heart-healthy diet'),

((SELECT id FROM diseases WHERE name='Influenza'),
 'Rapid influenza diagnostic test, CBC, Chest X-ray (if complications suspected)',
 'General Physician',
 'Rest, stay hydrated, take fever reducers, isolate to prevent spread, annual flu vaccination'),

((SELECT id FROM diseases WHERE name='Pneumonia'),
 'Chest X-ray, CBC, Sputum culture, Blood oxygen level (pulse oximetry)',
 'Pulmonologist / General Physician',
 'Complete prescribed antibiotics, rest, stay hydrated, use humidifier, deep breathing exercises'),

((SELECT id FROM diseases WHERE name='Type 2 Diabetes'),
 'Fasting blood glucose, HbA1c, Oral glucose tolerance test, Lipid panel',
 'Endocrinologist / Diabetologist',
 'Monitor blood sugar regularly, balanced diet low in refined sugars, regular exercise, maintain healthy weight'),

((SELECT id FROM diseases WHERE name='Migraine'),
 'Neurological exam, MRI/CT scan (to rule out other causes)',
 'Neurologist',
 'Identify and avoid triggers, maintain regular sleep schedule, stay hydrated, stress management techniques'),

((SELECT id FROM diseases WHERE name='Generalized Anxiety Disorder'),
 'Thyroid function tests (to rule out thyroid issues), CBC',
 'Psychiatrist / Psychologist',
 'Cognitive behavioral therapy, regular exercise, mindfulness meditation, limit caffeine, adequate sleep');


-- ═════════════════════════════════════════════════════
-- DEFAULT ADMIN USER (password: admin123)
-- Hash generated with bcrypt
-- ═════════════════════════════════════════════════════

INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@medassist.com',
 '$2b$12$2eQMRcc09QZKSl3Gw1dhgeCRk4lerOIcUQFc.eLUqRJJTfHkAu0sG',
 'admin');
