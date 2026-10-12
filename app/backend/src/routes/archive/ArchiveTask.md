Objectif : créer une gestion d'archive de tâches avec deux mode d'archivage : archive instantané et archive basée sur le temps

Créer une colonne dans la table archive : **ArchiveMode** : qui dit soit en mode archive instantanée ou basée sur le temps

Cas : Créer  une tâches archivée tous en récupérent les donnée existant sans perte de donnée

**Utilisation de la transaction** : pour éviter de perdre des donnée car si une donnée est perdu alors l'action échou simplement sans réussite

1. Drag drop dans colonne DONE ==> Post  
2. Post = TaskId + ProjectId + WorkspaceId + UserId + IsArchived (Booleen)
3. Server reçoit = Lire UserId puis quel est le role de l'user  
4. Déplacée la tâches vers la zone d'archive = stocké dans ArchiveCardsTable ==> Insert  

**Transaction : si sa réussi sa passe , si il y'a des donnée qui sont perdu alors l'action à échouer complètement car il y'a pas de perte de donnée qui ne sera tolérer** 

4. Stocké la tâches dans la tâble archive tâches 
5. feeback pour dire que sa à vien était archivée 
6. affichée la tâches

---

Cas : désarchivée une tâches (patch = booleen pour dire si la tâches et archivée ou pas)
Cas : supprimer une ou plusieurs tâches archivée (deleted)
Cas : Possibilité de afficher la tâches (get)
