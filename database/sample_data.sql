-- Éco Loop Sample Data
-- Insert sample data for testing and demo

-- Sample Users
INSERT INTO users (nom, prenom, email, password, telephone, role) VALUES
('Kouam', 'Jean', 'jean.kouam@gmail.com', '$2b$10$hashedpassword1', '+237650123456', 'farmer'),
('Mballa', 'Marie', 'marie.mballa@gmail.com', '$2b$10$hashedpassword2', '+237651234567', 'farmer'),
('Admin', 'System', 'admin@ecoloop.cm', '$2b$10$hashedpassword3', '+237652345678', 'admin');

-- Sample Task Templates for 21-day cycle
INSERT INTO task_templates (duration_type, day_number, task_title, task_description, category, is_critical, estimated_duration_minutes) VALUES
-- Week 1 (Days 1-7)
('21_days', 1, 'Préparation du poulailler', 'Nettoyer et désinfecter le poulailler avant l''arrivée des poussins', 'nettoyage', 1, 120),
('21_days', 1, 'Vérification équipements', 'Vérifier mangeoires, abreuvoirs et système de chauffage', 'surveillance', 1, 60),
('21_days', 2, 'Arrivée des poussins', 'Réceptionner les poussins et les installer', 'surveillance', 1, 90),
('21_days', 2, 'Premier repas', 'Donner le premier aliment démarrage aux poussins', 'alimentation', 1, 30),
('21_days', 3, 'Contrôle température', 'Maintenir température à 32-34°C', 'surveillance', 1, 15),
('21_days', 3, 'Alimentation 3x/jour', 'Distribuer aliment démarrage 3 fois par jour', 'alimentation', 1, 45),
('21_days', 4, 'Nettoyage abreuvoirs', 'Nettoyer et remplir les abreuvoirs', 'nettoyage', 0, 30),
('21_days', 5, 'Contrôle sanitaire', 'Vérifier l''état de santé des poussins', 'sante', 1, 45),
('21_days', 6, 'Changement litière partiel', 'Changer les zones humides de la litière', 'nettoyage', 0, 60),
('21_days', 7, 'Pesée hebdomadaire', 'Peser un échantillon de poussins pour suivre la croissance', 'surveillance', 1, 30),

-- Week 2 (Days 8-14)
('21_days', 8, 'Transition alimentaire', 'Commencer transition vers aliment croissance', 'alimentation', 1, 30),
('21_days', 9, 'Vaccination (si nécessaire)', 'Administrer vaccins selon programme sanitaire', 'sante', 1, 90),
('21_days', 10, 'Ajustement température', 'Réduire température à 28-30°C', 'surveillance', 1, 15),
('21_days', 11, 'Nettoyage complet', 'Nettoyage approfondi du poulailler', 'nettoyage', 1, 120),
('21_days', 12, 'Contrôle croissance', 'Vérifier le développement des poulets', 'surveillance', 1, 45),
('21_days', 13, 'Désinfection équipements', 'Désinfecter mangeoires et abreuvoirs', 'nettoyage', 0, 45),
('21_days', 14, 'Pesée hebdomadaire', 'Deuxième pesée de contrôle', 'surveillance', 1, 30),

-- Week 3 (Days 15-21)
('21_days', 15, 'Aliment finition', 'Passer à l''aliment finition', 'alimentation', 1, 30),
('21_days', 16, 'Préparation vente', 'Identifier acheteurs potentiels', 'surveillance', 0, 60),
('21_days', 17, 'Contrôle poids final', 'Vérifier le poids moyen des poulets', 'surveillance', 1, 45),
('21_days', 18, 'Nettoyage final', 'Derniers nettoyages avant vente', 'nettoyage', 1, 90),
('21_days', 19, 'Préparation transport', 'Organiser transport vers marché/client', 'surveillance', 1, 60),
('21_days', 20, 'Jeûne pre-abattage', 'Arrêter alimentation 12h avant vente', 'alimentation', 1, 15),
('21_days', 21, 'Vente/Abattage', 'Vendre ou abattre les poulets', 'surveillance', 1, 180);

-- Sample Task Templates for 30-day cycle (extended version)
INSERT INTO task_templates (duration_type, day_number, task_title, task_description, category, is_critical, estimated_duration_minutes) VALUES
-- Days 22-30 for extended cycle
('30_days', 22, 'Évaluation cycle', 'Analyser les performances du cycle précédent', 'surveillance', 0, 60),
('30_days', 23, 'Maintenance équipements', 'Entretien complet des équipements', 'nettoyage', 1, 120),
('30_days', 24, 'Formation continue', 'Réviser les bonnes pratiques avicoles', 'surveillance', 0, 90),
('30_days', 25, 'Planification suivant', 'Préparer le prochain cycle d''élevage', 'surveillance', 0, 60),
('30_days', 26, 'Nettoyage désinfection', 'Désinfection complète des installations', 'nettoyage', 1, 150),
('30_days', 27, 'Repos sanitaire début', 'Laisser reposer le poulailler', 'surveillance', 1, 15),
('30_days', 28, 'Commande intrants', 'Commander aliments et médicaments', 'surveillance', 0, 45),
('30_days', 29, 'Repos sanitaire fin', 'Finaliser le repos sanitaire', 'surveillance', 1, 15),
('30_days', 30, 'Préparation nouveau cycle', 'Préparer l''arrivée nouveaux poussins', 'surveillance', 1, 90);

-- Sample Formations
INSERT INTO formations (titre, description, categorie, contenu_type, duree_minutes, ordre_affichage) VALUES
('Les phases d''élevage du poulet de chair', 'Comprendre les différentes phases : démarrage, croissance, finition', 'phases', 'text', 45, 1),
('Choisir la bonne souche de poussin', 'Guide pour sélectionner la souche adaptée à vos objectifs', 'souches', 'text', 30, 2),
('Programme de vaccination', 'Planning complet des vaccinations essentielles', 'vaccins', 'text', 60, 3),
('Alimentation équilibrée', 'Composer une ration alimentaire optimale selon l''âge', 'alimentation', 'text', 40, 4),
('Équipements essentiels', 'Mangeoires, abreuvoirs, chauffage : bien choisir', 'equipement', 'text', 35, 5),
('Biosécurité en élevage', 'Mesures préventives contre les maladies', 'sante', 'text', 50, 6);

-- Sample Forum Posts
INSERT INTO forum_posts (user_id, title, content, category) VALUES
(1, 'Première expérience d''élevage', 'Bonjour à tous, je débute dans l''élevage de poulets de chair. Quels sont vos conseils pour éviter les erreurs courantes ?', 'general'),
(2, 'Problème de mortalité élevée', 'J''ai un taux de mortalité de 15% sur mon dernier lot. Quelles peuvent être les causes ?', 'technique'),
(1, 'Vente de poulets bio', 'Je cherche des débouchés pour mes poulets élevés bio. Des contacts ?', 'marketplace');

-- Sample Forum Comments
INSERT INTO forum_comments (post_id, user_id, content) VALUES
(1, 2, 'Bienvenue ! Le plus important c''est de maintenir la température constante les premiers jours.'),
(1, 3, 'N''oublie pas la biosécurité : désinfecter avant chaque nouveau lot.'),
(2, 1, 'Vérifie la qualité de ton eau et la ventilation du poulailler.'),
(3, 2, 'Tu peux essayer les marchés bio de Yaoundé, ils sont demandeurs.');