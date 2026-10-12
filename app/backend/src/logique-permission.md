### Vérification des permission côter serveur 

- Est que tu est authentifier ?
- Quel est ton rôle ?
- Qu'a tu le droit de faire ?

---

#### Vérification du role

Start => 
  Role = type du role
    Alors 
      Si Role = workspaceOwner
        alors
          tu as le droit de faire sa ....

      Si Role = Admin 
        Alors 
          tu as full acces à tous les ressource

      Si Role = workspaceOwner
        Veut accédée au ressource Admin 
          Alors 
            Accés refusée + message "Accès refusé. Cette zone est réservée aux administrateurs."

      Si Role = workspaceOwner
        Veut accéder à un workspace d'un autre user alors que UserId = autre user 
          alors 
            accés refusée + 404 + "Workspace introuvable"

<== end algo


What is your role ?

vérifier le type de role + userId
