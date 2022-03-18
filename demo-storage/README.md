# Storage Service

This web application is for the purpose of testing chrome extension. It uses Flask as web server and SQLite as database.

# Install & Start

To start the web service, you need to:

1. Make sure [Python3](https://www.python.org/downloads/) has been installed

2. Prepare the config file

   1. Make a copy of the file `.env.sample` and rename this copy to `.env`
   2. Change the value if you want

   | Variable            | Default Value           | Description                                                  |
   | ------------------- | ----------------------- | ------------------------------------------------------------ |
   | `API_UPLOAD_FOLDER` | `upload_files`          | The path to the temporarily saved files                      |
   | `BASE_HOST`         | `http://localhost:5001` | The base url to use when building the full url to the files. MUST start with http or https |
   | `PORT`              | `5001`                  | The port of the server, it must be the same as the port in BASE_HOST |
   | `DEFAULT_ACESS_URL` | `all`                   | The default access web site for the resources.               |
   | `DB_LINK`           | ` `                     | A remote database's url for connection if you need.          |

3. Install all dependencies using following commands in command line <u>in this folder</u>

   ```shell
   python3 -m venv venv # Creation of virtual environments
   source venv/bin/activate # Activation of virtual environments
   pip install -r requirements.txt # Install of all necessary dependencies
   ```

4. Start the service using following command

   ```shell
   python3 main.py
   ```

# Available APIs

All available APIs and corresponding examples of requests and responses could be found in [Postman exported file](./Projet3A.postman_collection.json). This file could be imported into [Postman](https://www.postman.com/downloads/) to have a clear view of the API list.

# Architecture

This Flask application consists of three layers:

1. [Controller layer](demo-storage/controller.py)

   This layer is used for the definition of API and possing data format.

2. [Service layer](demo-storage/service.py)

   Business logic is implemented here. Since app's functions are not that difficult, this layer is relatively simple. 

3. [DAO(Data Access Object)](demo-storage/dao.py) and [Model](demo-storage/models.py) layer

   1. DAO helps to CRUD data with database.
   2. Models are exactly database's tables. Most fields are intuitive. Comments help to understand for those fields are not easy to understand.

The process to respond a request begins with the receive of the request at controller. It obtains data from the request and pass it to the corresponding services. The services get the data and retrieve models on using functions offered by DAO. Useful fields are returned back to the controller. The controller encodes the response and sends it back to the frontend.

For the details of ACL(Access Control List), the slide of this project elaborates how it is implemented at present and why we have chosen this way.
