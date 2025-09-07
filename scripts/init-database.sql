-- Script d'initialisation de la base de données SQLite
-- Ce script sera exécuté pour créer les tables initiales

-- Les tables seront créées automatiquement par Prisma
-- Ce fichier sert de documentation pour la structure de la base

-- Table users: stocke les informations des utilisateurs
-- id: identifiant unique
-- nom: nom complet de l'utilisateur  
-- telephone: numéro de téléphone
-- hotel: nom de l'hôtel
-- createdAt, updatedAt: timestamps automatiques

-- Table pointages: stocke les pointages par date
-- id: identifiant unique
-- date: date du pointage (format string)
-- userId: référence vers l'utilisateur
-- createdAt, updatedAt: timestamps automatiques

-- Table bus_entries: stocke les entrées de bus pour chaque pointage
-- id: identifiant unique
-- matricule: matricule du bus
-- rotations: nombre de rotations (défaut: 1)
-- pointageId: référence vers le pointage
-- createdAt, updatedAt: timestamps automatiques

-- Relations:
-- User 1:N Pointage (un utilisateur peut avoir plusieurs pointages)
-- Pointage 1:N BusEntry (un pointage peut avoir plusieurs bus)
