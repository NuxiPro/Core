## Gestion de permission && Sécurité RBAC

## 1. Validation Stricte & Sécurité Serveur (Préalable Obligatoire)

Avant d'exécuter la moindre action ou fonctionnalité métiers, le serveur doit valider strictement le contrôle d'accès et les permissions :

* **Qui es-tu ?**  
  * Authentification de l'utilisateur (`UserId`). ==> [fait]
* **Qu'as-tu le droit de faire ?**  
  * Vérification des permissions associées à l'action demandée.
* **Quel est ton rôle ?**  
  * Récupération du rôle attribué à l'utilisateur (`OWNER` , `MEMBER`).
* **Quel est le Workspace que tu as le droit de modifier ?**  
  * Validation de l'appartenance au `WorkspaceId`.
* **Quel est le Projet que tu as le droit de modifier ?**  
  * Validation de l'accès au `ProjectId`.
* **Qui est le propriétaire de ce projet et workspace ?**  
  * Identification et vérification des droits de propriété (`Owner`). ==> identification du propriétaire [fait] et vérification des droit de propriété []


---

[] migrée loops vers plunk
