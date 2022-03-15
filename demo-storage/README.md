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
   | `DB_LINK`           | ` `                     | A remote database'url for connection if you need.            |

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

All available APIs could be found in [Postman exported file](./Projet3A.postman_collection.json). This file could be imported into [Postman](https://www.postman.com/downloads/). The example of requests and responses are also available in the Postman.
