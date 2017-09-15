# Welcome!
This repository provides the web application that backs the WEVOTE taxonomic classification system, [More](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0163527).  
This repository includes a server, client, visualization applications. All applications are 
purely implemented in TypeScript. The server application is based on Express.js and mongoose 
libraries and handles all database operations, user sessions, and communication with the WEVOTE computational cpp server [See wevote computational server](https://bitbucket.org/asem_abdelaziz/wevote/overview).  
While the client and visualization applications (the front-end side) is implemented
using the AngularJS framework and d3.js library.

### Prerequisites
* Node v6: [installation instructions](https://nodejs.org/en/download/package-manager/).
* MongoDB: installation instructions [(Linux)](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/) or [(windows)](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) .  
* Wevote computational server (server must be running before running wevote-web server): [installation and running instruction](https://bitbucket.org/asem_abdelaziz/wevote/overview)
</br>

### Building and running the application
#### Clone the project to your local repository:
```
git clone https://bitbucket.org/asem_abdelaziz/wevote-web
```

#### Change directory to wevote-web, then build wevote-web from scratch:
```
cd wevote-web
npm install
npm run build
```

#### Running the application.
##### Before running make sure: 
* The [wevote computational server](https://bitbucket.org/asem_abdelaziz/wevote/overview) is running.
* The MongoDB is running: 
e.g on linux:
```
sudo service mongod start
```

##### Launching Wevote Server:
```
npm start
```
