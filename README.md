# Indate Patcher
Indate is a patching system focusing on simple technologies everyone can have access. Namely ftp and static http. It combines two programs, a launcher/updater and an uploader. The uploader uploads projects to a normal server through sftp/ftp and the launcher downloads updates on a per file basis using checksums through normal http/https.

This is the launcher/patcher component of the system

### Main Features
- Browser based UI.
- Downloads only updated files by comparing checksums.
- Encrypts update source information.
- Easily extendable.

 ### Setup
- Copy the "_setup.json" file and rename it as "setup.json".
- Edit "setup.json" and input your project information based on Indate Uploader information.
   - For the "server", type in the root url that holds the "indate" directory on the server.
   - The password and user fields are for a future update to password protect the update directory with .htaccess.
- Delete any existing "indate.cfg" file.
- Start the launcher and it will generate a new "indate.cfg" file and delete the "setup.json" file.

 ### Future Updates
- The encryption isn't very secure and can probably be easily beaten. This is just to discourage the average user. Better encryption in the future is a must.
- Could probably save time by keeping the previous update information in a file instead of generating the checksums every launch.

### Indate Uploader
The project uploading part of the system.

https://github.com/zaywolfe/indate-uploader
