1-vous entrez à votre wsl vous tapez :
    hostname -I
    vous aurez un résultat conatenant deux addresses ips
    ![img.png](img.png)   
    notez celle à gauche dans mon cas 172.26.25.145

2-Vous allez maintenant ouvrir powershell comme administrateur et exécutez cette commande:
     netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=32000 connectaddress=172.26.25.145 connectport=32000
     remplacez 172.26.25.145 par l'address ip obtenez dans 1

3- Testez: >curl http://localhost:32000/v2/_catalog en cmd sur windows
    !!! microk8s doit être en ligne sur votre wsl