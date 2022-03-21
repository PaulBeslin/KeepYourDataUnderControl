# Keep Control of Your Data

\[EN\] This repository contains a draft proposal of a system to give the control of the personal data back to their real owners, created for research purposes. This is the work of two successive groups of engineering students of [IMT Atlantique](https://www.imt-atlantique.fr/en) during the academic years of 2020-2021 and 2021-2022. You can find the work inherited from the 2020-2021 group [here](https://gitlab.inria.fr/alebre/teaching-keepyourdata) or [here](https://github.com/bastantoine/KeepYourDataUnderControl).  
Following is an introduction to the concepts and principles of our work, in english and in french. The details of what has been done and tried and the ideas we give as a suggestion for the team that will replace us are only available in french.

\[FR\] Ce repository contient une ébauche de proposition de système permettant de rendre le contrôle des données personnelles à leur propriétaire légitime, créé à des fins de recherche. Il s'agit du travail de deux groupes successifs d'élèves d'[IMT Atlantique](https://www.imt-atlantique.fr) pendant les années 2020-2021 et 2021-2022. Vous pouvez trouver le travail hérité du premier groupe [ici](https://gitlab.inria.fr/alebre/teaching-keepyourdata).  
Ce qui suit est une introduction aux concepts et principes de notre travail, en anglais et en français. Les détails de ce qui a été fait et essayé à ce stade et les idées que nous offrons comme suggestions à nos successeurs ne sont qu'en français. 

- [1. English](#1-english)
  - [1.1 Concept](#11-concept)
    - [1.1.1 Working principles](#111-working-principles)
      - [1.1.1.1 *Catch-Store-Send* Principle](#1111-catch-store-send-principle)
      - [1.1.1.2 *Get-Show* Principle](#1112-get-show-principle)
- [2. Français](#2-fran%C3%A7ais)
  - [2.1. Idée proposée](#21-id%C3%A9e-propos%C3%A9e)
    - [2.1.1 Principes de fonctionnement](#211-principes-de-fonctionnement)
  - [2.2. Ce qui a été fait](#22-ce-qui-a-%C3%A9t%C3%A9-fait)
  - [2.3. Ce qu'il reste à faire](#23-ce-quil-reste-%C3%A0-faire)

## 1. English

### 1.1 Concept
In this project, we wanted to develop a solution that would allow internet users to really take back the control of their personal data. This solution is organized in two main parts:

1. The separation of the actors hosting the personal data from those using it. This way the services requesting the data to the user and using them would simply no longer have them, and would instead have fake data with a link pointing to the real data.
2. The implementation of an intermediate actor that would be there as a relay between the service hosting the data and the one using them. This intermediate actor would also be responsible of making sure the real data stays visible to the users that would only see them.

#### 1.1.1 Working principles

Because the data would not longer be stored by the service using them, we had to design new ways to be able to send them, as well as see them, and the most seamless way possible for the end user. To that extent we have designed two principles that are to be implemented in the intermediate actor:

1. The [*Catch-Store-Send* principle](#111-catch-store-send-principle)
2. The [*Get-Show* principle](#112-get-show-principle)

Because this solution should be able to work on every services, whether or not their are designed to work with our solution, we had to find a way to include the link pointing to the user's data in the data that are sent to the service. We also had to find a way to respect the type of ressources requested, even for the fake data. So if the service asked for a picture, we have to send him a picture.

For the text-based data, there was no real problem because the links are also text. It would probably be necessary though to include it in some kind of template, to avoid possible issues in the sending as well as simplify the fetch in the source of the page.

For image-based ressources we decided to include the link inside a QR Code that is sent to the service. This way in the *Get-Show* principle, when getting the real data from the link, the intermediate actor simply has to decode the QR Code to get the link to the real image.

##### 1.1.1.1. *Catch-Store-Send* Principle

This principle is responsible for the storage of the personal data in a secure place as well as the sending of fake placeholder data to the final service. It works the following way:

1. When a user submits a form with data inside it, the intermediate actor intercepts and blocks the sending,
2. It then loops over each personal data the user has filled, and for each:
   1. Sends it to the user's remote storage
   2. Receives a link pointing to the original data from the remote storage
   3. Replaces the original data with the link
3. Send the form updated with the links to the service

##### 1.1.1.2. *Get-Show* Principle

This principle is responsible for display of the personal data to the final user, in place of the placeholder links to the data. It works the following way:

1. When the user visits a web page, the intermediate actor will scan the page to detect all links pointing to a distant user data
2. For each link found, it will:
   1. Get the data behind the link
   2. Transform the data to get the final version if needed (especially if the link points to an image)
3. Show the final data to the end user

***

## 2. Français
### 2.1. Idée proposée

Au sein de ce projet nous avons souhaité mettre en place une solution permettant aux utilisateurs de reprendre réellement le contrôle de leur données. Cette solution s'articule en deux points clés :

1. La séparation des acteurs hébergeant les données personnelles de ceux les utilisant. Ainsi les services demandant et utilisant des données ne les auraient tout simplement plus, et auraient à la place des fausses données contenant les liens pointant vers les vraies données.
2. La mise en place d’un acteur intermédiaire permettant de faire le lien entre le service hébergeur de données et celui qui les utilise. C'est cet acteur qui permettrait que les données personnelles soient toujours visibles pour les utilisateurs des service qui ne feraient que les consulter.

La solution recherchée doit respecter deux contraintes assez fortes :

1. Elle doit pouvoir fonctionner sur n'importe quel service utilisant des données personnelles, quelque soit leur forme ou leur volume, et peut importe que ce service soit conçu pour ou non.
2. Son utilisation doit être la plus transparente possible pour l’utilisateur final.

#### 2.1.1. Principes de fonctionnement

Les données n'étant plus stockées sur le service les utilisant, il a fallu concevoir de nouvelles manières pour permettre de stocker et afficher les données personnelles, et ce de manière la plus transparente possible. Pour ce faire nous avons conçu deux principes :

1. Le principe *Interception-Stockage-Envoi* (*ISE*) (voir *fig. 1*)
2. Le principe *Récupération-Affichage* (*RA*) (voir *fig. 2*)

Puisque notre solution devait pouvoir fonctionner sur tous les services, il nous fallait trouver un moyen d'intégrer les liens vers les données personnelles dans les données que nous renvoyons. Il fallait aussi respecter le type de ressources demandée, même pour des fausses données : si le service demande une image, il faut lui envoyer une image.

Pour des textes, le problèmes est vite résolu, puisqu'il suffit d'envoyer le lien reçu (il est toutefois probablement nécessaire de l'inclure dans une sorte de template, afin d'éviter des problèmes qui pourrait subvenir lors de l'envoi, et afin de le localiser plus facilement dans la page).

Pour des images, nous avons décidé d'inclure les liens dans des QR codes que nous envoyons ensuite au service. Ainsi lors de la récupération des données, le service envoie le QR code, nous le décodons pour avoir le lien contenu dedans et pouvons ensuite récupérer et afficher l'image.

![](./ressources/images/Principe-ISE.jpg)

![](./ressources/images/Principe-RA.jpg)

### 2.2. Ce qui a été fait

La réalisation de ce projet repose sur deux parties :

- le développement d’une [extension pour navigateur](extension/README.md) permettant de réaliser le rôle de l’acteur intermédiaire;
- la conception d'une [application de stockage](demo-storage/README.md) des ressources client indépendante.

Au stade actuel, ces deux outils permettent de remplacer des ressources texte et image par des urls, et de traduire ces dernières pour visionner les ressources. Il existe une ébauche d'interface de gestion de la base de données depuis l'extension, et quelques méthodes de sécurisation du stockage ont été mises en place, comme des access lists discriminant par site.
Le système fonctionne actuellement sur LinkedIn et Facebook.

### 2.3. Ce qu'il reste à faire

Nous conseillons à ceux qui hériteraient éventuellement de ce projet de se tourner vers les problématiques suivantes:
- la gestion des ressources vidéo, en créant des vidéos qui auraient pour seule image le QR code qui mène vers la ressource;
- l'amélioration de l'interface de gestion de la base de données, qui n'est qu'une ébauche peu ergonomique à ce stade.
S'ils décident de se re-pencher vers des fonctionnalités déjà mises en place, nous leur suggérons de jeter un oeil aux documents qui décrivent nos difficultés plus en détail, afin de ne pas s'enfoncer dans les mêmes impasses que nous.
