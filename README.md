# QAPLINE CoockBook

> Prisma migrations does not work, in order to setup db, you have to acquire dump of existing db and import it locally.

> Some parts of app need access to gcloud. So in order to get it working, you need to setup ADC on your machine.

> This project has its own docker-compose.yaml file which sets up all service needed to run this app for you and even runs backend service it self and watches for changes in you current working directory. If you do not have docker, install it first.

## Initial setup:

### Step 1: Clone repository

### Step 2: Install packages

* Run `npm install`

### Step 3: Setup env

* You can create your own setup by **.envExample**, by it is recommended to download **.env** file from projects Confluence
* Create **.env** file in projects root directory
* Insert all needed variables

### Step 4: Login to gcloud

* Install [GCloud CLI](https://cloud.google.com/sdk/gcloud)
* Run `gcloud init` in system terminal
* Go through this command and select qapline project
* Run `gcloud auth application-default login`

### Step 5: Run docker containers

* Go to docker.dev directory `cd docker.dev`
* Run command `docker compose up` and wait

### Step 6: Import database

* For this step, we are going to use DBeaver (database administration tool). You can download it [here](https://dbeaver.io/download/)
* In DBeaver, create new connection with parameters below
* Database: PostgreSQL, Host: 127.0.0.1,Port: 5432, Username/Password/Database are specified in docker-compose.yaml in docker.dev directory
* After sucessful connection, you can right click database and click on Tools > Restore and restore database from dump (can be found in Confluence)

### Step 7: Done

## DB Connection

Database is accessible using identity-aware proxy
```
gcloud compute start-iap-tunnel qapline-db-${mono/dev/prod} 49208 
--local-host-port=localhost:5432 
--zone=europe-west3-c
```
