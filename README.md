Para el desarrollo:

- En Eclipse:
	Instalar el plugin JBoss en Help --> Eclipse Marketplace	
- Otro: 
	- se recomienda usar Atom o Sublime Text 3
En los dos casos hay que actualizar con el repositorio de SVN (usando el eclipse o si se puede con la consola).
	

Preparar entorno de desarrollo:

NOTAS PARA WINDOWS:

- Ejecutar la consola como administrador.
- Cerrar y volver a abrir la consola después de efectuar cambios al PATH para que tomen efecto estos cambios.
- Para agregar/modificar las variables de entorno:
    Clickear "Inicio" => Buscar variables de entorno => Editar variables de entorno del sistema => Variables de entorno
    En esa ventana nos importa la parte de "Variables del sistema".


NOTAS PARA UNIX:
- Para agregar/modificar las variables de entorno se tiene que crear o modificar "~/.bash_profile"

PASOS:

- Descargar Node.js desde: https://nodejs.org/en/download/ eligiendo la versión correcta del SO.
- Instalar Cordova usando la consola:
    En Unix: 
        $ sudo npm install -g cordova

    En Windows:
        $ npm install -g cordova

- Instalar Ionic usando la consola:
    En Unix: 
        $ sudo npm install -g ionic

    En Windows:
        $ npm install -g ionic

- Instalar (si no existe) el Java JDK más reciente.
- Agregar una variable de entorno "JAVA_HOME" que apunta a la carpeta donde esta el JDK instalado.
Luego agregar a la variable global "PATH" la ruta a la carpeta "bin" dentro de la carpeta del JDK instalado.
    En Unix:
        - $ export JAVA_HOME=/ruta-al-JDK/jdk1.8.0_131
        - $ export PATH=${PATH}:/ruta-al-JDK/jdk1.8.0_131/bin

    En Windows:
        - En "Variables del sistema" clickear "Nueva..."
        - Nombre de la variable: JAVA_HOME
        - Valor de la variable: C:\ruta-al-JDK\jdk1.8.0_131
        - Aceptar
        - clickear sobre la variable "Path"
        - Editar
        - Nuevo
        - %JAVA_HOME%\bin
        - Aceptar
        - Aceptar

- Instalar Android Studio desde https://developer.android.com/studio/index.html. Más detalles de la instalación se encuentran en la página.
- Instalar los paquetes de Android SDK que son los siguientes:
    - Android Platform SDK for your targeted version of Android
    - Android SDK build-tools version 19.1.0 or higher
    - Android Support Repository (found under "Extras")
    - más detalles sobre actualizar las herramientas de SDK en https://developer.android.com/studio/intro/update.html

- Agregar una variable de entorno "ANDROID_HOME" que apunta a la carpeta donde esta el Android SDK instalado.
Luego agregar a la variable global "PATH" la ruta a la carpeta "bin" dentro de la carpeta del Android SDK instalado.
    En Unix:
        - $ export ANDROID_HOME=/ruta-al-android-sdk/
        - $ export PATH=${PATH}:/ruta-al-android-sdk/platform-tools:/ruta-al-android-sdk/tools

    En Windows:
        - En "Variables del sistema" clickear "Nueva..."
        - Nombre de la variable: ANDROID_HOME
        - Valor de la variable: C:\ruta-al-android-sdk
        - Aceptar
        - clickear sobre la variable "Path"
        - Editar
        - Nuevo
        - %ANDROID_HOME%\tools
        - Nuevo
        - %ANDROID_HOME%\platform-tools
        - Aceptar

- Instalar Gradle desde https://gradle.org/install/ y seguis los pasos, que sea para Unix o Windows, modificando la varibale "Path"
 y agregarle una linea más que es la ruta a la carpeta "bin" dentro de la carpeta de Gradle instalada.


Actualizar las librerías/plugins con npm y/o bower:

- click derecho sobre el proyecto.
- Run as -> npm install
- Otra vez, Run as -> bower install

Carpetas/archivos que nunca hay que subir al SVN:

- merges 
- node_modules
- platforms
- plugins
- www/lib
- setting
- .project
- .cordova

Para emular la app en un android virtual o un ios(solamente con Mac):

- Desde 

